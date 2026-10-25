import { NextResponse } from "next/server";
import { createId, getStore, saveStore } from "@/lib/runtime-store";
import { requireApiUser } from "@/lib/api-auth";
import { chunkText } from "@/lib/retrieval";

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_CHARS = 100_000;

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "无法解析上传内容。" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "请选择文档。" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "单份资料不能超过 10MB。" }, { status: 413 });
  if (!/\.(txt|md)$/i.test(file.name)) {
    return NextResponse.json({ error: "当前版本支持 TXT 和 Markdown 文件（PDF 解析接入中）。" }, { status: 415 });
  }

  const content = (await file.text()).slice(0, MAX_CHARS);
  if (!content.trim()) return NextResponse.json({ error: "文件内容为空。" }, { status: 400 });

  const id = createId("doc");
  // 引用片段数来自真实切块结果，不再按字数估算。
  const chunks = chunkText(id, file.name, "upload", content);

  const doc = {
    id,
    title: file.name,
    sourceType: "upload",
    content,
    citations: chunks.length,
    createdAt: new Date().toISOString(),
  };

  getStore().documents.unshift(doc);
  saveStore();

  return NextResponse.json({ document: doc }, { status: 201 });
}

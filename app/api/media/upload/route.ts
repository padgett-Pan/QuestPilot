import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { createId, getStore, saveStore } from "@/lib/runtime-store";
import { requireApiUser } from "@/lib/api-auth";

const MAX_BYTES = 200 * 1024 * 1024;
const ALLOWED = new Set([
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "video/mp4",
  "video/webm",
]);

const uploadDir = path.join(process.cwd(), "uploads");

function safeName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_").slice(-80) || "upload";
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "无法解析上传数据，请重新选择文件。" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "请选择音频或视频文件。" }, { status: 400 });
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "支持 MP3、WAV、MP4 和 WebM。" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "单文件不能超过 200MB。" }, { status: 413 });
  }

  const mediaId = createId("media");
  const storageKey = `${mediaId}-${safeName(file.name)}`;

  // 真实落盘：uploads/ 已在 .gitignore 中，不会进入提交。
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, storageKey), Buffer.from(await file.arrayBuffer()));

  const media = {
    id: mediaId,
    name: file.name,
    kind: file.type.startsWith("audio") ? ("AUDIO" as const) : ("VIDEO" as const),
    size: file.size,
    storageKey,
    status: "QUEUED" as const,
    progress: 0,
    createdAt: new Date().toISOString(),
  };

  getStore().media.unshift(media);
  saveStore();

  return NextResponse.json({ ok: true, media, mode: "local-disk" }, { status: 201 });
}

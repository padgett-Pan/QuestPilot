import { NextResponse } from "next/server";
import { z } from "zod";
import { answerWithContext } from "@/lib/ai";
import { getStore } from "@/lib/runtime-store";
import { requireApiUser } from "@/lib/api-auth";
import { retrieve } from "@/lib/retrieval";

const input = z.object({ query: z.string().min(1).max(400) });

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const parsed = input.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "请输入 1–400 字的问题。" }, { status: 400 });
  }

  const documents = getStore().documents;
  if (documents.length === 0) {
    return NextResponse.json({
      answer: "知识库还没有资料。先上传一份 TXT / Markdown 赛题资料，再提问就能得到带片段定位的回答。",
      citations: [],
      retrieval: { totalChunks: 0, hits: 0, method: "tf-idf-bigram" },
      mode: "empty",
    });
  }

  const { hits, totalChunks } = retrieve(parsed.data.query, documents, 3);

  if (hits.length === 0) {
    return NextResponse.json({
      answer: "已索引的资料中没有命中该问题的片段。可以换一个更具体的关键词，或先导入相关资料。",
      citations: [],
      retrieval: { totalChunks, hits: 0, method: "tf-idf-bigram" },
      mode: "no-hit",
    });
  }

  const { answer, mode } = await answerWithContext(parsed.data.query, hits);

  return NextResponse.json({
    answer,
    citations: hits.map((hit) => ({
      title: hit.chunk.title,
      quote: hit.chunk.text.slice(0, 180),
      source: hit.chunk.sourceType,
      chunkIndex: hit.chunk.index,
      charRange: [hit.chunk.start, hit.chunk.end],
      score: Number(hit.score.toFixed(4)),
    })),
    retrieval: { totalChunks, hits: hits.length, method: "tf-idf-bigram" },
    mode,
  });
}

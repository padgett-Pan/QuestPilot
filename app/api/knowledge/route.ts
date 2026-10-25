import { NextResponse } from "next/server";
import { getStore } from "@/lib/runtime-store";
import { requireApiUser } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

/** 列出知识库条目。不返回正文，避免列表接口携带大段文本。 */
export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const documents = getStore().documents.map((doc) => ({
    id: doc.id,
    title: doc.title,
    sourceType: doc.sourceType,
    citations: doc.citations,
    chars: doc.content.length,
    createdAt: doc.createdAt,
  }));

  return NextResponse.json({ documents });
}

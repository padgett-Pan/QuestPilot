import { NextResponse } from "next/server";
import { getStore } from "@/lib/runtime-store";
import { requireApiUser } from "@/lib/api-auth";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const media = getStore().media.find((candidate) => candidate.id === id); return media ? NextResponse.json(media) : NextResponse.json({ error: "媒体任务不存在。" }, { status: 404 });
}

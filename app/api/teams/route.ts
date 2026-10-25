import { NextResponse } from "next/server";
import { z } from "zod";
import { getStore, saveStore } from "@/lib/runtime-store";
import { requireApiUser } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  return NextResponse.json({ team: getStore().team });
}

const renameInput = z.object({ name: z.string().min(2).max(60) });

/** 只有指导教师可以改团队名。当前为单团队演示，这一段就是权限边界。 */
export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  if (auth.user.role !== "TEACHER") {
    return NextResponse.json({ error: "只有指导教师可以修改团队信息。" }, { status: 403 });
  }

  const parsed = renameInput.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "团队名称需为 2–60 个字符。" }, { status: 400 });
  }

  const store = getStore();
  store.team.name = parsed.data.name.trim();
  saveStore();

  return NextResponse.json({ team: store.team });
}

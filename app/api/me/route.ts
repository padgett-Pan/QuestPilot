import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getStore, saveStore } from "@/lib/runtime-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

const patchInput = z.object({
  name: z.string().min(2).max(40).optional(),
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "请先登录后再操作。" }, { status: 401 });

  const parsed = patchInput.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "姓名需为 2–40 个字符。" }, { status: 400 });
  }

  const store = getStore();
  const target = store.users.find((candidate) => candidate.id === user.id);
  if (!target) return NextResponse.json({ error: "账号不存在。" }, { status: 404 });

  if (parsed.data.name) {
    target.name = parsed.data.name.trim();
    // 同步团队展示名，保持一处修改全局一致
    const member = store.team.members.find((item) => item.id === target.id);
    if (member) member.name = target.name;
  }

  saveStore();
  return NextResponse.json({ user: { id: target.id, name: target.name, email: target.email, role: target.role } });
}

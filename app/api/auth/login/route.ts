import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createSession, getStore, normalizeEmail, verifyPassword } from "@/lib/runtime-store";

const input = z.object({
  email: z.string().min(3).max(200),
  password: z.string().min(1).max(200),
});

// 账号不存在时也跑一次等价开销的哈希比较，避免通过响应时间枚举账号。
const DUMMY_HASH = `scrypt$${"00".repeat(16)}$${"00".repeat(64)}`;

export async function POST(request: Request) {
  const parsed = input.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "请输入邮箱和密码。" }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);
  const user = getStore().users.find((candidate) => normalizeEmail(candidate.email) === email);

  const ok = verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) {
    return NextResponse.json({ error: "邮箱或密码不正确。" }, { status: 401 });
  }

  const token = createSession(user.id);
  (await cookies()).set("questpilot_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, role: user.role },
    redirect: "/dashboard",
  });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { createId, createSession, getStore, normalizeEmail, passwordHash } from "@/lib/runtime-store";
import { cookies } from "next/headers";

const input = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  name: z.string().min(2).max(40),
});

export async function POST(request: Request) {
  const parsed = input.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "请输入有效的姓名、邮箱和至少 8 位密码。" }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);
  const store = getStore();
  if (store.users.some((user) => normalizeEmail(user.email) === email)) {
    return NextResponse.json({ error: "邮箱已经注册。" }, { status: 409 });
  }

  const user = {
    id: createId("user"),
    email,
    name: parsed.data.name.trim(),
    passwordHash: passwordHash(parsed.data.password),
    // 演示环境未接入邮件服务，使用 true 表示未启用邮箱验证流程。
    role: "STUDENT" as const,
    verified: true,
  };

  store.users.push(user);
  const token = createSession(user.id);
  (await cookies()).set("questpilot_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json(
    { ok: true, user: { id: user.id, email: user.email, name: user.name }, message: "账号已创建。" },
    { status: 201 },
  );
}

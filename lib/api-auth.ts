import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserBySession } from "@/lib/runtime-store";

export async function requireApiUser() {
  const token = (await cookies()).get("questpilot_session")?.value;
  const user = getUserBySession(token);
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "请先登录后再操作。" }, { status: 401 }) };
  }
  return { user, response: null };
}

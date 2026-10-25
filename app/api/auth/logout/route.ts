import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroySession } from "@/lib/runtime-store";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("questpilot_session")?.value;
  destroySession(token);
  cookieStore.delete("questpilot_session");
  return NextResponse.json({ ok: true });
}

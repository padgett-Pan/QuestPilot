import { cookies } from "next/headers";
import { getUserBySession } from "@/lib/runtime-store";

export async function getCurrentUser() {
  const token = (await cookies()).get("questpilot_session")?.value;
  return getUserBySession(token);
}

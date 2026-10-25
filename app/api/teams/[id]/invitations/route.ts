import { NextResponse } from "next/server";
import { getStore, saveStore } from "@/lib/runtime-store";
import { requireApiUser } from "@/lib/api-auth";

export async function POST(request: Request) { const auth = await requireApiUser(); if (auth.response) return auth.response; const body = await request.json().catch(() => ({})); if (!body.email) return NextResponse.json({ error: "请输入邮箱。" }, { status: 400 }); const invitation = { email: body.email, status: "PENDING", createdAt: new Date().toISOString(), invitedBy: auth.user.id }; getStore().team.invitations.push(invitation); saveStore(); return NextResponse.json({ invitation }, { status: 201 }); }

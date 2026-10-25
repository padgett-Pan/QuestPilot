import { NextResponse } from "next/server";
import { createId, getStore, saveStore } from "@/lib/runtime-store";
import { requireApiUser } from "@/lib/api-auth";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { const auth = await requireApiUser(); if (auth.response) return auth.response; const { id } = await context.params; const review = getStore().reviews.find((candidate) => candidate.id === id); if (!review) return NextResponse.json({ error: "评审不存在。" }, { status: 404 }); const body = await request.json().catch(() => ({})); if (!body.body) return NextResponse.json({ error: "批注不能为空。" }, { status: 400 }); review.comments.push({ id: createId("comment"), author: auth.user.name, body: body.body, createdAt: new Date().toISOString() }); saveStore(); return NextResponse.json({ review }); }

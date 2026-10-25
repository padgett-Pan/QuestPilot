import { NextResponse } from "next/server";
import { getStore } from "@/lib/runtime-store";
import { requireApiUser } from "@/lib/api-auth";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) { const auth = await requireApiUser(); if (auth.response) return auth.response; const { id } = await context.params; const review = getStore().reviews.find((candidate) => candidate.id === id); return review ? NextResponse.json({ review }) : NextResponse.json({ error: "评审不存在。" }, { status: 404 }); }

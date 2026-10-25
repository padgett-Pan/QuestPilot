import { NextResponse } from "next/server";
import { getStore, saveStore } from "@/lib/runtime-store";
import { requireApiUser } from "@/lib/api-auth";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await context.params; const plan = getStore().plans.find((candidate) => candidate.id === id); if (!plan) return NextResponse.json({ error: "计划不存在。" }, { status: 404 });
  const body = await request.json().catch(() => ({})); Object.assign(plan, { ...body, updatedAt: new Date().toISOString() }); saveStore(); return NextResponse.json({ plan });
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) { const auth = await requireApiUser(); if (auth.response) return auth.response; const { id } = await context.params; const plan = getStore().plans.find((candidate) => candidate.id === id); return plan ? NextResponse.json({ plan }) : NextResponse.json({ error: "计划不存在。" }, { status: 404 }); }

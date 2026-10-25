import { NextResponse } from "next/server";
import { createId, getStore, saveStore } from "@/lib/runtime-store";
import { requireApiUser } from "@/lib/api-auth";

export async function POST(request: Request) { const auth = await requireApiUser(); if (auth.response) return auth.response; const body = await request.json().catch(() => ({})); let parsed: URL; try { parsed = new URL(body.url); } catch { return NextResponse.json({ error: "请输入有效的网址。" }, { status: 400 }); } if (!["http:", "https:"].includes(parsed.protocol)) return NextResponse.json({ error: "网址必须使用 HTTP 或 HTTPS。" }, { status: 400 }); const doc = { id: createId("doc"), title: body.title ?? parsed.href, sourceType: "url", content: `网页资料：${parsed.href}\n\n当前本地演示记录了导入链接；网页抓取与分段索引需部署网页导入服务后启用。`, citations: 1, createdAt: new Date().toISOString() }; getStore().documents.unshift(doc); saveStore(); return NextResponse.json({ document: doc, mode: "link-record" }, { status: 201 }); }

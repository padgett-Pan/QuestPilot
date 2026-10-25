import { NextResponse } from "next/server";
import { getStore } from "@/lib/runtime-store";
import { requireApiUser } from "@/lib/api-auth";

export async function GET() { const auth = await requireApiUser(); if (auth.response) return auth.response; const store = getStore(); return NextResponse.json({ plan: store.plans[0], documents: store.documents, media: store.media, reviews: store.reviews, team: store.team }); }

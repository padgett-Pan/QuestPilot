import { NextResponse } from "next/server";
import { getStore } from "@/lib/runtime-store";
import { requireApiUser } from "@/lib/api-auth";

export async function GET() { const auth = await requireApiUser(); if (auth.response) return auth.response; return NextResponse.json({ reviews: getStore().reviews }); }

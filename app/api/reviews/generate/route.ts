import { NextResponse } from "next/server";
import { createId, getStore, saveStore } from "@/lib/runtime-store";
import { requireApiUser } from "@/lib/api-auth";
import { generateReview, type ReviewInput } from "@/lib/review";

export async function POST() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const store = getStore();
  const plan = store.plans[0];

  const input: ReviewInput = {
    plan,
    tasks: plan?.tasks ?? [],
    documents: store.documents,
    media: store.media,
    teamSize: store.team.members.length,
    commentCount: store.team.invitations.length + store.reviews.reduce((sum, r) => sum + r.comments.length, 0),
  };

  const { review, source } = await generateReview(input);
  const stored = { ...review, id: createId("review") };
  store.reviews.unshift(stored);
  saveStore();

  return NextResponse.json({ source, review: stored });
}

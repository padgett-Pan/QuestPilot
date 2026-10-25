import { NextResponse } from "next/server";
import { z } from "zod";
import { generatePlan } from "@/lib/ai";
import { createId, getStore, saveStore } from "@/lib/runtime-store";
import { requireApiUser } from "@/lib/api-auth";

const input = z.object({
  goal: z.string().min(2).max(400).optional(),
  team: z.string().max(200).optional(),
  skills: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const parsed = input.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "目标描述需在 2–400 字以内。" }, { status: 400 });
  }

  const goal = parsed.data.goal ?? "完成 AI Web 竞赛作品";
  const team = parsed.data.team ?? "三人学生团队 + 一名指导教师";
  const skills = parsed.data.skills ?? "React、AI Agent、RAG、产品设计";

  const { plan, source } = await generatePlan({ goal, team, skills });

  const stored = {
    id: createId("plan"),
    title: plan.title,
    summary: plan.summary,
    goal,
    risks: plan.risks,
    source,
    updatedAt: new Date().toISOString(),
    tasks: plan.phases.flatMap((phase) =>
      phase.tasks.map((task) => ({
        id: createId("task"),
        title: task.title,
        description: task.description,
        phase: phase.name,
        owner: task.owner,
        priority: task.priority,
        status: "TODO",
        progress: 0,
      })),
    ),
  };

  const store = getStore();
  store.plans.unshift(stored);
  saveStore();

  return NextResponse.json({ source, plan: { ...plan, id: stored.id, tasks: stored.tasks } });
}

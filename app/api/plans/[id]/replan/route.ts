import { NextResponse } from "next/server";
import { z } from "zod";
import { generatePlan } from "@/lib/ai";
import { getStore, saveStore } from "@/lib/runtime-store";
import { requireApiUser } from "@/lib/api-auth";

const input = z.object({
  goal: z.string().min(2).max(400).optional(),
  team: z.string().max(200).optional(),
  skills: z.string().max(200).optional(),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const { id } = await context.params;
  const plan = getStore().plans.find((candidate) => candidate.id === id);
  if (!plan) return NextResponse.json({ error: "计划不存在。" }, { status: 404 });

  const parsed = input.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "重规划参数不合法。" }, { status: 400 });
  }

  const { plan: next, source } = await generatePlan({
    goal: parsed.data.goal ?? plan.goal,
    team: parsed.data.team ?? "学生 + 指导教师",
    skills: parsed.data.skills ?? "React、RAG、Agent、产品设计",
  });

  plan.title = next.title;
  plan.summary = next.summary;
  plan.risks = next.risks;
  plan.source = source;
  plan.tasks = next.phases.flatMap((phase) =>
    phase.tasks.map((task) => ({
      id: `task_${crypto.randomUUID()}`,
      title: task.title,
      description: task.description,
      phase: phase.name,
      owner: task.owner,
      priority: task.priority,
      status: "TODO",
      progress: 0,
    })),
  );
  plan.updatedAt = new Date().toISOString();
  saveStore();

  return NextResponse.json({ source, plan });
}

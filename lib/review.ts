import { z } from "zod";
import { isTextModelConfigured } from "@/lib/ai";
import type { RuntimeDocument, RuntimeMedia, RuntimePlan, RuntimeReview, RuntimeTask } from "@/lib/runtime-store";

export const RUBRIC = [
  { label: "AI 技术深度", weight: 0.35 },
  { label: "创新性", weight: 0.25 },
  { label: "前端工程质量", weight: 0.1 },
  { label: "实用性", weight: 0.1 },
  { label: "用户体验", weight: 0.1 },
  { label: "社会价值与商业潜力", weight: 0.1 },
] as const;

const reviewSchema = z.object({
  summary: z.string(),
  dimensions: z.array(z.object({ label: z.string(), score: z.number(), evidence: z.string() })).min(3),
  actions: z.array(z.string()).min(1),
});

export type ReviewInput = {
  plan?: RuntimePlan;
  tasks: RuntimeTask[];
  documents: RuntimeDocument[];
  media: RuntimeMedia[];
  teamSize: number;
  commentCount: number;
};

/**
 * 把项目当前状态压成一段可阅读的事实清单。
 * 评分必须建立在这段清单上，而不是一个写死的 78 分。
 */
export function collectEvidence(input: ReviewInput) {
  const done = input.tasks.filter((task) => task.status === "DONE").length;
  const avgProgress = input.tasks.length
    ? Math.round(input.tasks.reduce((sum, task) => sum + task.progress, 0) / input.tasks.length)
    : 0;
  const totalChunks = input.documents.reduce((sum, doc) => sum + doc.citations, 0);
  const completedMedia = input.media.filter((item) => item.status === "COMPLETED").length;
  const phases = new Set(input.tasks.map((task) => task.phase)).size;

  const facts = {
    tasksTotal: input.tasks.length,
    tasksDone: done,
    avgProgress,
    phases,
    documents: input.documents.length,
    totalChunks,
    mediaTotal: input.media.length,
    completedMedia,
    teamSize: input.teamSize,
    commentCount: input.commentCount,
    planSource: input.plan?.source ?? "unknown",
    modelConfigured: isTextModelConfigured(),
  };

  const lines = [
    `计划阶段数：${facts.phases}；任务 ${facts.tasksDone}/${facts.tasksTotal} 已完成，平均进度 ${facts.avgProgress}%`,
    `知识库资料 ${facts.documents} 份，共 ${facts.totalChunks} 个可引用片段`,
    `媒体任务 ${facts.mediaTotal} 个，其中 ${facts.completedMedia} 个已完成分析`,
    `团队成员 ${facts.teamSize} 人，教师/团队批注 ${facts.commentCount} 条`,
    `计划来源：${facts.planSource}；文本模型：${facts.modelConfigured ? "已配置" : "未配置"}`,
  ];

  return { facts, lines, text: lines.join("\n") };
}

/** 无模型时的启发式评分：公式固定、输入真实，分数随项目状态变化。 */
function heuristicReview(input: ReviewInput, evidence: ReturnType<typeof collectEvidence>): RuntimeReview {
  const { facts } = evidence;
  const coverage = Math.min(1, facts.totalChunks / 20);
  const progress = facts.avgProgress / 100;
  const mediaReady = facts.completedMedia > 0 ? 1 : 0;
  const hasFeedback = facts.commentCount > 0 ? 1 : 0;
  const teamReady = facts.teamSize >= 3 ? 1 : 0;

  const raw: Record<string, number> = {
    "AI 技术深度": 40 + 30 * coverage + 20 * progress + 10 * mediaReady,
    "创新性": 55 + 25 * coverage + 20 * Math.min(1, facts.phases / 4),
    "前端工程质量": 60 + 25 * progress + 15 * teamReady,
    "实用性": 55 + 25 * progress + 20 * hasFeedback,
    "用户体验": 60 + 20 * coverage + 20 * progress,
    "社会价值与商业潜力": 50 + 25 * coverage + 25 * hasFeedback,
  };

  const dimensions = RUBRIC.map((item) => ({
    label: item.label,
    score: Math.max(0, Math.min(100, Math.round(raw[item.label]))),
    evidence:
      item.label === "AI 技术深度"
        ? `${facts.totalChunks} 个片段 / 模型${facts.modelConfigured ? "已配置" : "未配置"} / 媒体完成 ${facts.completedMedia}`
        : `平均进度 ${facts.avgProgress}%，资料 ${facts.documents} 份，批注 ${facts.commentCount} 条`,
  }));

  const total = Math.round(
    dimensions.reduce((sum, dim) => {
      const weight = RUBRIC.find((item) => item.label === dim.label)?.weight ?? 0;
      return sum + dim.score * weight;
    }, 0),
  );

  const weakest = [...dimensions].sort((a, b) => a.score - b.score).slice(0, 3);

  return {
    id: "",
    score: total,
    summary: `基于当前项目状态的启发式评分：${facts.tasksDone}/${facts.tasksTotal} 任务完成，资料覆盖 ${facts.totalChunks} 个片段，媒体分析 ${facts.completedMedia} 个。最低的三项是${weakest.map((d) => d.label).join("、")}。`,
    dimensions,
    actions: weakest.map((dim) =>
      dim.label === "AI 技术深度"
        ? "补一份带真实片段的赛题资料，让知识库问答产生可验证引用"
        : `针对「${dim.label}」补一条可展示的证据（截图、数据或流程）`,
    ),
    evidence: evidence.lines.map((line, i) => ({ label: `证据 ${i + 1}`, value: line })),
    source: "heuristic",
    comments: [],
    createdAt: new Date().toISOString(),
  };
}

/** 有模型时让模型基于同一份事实清单打分，输出经 schema 校验。 */
export async function generateReview(input: ReviewInput): Promise<{ review: RuntimeReview; source: string }> {
  const evidence = collectEvidence(input);
  const fallback = heuristicReview(input, evidence);

  if (!isTextModelConfigured()) {
    return { review: fallback, source: "heuristic" };
  }

  const { generateText } = await import("@/lib/ai");
  try {
    const raw = await generateText({
      system:
        "你是竞赛作品评审员。只能基于给定的项目事实清单打分，不得虚构事实。分数区间 0-100，需给出证据。只输出 JSON。",
      prompt: `评审维度与权重：${RUBRIC.map((r) => `${r.label} ${r.weight * 100}%`).join("；")}

项目事实清单：
${evidence.text}

输出 JSON：
{"summary": string, "dimensions": [{"label": string, "score": number, "evidence": string}], "actions": string[]}`,
      temperature: 0.2,
    });

    const cleaned = raw.includes("{") ? raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1) : raw;
    const parsed = reviewSchema.parse(JSON.parse(cleaned));

    const dimensions = RUBRIC.map((item) => {
      const found = parsed.dimensions.find((dim) => dim.label === item.label);
      return {
        label: item.label,
        score: Math.max(0, Math.min(100, Math.round(found?.score ?? 60))),
        evidence: found?.evidence ?? "模型未给出该维度证据",
      };
    });

    const total = Math.round(
      dimensions.reduce((sum, dim) => {
        const weight = RUBRIC.find((item) => item.label === dim.label)?.weight ?? 0;
        return sum + dim.score * weight;
      }, 0),
    );

    return {
      review: {
        ...fallback,
        score: total,
        summary: parsed.summary,
        dimensions,
        actions: parsed.actions,
        source: "live",
      },
      source: "live",
    };
  } catch {
    return { review: fallback, source: "heuristic-fallback" };
  }
}

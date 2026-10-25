import { z } from "zod";
import { buildContext, type Hit } from "@/lib/retrieval";

const planSchema = z.object({
  title: z.string(),
  summary: z.string(),
  phases: z.array(
    z.object({
      name: z.string(),
      outcome: z.string(),
      tasks: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          owner: z.string(),
          priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
        }),
      ),
    }),
  ),
  risks: z.array(z.string()),
});

export type Plan = z.infer<typeof planSchema>;

/**
 * 计划来源，用于向前端如实标注结果是怎么来的：
 *  - live            真实模型返回且通过 schema 校验
 *  - fallback-schema 模型返回了内容但结构不符合 schema
 *  - fallback-error  模型请求失败
 *  - demo            未配置模型，使用内置演示计划
 */
export type PlanSource = "live" | "fallback-schema" | "fallback-error" | "demo";

type TextModel = {
  generateText(input: { system: string; prompt: string; temperature?: number }): Promise<string>;
};

const REQUEST_TIMEOUT_MS = 45_000;

/** 仅在三个环境变量齐备时才认为模型可用。 */
export function isTextModelConfigured(): boolean {
  return Boolean(process.env.AI_BASE_URL && process.env.AI_API_KEY && process.env.AI_TEXT_MODEL);
}

function getTextModel(): TextModel | null {
  if (!isTextModelConfigured()) return null;
  const base = (process.env.AI_BASE_URL as string).replace(/\/$/, "");

  return {
    async generateText({ system, prompt, temperature = 0.3 }) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const response = await fetch(`${base}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.AI_API_KEY}`,
          },
          body: JSON.stringify({
            model: process.env.AI_TEXT_MODEL,
            temperature,
            messages: [
              { role: "system", content: system },
              { role: "user", content: prompt },
            ],
          }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`AI request failed: ${response.status}`);
        const json = (await response.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        return json.choices?.[0]?.message?.content ?? "";
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

const demoPlan: Plan = {
  title: "QuestPilot AI Web 竞赛冲刺计划",
  summary: "先明确真实用户，再完成 AI 技术闭环，最后用评审证据打磨交付材料。",
  phases: [
    {
      name: "发现问题",
      outcome: "确定真实用户、场景和成功指标",
      tasks: [
        {
          title: "完成 3 个目标用户访谈假设",
          description: "记录学生和指导教师的现有备赛流程。",
          owner: "产品负责人",
          priority: "HIGH",
        },
        {
          title: "锁定核心场景",
          description: "把需求收敛为一个可以在视频中演示的工作流。",
          owner: "全员",
          priority: "HIGH",
        },
      ],
    },
    {
      name: "建立方案",
      outcome: "形成 Agent、RAG 与媒体评审的技术路线",
      tasks: [
        {
          title: "建立评分维度映射",
          description: "为每个 AI 输出绑定比赛评分维度。",
          owner: "AI 负责人",
          priority: "HIGH",
        },
        {
          title: "建立资料知识库",
          description: "导入赛题资料并生成可引用片段。",
          owner: "AI 负责人",
          priority: "MEDIUM",
        },
      ],
    },
    {
      name: "做出闭环",
      outcome: "让目标、任务和 AI 评审结果互相连接",
      tasks: [
        {
          title: "完成计划画布",
          description: "实现任务状态、负责人和截止日期。",
          owner: "前端负责人",
          priority: "HIGH",
        },
        {
          title: "完成媒体评审样例",
          description: "准备音频转写和视频关键帧分析。",
          owner: "AI 负责人",
          priority: "MEDIUM",
        },
      ],
    },
  ],
  risks: [
    "真实模型输出需要结构化校验和 fallback",
    "视频处理需要本机 FFmpeg",
    "API 密钥不能进入公开仓库",
  ],
};

/** 供评审等其他模块复用的单次文本生成。未配置模型时抛错，调用方自行兜底。 */
export async function generateText(input: {
  system: string;
  prompt: string;
  temperature?: number;
}): Promise<string> {
  const model = getTextModel();
  if (!model) throw new Error("Text model is not configured");
  return model.generateText(input);
}

/** 从模型输出里截取第一段 JSON，兼容 ```json 代码块与前后多余说明。 */
function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : raw;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return candidate.trim();
  return candidate.slice(start, end + 1);
}

export async function generatePlan(input: {
  goal: string;
  team: string;
  skills: string;
}): Promise<{ plan: Plan; source: PlanSource }> {
  const model = getTextModel();
  if (!model) return { plan: demoPlan, source: "demo" };

  let raw = "";
  try {
    raw = await model.generateText({
      system: "你是 AI 竞赛项目教练。只输出符合给定结构的 JSON，不要输出解释文字。",
      prompt: `请基于下列信息生成竞赛计划。

目标：${input.goal}
团队：${input.team}
技能：${input.skills}

JSON 结构：
{"title": string, "summary": string, "phases": [{"name": string, "outcome": string, "tasks": [{"title": string, "description": string, "owner": string, "priority": "HIGH"|"MEDIUM"|"LOW"}]}], "risks": string[]}`,
    });
  } catch {
    return { plan: demoPlan, source: "fallback-error" };
  }

  try {
    return { plan: planSchema.parse(JSON.parse(extractJson(raw))), source: "live" };
  } catch {
    return { plan: demoPlan, source: "fallback-schema" };
  }
}

/**
 * 基于检索到的片段生成回答。
 * 未配置模型时返回可复现的摘录式回答，两条路径都会带上真实命中片段。
 */
export async function answerWithContext(
  question: string,
  hits: Hit[],
): Promise<{ answer: string; mode: "live-rag" | "local-retrieval" }> {
  const context = buildContext(hits);
  const model = getTextModel();

  if (model) {
    try {
      const answer = await model.generateText({
        system:
          "你是竞赛资料助手。只能依据【资料片段】回答，不得补充片段之外的事实。每条结论后用 [编号] 标注来源。若片段不足以回答，明确说“资料中未覆盖”。",
        prompt: `【资料片段】\n${context}\n\n【问题】\n${question}`,
        temperature: 0.2,
      });
      if (answer.trim()) return { answer: answer.trim(), mode: "live-rag" };
    } catch {
      // 落到下面的摘录式回答
    }
  }

  const top = hits[0];
  const answer = [
    `根据《${top.chunk.title}》片段 ${top.chunk.index}（相似度 ${top.score.toFixed(3)}）：`,
    top.chunk.text.slice(0, 220),
    hits.length > 1 ? `\n\n另命中 ${hits.length - 1} 个相关片段，见下方引用。` : "",
  ]
    .join("")
    .trim();

  return { answer, mode: "local-retrieval" };
}

/** AI 教练流式建议。未配置模型时输出固定的可复现文本。 */
export async function* streamCoach(prompt: string): AsyncIterable<string> {
  const model = getTextModel();
  if (!model) {
    yield "先明确真实用户，再把 AI 能力绑定到任务。";
    yield "\n\n你的下一步：补充一份可引用的赛题资料，并创建第一个可复现的评审样例。";
    return;
  }
  yield await model.generateText({
    system: "你是 QuestPilot 的竞赛教练，回答简洁、具体并给出下一步。",
    prompt,
  });
}

import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getStore, saveStore } from "@/lib/runtime-store";
import { requireApiUser } from "@/lib/api-auth";
import { isTextModelConfigured } from "@/lib/ai";

/**
 * 媒体分析接口。
 *
 * 诚实边界：当前没有接入 FFmpeg 抽帧、语音转写与视觉模型，因此这里
 * 不会伪造转写文本。它做三件真实的事：
 *   1. 确认文件是否真的落盘、读取真实字节数
 *   2. 记录任务状态流转（QUEUED → PROCESSING → COMPLETED / FAILED）
 *   3. 按评分维度给出标注为样例的改进建议，并显式说明未经内容解析
 */
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const { id } = await context.params;
  const media = getStore().media.find((candidate) => candidate.id === id);
  if (!media) return NextResponse.json({ error: "媒体任务不存在。" }, { status: 404 });

  media.status = "PROCESSING";
  media.progress = 30;
  saveStore();

  let bytes = 0;
  let stored = false;
  if (media.storageKey) {
    try {
      const stat = await fs.stat(path.join(process.cwd(), "uploads", media.storageKey));
      bytes = stat.size;
      stored = true;
    } catch {
      stored = false;
    }
  }

  media.progress = 100;
  media.status = stored ? "COMPLETED" : "FAILED";
  media.result = {
    provider: "demo",
    isSample: true,
    stored,
    bytes,
    transcript: null,
    frames: 0,
    note: stored
      ? "文件已保存到本地 uploads/ 目录。当前未接入 FFmpeg、语音转写与视觉模型，因此不产出转写文本和关键帧；以下建议为样例，不代表对文件内容的理解。"
      : "文件未找到，可能已被清理。请重新上传。",
    modelConfigured: isTextModelConfigured(),
    suggestions: [
      "在视频前 30 秒明确说出目标用户与核心痛点，方便评委抓重点",
      "演示时逐条对齐评分维度，说明每个 AI 能力对应哪一项要求",
      "补充一次真实的检索→引用过程，展示片段命中与原文回指",
    ],
  };
  saveStore();

  return NextResponse.json(media, { status: stored ? 200 : 422 });
}

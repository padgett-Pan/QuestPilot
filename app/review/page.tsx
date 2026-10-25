"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, FileVideo2, Gauge, Play, UploadCloud } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { ProfileMenu } from "@/components/profile-menu";
import { PillNav, SpotlightCard } from "@/components/reactbits";

type Dimension = { label: string; score: number; evidence?: string };
type Review = {
  id: string;
  score: number;
  summary: string;
  dimensions: Dimension[];
  actions: string[];
  source?: string;
  createdAt: string;
};

const SOURCE_LABEL: Record<string, string> = {
  live: "模型评审",
  heuristic: "按项目状态计算",
  "heuristic-fallback": "模型不可用，回退计算",
  demo: "演示样例",
};

export default function ReviewPage() {
  const [review, setReview] = useState<Review | null>(null);
  const [status, setStatus] = useState<"READY" | "PROCESSING" | "COMPLETED" | "FAILED">("READY");
  const [message, setMessage] = useState("上传一段演示音频或视频，或在右侧运行一次基于当前项目状态的评审。");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const loadLatest = useCallback(async () => {
    const response = await fetch("/api/reviews");
    if (!response.ok) return;
    const data = await response.json();
    if (data.reviews?.[0]) setReview(data.reviews[0]);
  }, []);

  useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  async function runReview() {
    setStatus("PROCESSING");
    setMessage("正在按评分维度汇总项目证据…");
    const response = await fetch("/api/reviews/generate", { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus("FAILED");
      setMessage(data.error ?? "评审失败，请稍后重试。");
      return;
    }
    setReview(data.review);
    setStatus("COMPLETED");
    setMessage(`评审完成，来源：${SOURCE_LABEL[data.source] ?? data.source}。`);
  }

  async function upload(file?: File) {
    if (!file) return;
    setStatus("PROCESSING");
    setMessage("正在上传文件…");
    const form = new FormData();
    form.append("file", file);

    const response = await fetch("/api/media/upload", { method: "POST", body: form });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus("FAILED");
      setMessage(data.error ?? "上传失败。");
      return;
    }

    setMessage("文件已保存，正在创建分析任务…");
    const analyzed = await fetch(`/api/media/${data.media.id}/analyze`, { method: "POST" });
    const result = await analyzed.json().catch(() => ({}));
    const payload = result.result ?? {};

    setStatus(analyzed.ok ? "COMPLETED" : "FAILED");
    setSuggestions(payload.suggestions ?? []);
    setMessage(payload.note ?? "分析任务已结束。");
  }

  const score = review?.score ?? null;
  const dimensions = review?.dimensions ?? [];

  return (
    <div className="dashboard-shell">
      <div className="dashboard-topbar">
        <div className="container">
          <header className="topbar">
            <Brand subtitle="竞途智策工作台" />
            <PillNav
              items={[
                { label: "工作台", href: "/dashboard" },
                { label: "计划画布", href: "/plan" },
                { label: "作品评审", href: "/review", active: true },
              ]}
            />
            <ProfileMenu />
          </header>
        </div>
      </div>

      <main className="container dashboard-main">
        <div className="dash-header">
          <div>
            <div className="eyebrow">
              <i /> Review · 评分维度对齐
            </div>
            <h1>让作品先被评审一次。</h1>
            <p>评审分数由项目真实状态（任务进度、资料片段、媒体任务、团队反馈）计算或由模型给出，不再是一个固定值。</p>
          </div>
          <button className="button primary" onClick={runReview} disabled={status === "PROCESSING"}>
            <Gauge size={15} /> {status === "PROCESSING" ? "分析中…" : "运行一次评审"}
          </button>
        </div>

        <div className="dashboard-grid">
          <SpotlightCard className="panel">
            <div className="panel-head">
              <div>
                <h2>上传媒体样例</h2>
                <p>支持 MP3、WAV、MP4、WebM · 最大 200MB · 文件会保存到本地 uploads/</p>
              </div>
              <UploadCloud size={18} color="#8390a3" />
            </div>
            <div className="media-drop">
              <FileVideo2 size={32} color="#3f6bd4" />
              <strong>拖入讲解音频或演示视频</strong>
              <small>上传后创建任务、保存文件并记录状态流转</small>
              <label className="button secondary">
                选择文件
                <input
                  type="file"
                  hidden
                  accept="audio/*,video/mp4,video/webm"
                  onChange={(event) => upload(event.target.files?.[0])}
                />
              </label>
            </div>
            <div className="demo-note" style={{ marginTop: 16 }}>
              <CheckCircle2 size={15} />
              <span>{message}</span>
            </div>
            {suggestions.length > 0 && (
              <div className="action-list" style={{ marginTop: 14 }}>
                {suggestions.map((item) => (
                  <div className="action-row" key={item}>
                    <span className="action-icon">
                      <Play size={13} />
                    </span>
                    <div>
                      <p>{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SpotlightCard>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>评审结果</h2>
                <p>{review ? `来源：${SOURCE_LABEL[review.source ?? ""] ?? review.source ?? "未知"}` : "尚无评审记录"}</p>
              </div>
              <span className="dash-chip">{score === null ? "—" : `${score} / 100`}</span>
            </div>
            <div className="review-score">
              <div>
                <strong>{score === null ? "—" : score}</strong>
                <span>综合准备度</span>
              </div>
              <div className="review-ring">
                <span>AI</span>
              </div>
            </div>
            <div className="rubric-mini">
              {dimensions.slice(0, 4).map((item, i) => (
                <div key={item.label} title={item.evidence}>
                  <span>
                    <i style={{ background: ["#2563eb", "#7c3aed", "#0891b2", "#f59e0b"][i] }} />
                    {item.label}
                  </span>
                  <b>{item.score}</b>
                </div>
              ))}
              {dimensions.length === 0 && <p className="demo-note">点击“运行一次评审”生成结果。</p>}
            </div>
          </div>
        </div>

        <div className="panel" style={{ marginTop: 15 }}>
          <div className="panel-head">
            <div>
              <h2>建议优先处理</h2>
              <p>{review?.summary ?? "评审后会给出按分数排序的改进建议。"}</p>
            </div>
            <Link className="text-link" href="/plan">
              去执行 <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="action-list">
            {(review?.actions ?? []).map((action, i) => (
              <div className="action-row" key={action}>
                <span className="action-icon">{i + 1}</span>
                <div>
                  <p>{action}</p>
                </div>
              </div>
            ))}
            {dimensions.length > 0 && (
              <div className="demo-note" style={{ marginTop: 6 }}>
                分数证据：
                {dimensions
                  .slice(0, 3)
                  .map((dim) => `${dim.label} ${dim.score}（${dim.evidence ?? "—"}）`)
                  .join("；")}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquareText, Send } from "lucide-react";
import { Brand } from "@/components/brand";
import { ProfileMenu } from "@/components/profile-menu";
import { PillNav } from "@/components/reactbits";

type Comment = { id: string; author: string; body: string; createdAt: string };
type Review = { id: string; summary: string; comments: Comment[] };

export default function CommentsPage() {
  const [review, setReview] = useState<Review | null>(null);
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");

  const loadReview = useCallback(async () => {
    const response = await fetch("/api/reviews");
    if (!response.ok) return;
    const data = await response.json();
    if (data.reviews?.[0]) setReview(data.reviews[0]);
  }, []);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  async function send() {
    if (!body.trim() || !review) return;
    const response = await fetch(`/api/reviews/${review.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: body.trim() }),
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      setMessage("批注已保存，团队成员可以看到。");
      setBody("");
      setReview(data.review);
    } else {
      setMessage(data.error ?? "保存失败");
    }
  }

  const comments = review?.comments ?? [];

  return (
    <div className="dashboard-shell">
      <div className="dashboard-topbar">
        <div className="container">
          <header className="topbar">
            <Brand subtitle="教师批注" />
            <PillNav
              items={[
                { label: "工作台", href: "/dashboard" },
                { label: "计划画布", href: "/plan" },
                { label: "作品评审", href: "/review" },
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
              <i /> Review comments
            </div>
            <h1>把意见变成下一步。</h1>
            <p>每条批注都保留在评审记录上，并按登录账号记录作者。</p>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>批注流</h2>
              <p>{review ? `关联评审：${review.id}` : "尚未生成评审记录，先去作品评审页运行一次"}</p>
            </div>
            <MessageSquareText size={18} color="#8390a3" />
          </div>

          {comments.length === 0 && <p className="demo-note">还没有批注。写下第一条反馈试试。</p>}
          {comments.map((comment) => (
            <div className="action-row" key={comment.id}>
              <span className="action-icon">{comment.author.slice(0, 1)}</span>
              <div>
                <strong>
                  {comment.author} · {new Date(comment.createdAt).toLocaleString("zh-CN")}
                </strong>
                <p>{comment.body}</p>
              </div>
            </div>
          ))}

          <div className="comment-compose">
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="写下你的回应或新的行动建议…"
            />
            <button className="button primary" onClick={send} disabled={!review}>
              <Send size={15} /> 发布批注
            </button>
          </div>
          {message && <div className="demo-note">{message}</div>}
        </div>
      </main>
    </div>
  );
}

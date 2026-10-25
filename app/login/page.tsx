"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowUpRight, LockKeyhole, Mail, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(""); const form = new FormData(event.currentTarget); const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) }); const data = await response.json(); if (!response.ok) setError(data.error ?? "登录失败"); else window.location.href = new URLSearchParams(window.location.search).get("next") || data.redirect; setLoading(false); }
  return <main className="auth-shell"><div className="auth-card"><Link className="auth-back" href="/"><ArrowLeft size={15} /> 返回首页</Link><div className="auth-brand"><span className="brand-mark">Q</span><div><strong>QuestPilot</strong><small>竞途智策工作台</small></div></div><div className="auth-copy"><span className="eyebrow"><i /> Workspace Login</span><h1>让下一步清楚起来。</h1><p>登录空间，查看学生计划、AI 评审和教师批注如何连成一个闭环。</p></div><form className="auth-form" onSubmit={submit}><label>邮箱<div className="input-wrap"><Mail size={16} /><input name="email" type="email" placeholder="student@questpilot.local" defaultValue="student@questpilot.local" required /></div></label><label>密码<div className="input-wrap"><LockKeyhole size={16} /><input name="password" type="password" placeholder="输入密码" defaultValue="demo-student-password" required /></div></label>{error && <div className="demo-note" style={{ color: "#b45309", background: "#fff6df" }}>{error}</div>}<button className="button primary" type="submit" disabled={loading}>{loading ? "登录中…" : "进入工作台"} <ArrowUpRight size={15} /></button></form><div className="demo-note"><Sparkles size={15} /><span>学生：student@questpilot.local / demo-student-password<br />教师：teacher@questpilot.local / demo-teacher-password</span></div></div></main>;
}

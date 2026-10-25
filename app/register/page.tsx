"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowUpRight, LockKeyhole, Mail, UserRound } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      setMessage("账号已创建，正在进入工作台。");
      router.push("/dashboard");
      router.refresh();
    } else {
      setMessage(data.error ?? "注册失败");
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <Link className="auth-back" href="/">
          <ArrowLeft size={15} /> 返回首页
        </Link>
        <div className="auth-brand">
          <span className="brand-mark">Q</span>
          <div>
            <strong>QuestPilot</strong>
            <small>竞途智策工作台</small>
          </div>
        </div>
        <div className="auth-copy">
          <span className="eyebrow">
            <i /> Create workspace
          </span>
          <h1>建立你的竞赛空间。</h1>
          <p>注册后可保存 AI 生成的计划、资料条目与作品评审记录。</p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <label>
            姓名
            <div className="input-wrap">
              <UserRound size={16} />
              <input name="name" placeholder="你的名字" required />
            </div>
          </label>
          <label>
            邮箱
            <div className="input-wrap">
              <Mail size={16} />
              <input name="email" type="email" placeholder="name@example.com" required />
            </div>
          </label>
          <label>
            密码
            <div className="input-wrap">
              <LockKeyhole size={16} />
              <input name="password" type="password" placeholder="至少 8 位字符" minLength={8} required />
            </div>
          </label>
          {message && <div className="demo-note">{message}</div>}
          <button className="button primary" type="submit" disabled={loading}>
            {loading ? "创建中…" : "创建空间"} <ArrowUpRight size={15} />
          </button>
        </form>
        <p className="auth-foot">
          已有空间？<Link href="/login">直接登录</Link>
        </p>
        <p className="auth-foot auth-note">
          当前为演示环境：新注册账号共用同一个演示工作区，请勿填写真实个人信息。
        </p>
      </div>
    </main>
  );
}

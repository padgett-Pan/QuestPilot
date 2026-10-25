"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[questpilot] page error:", error);
  }, [error]);

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <div className="auth-copy">
          <span className="eyebrow">
            <i /> 页面出错了
          </span>
          <h1>这一步没有走通。</h1>
          <p>页面渲染时出现异常。可以先重试；如果仍然失败，请联系团队负责人并附上下方的错误编号。</p>
        </div>
        {error.digest && (
          <div className="demo-note">
            <span>错误编号：{error.digest}</span>
          </div>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button className="button primary" onClick={reset}>
            重试
          </button>
          <Link className="button secondary" href="/">
            返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}

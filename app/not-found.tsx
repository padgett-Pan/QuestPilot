import Link from "next/link";

export default function NotFound() {
  return (
    <main className="auth-shell">
      <div className="auth-card">
        <div className="auth-copy">
          <span className="eyebrow">
            <i /> 404
          </span>
          <h1>这一页不存在。</h1>
          <p>链接可能已经失效，或者该页面还未上线。回到工作台继续推进计划。</p>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <Link className="button primary" href="/dashboard">
            进入工作台
          </Link>
          <Link className="button secondary" href="/">
            返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}

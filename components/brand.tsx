"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/** 统一的品牌标识 + 首页入口。所有工作区页面共用，避免每页复制一段 <a>。 */
export function Brand({ subtitle }: { subtitle: string }) {
  return (
    <Link className="brand" href="/">
      <span className="brand-mark">Q</span>
      <span>
        <span className="brand-word">QuestPilot</span>
        <span className="brand-sub">{subtitle}</span>
      </span>
    </Link>
  );
}

/** 工作区统一顶栏：品牌 + 胶囊导航 + 账号菜单。 */
export function WorkspaceHeader({
  subtitle,
  nav,
  profile,
}: {
  subtitle: string;
  nav: ReactNode;
  profile: ReactNode;
}) {
  return (
    <div className="dashboard-topbar">
      <div className="container">
        <header className="topbar">
          <Brand subtitle={subtitle} />
          {nav}
          {profile}
        </header>
      </div>
    </div>
  );
}

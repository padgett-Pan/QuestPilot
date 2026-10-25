import { BookOpen, FileVideo2, LayoutDashboard, MessageSquareText, Settings2, Target, UsersRound } from "lucide-react";

export function WorkspaceSidebar({ active }: { active: string }) {
  const items = [
    ["dashboard", "工作台", "/dashboard", LayoutDashboard],
    ["plan", "竞赛计划", "/plan", Target],
    ["knowledge", "资料知识库", "/knowledge", BookOpen],
    ["review", "作品评审", "/review", FileVideo2],
    ["team", "先锋队", "/team", UsersRound],
    ["comments", "教师批注", "/comments", MessageSquareText],
    ["settings", "设置", "/settings", Settings2],
  ] as const;
  return <aside className="side-nav workspace-sidebar"><div className="side-label">Workspace</div>{items.slice(0, 4).map(([key, label, href, Icon]) => <a className={active === key ? "active" : ""} href={href} key={key}><Icon size={16} /> {label}</a>)}<div className="side-label">Team</div>{items.slice(4).map(([key, label, href, Icon]) => <a className={active === key ? "active" : ""} href={href} key={key}><Icon size={16} /> {label}</a>)}</aside>;
}

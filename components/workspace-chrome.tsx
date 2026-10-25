"use client";

import { usePathname } from "next/navigation";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";

export function WorkspaceChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname.startsWith("/dashboard") ? "dashboard" : pathname.startsWith("/plan") ? "plan" : pathname.startsWith("/knowledge") ? "knowledge" : pathname.startsWith("/review") ? "review" : pathname.startsWith("/team") ? "team" : pathname.startsWith("/comments") ? "comments" : pathname.startsWith("/settings") ? "settings" : pathname.startsWith("/help") ? "help" : "";
  const show = Boolean(active);
  return <div className={show ? "workspace-chrome has-sidebar" : "workspace-chrome"}>{show && <WorkspaceSidebar active={active} />}{children}</div>;
}

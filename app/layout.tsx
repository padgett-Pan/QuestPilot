import type { Metadata } from "next";
import "./globals.css";
import { WorkspaceChrome } from "@/components/workspace-chrome";

export const metadata: Metadata = {
  title: "QuestPilot · 竞途智策",
  description: "把竞赛目标变成可执行的下一步。AI 学习与竞赛协作平台。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body><WorkspaceChrome>{children}</WorkspaceChrome></body></html>;
}

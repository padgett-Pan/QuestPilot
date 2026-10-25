import { BookOpen, CircleHelp, Mail, PlayCircle } from "lucide-react";
import { PillNav } from "@/components/reactbits";
import { ProfileMenu } from "@/components/profile-menu";
import { Brand } from "@/components/brand";

export default function HelpPage() {
  return <div className="dashboard-shell"><div className="dashboard-topbar"><div className="container"><header className="topbar"><Brand subtitle="帮助中心" /><PillNav items={[{ label: "工作台", href: "/dashboard" }, { label: "帮助中心", href: "/help", active: true }]} /><ProfileMenu /></header></div></div><main className="container dashboard-main"><div className="dash-header"><div><div className="eyebrow"><i /> Help center</div><h1>从第一次登录，到完成第一次评审。</h1><p>这里说明每个模块的输入、输出和真实操作路径。</p></div></div><div className="feature-grid"><article className="spotlight-card"><BookOpen className="feature-icon" /><h3>先创建目标</h3><p>在计划画布输入目标、队伍和技能，AI 会生成阶段和任务。</p></article><article className="spotlight-card"><PlayCircle className="feature-icon" /><h3>再上传资料或媒体</h3><p>资料进入知识库，音视频进入任务队列，完成后可查看引用和评分。</p></article><article className="spotlight-card"><CircleHelp className="feature-icon" /><h3>最后交给教师点评</h3><p>教师可以邀请成员、批注评审结果，并把意见转成下一步。</p></article></div><div className="panel" style={{ marginTop: 15 }}><div className="panel-head"><div><h2>需要协助？</h2><p>将问题和当前页面一起发给团队负责人。</p></div><a className="button secondary" href="mailto:teacher@questpilot.local"><Mail size={15} /> 联系指导教师</a></div></div></main></div>;
}



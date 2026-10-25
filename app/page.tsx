import { ArrowUpRight, Bot, BrainCircuit, FileText, Gauge, Layers3, Play, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { GradientText, PillNav, SoftAurora, SplitText, SpotlightCard } from "@/components/reactbits";
import { rubric } from "@/lib/demo-data";
import { cookies } from "next/headers";
import { getUserBySession } from "@/lib/runtime-store";
import Image from "next/image";
import { Brand } from "@/components/brand";

export default async function HomePage() {
  const session = (await cookies()).get("questpilot_session")?.value;
  const signedIn = Boolean(getUserBySession(session));
  const workspaceHref = signedIn ? "/dashboard" : "/login?next=/dashboard";
  return <main className="site-shell">
    <div className="container">
      <header className="topbar">
        <Brand subtitle="竞途智策 · AI competition workspace" />
        <PillNav items={[{ label: "产品能力", href: "#capabilities", active: true }, { label: "评分体系", href: "#rubric" }, ...(signedIn ? [] : [{ label: "登录", href: "/login?next=/dashboard" }, { label: "注册", href: "/register" }]), { label: "进入工作台", href: workspaceHref }]} />
      </header>
    </div>

    <section className="hero">
      <SoftAurora />
      <div className="container hero-grid">
        <div>
          <span className="eyebrow"><i /> 2026 传智杯 AI WEB 参赛工作台</span>
          <h1><span className="hero-title-line"><SplitText>把竞赛目标变成</SplitText></span><span className="hero-title-line"><GradientText>可执行的下一步</GradientText><em>。</em></span></h1>
          <p className="hero-copy">QuestPilot 把选题、资料、任务、AI 技术闭环和作品评审放进同一张可推进的地图。学生知道下一步做什么，教师看见为什么这样做。</p>
          <div className="hero-actions"><a className="button primary" href={workspaceHref}>进入工作台 <ArrowUpRight size={16} /></a><a className="button secondary" href="#capabilities"><Play size={15} /> 看产品如何工作</a></div>
        </div>
        <div className="hero-visual" aria-label="QuestPilot 工作台预览">
          <div className="float-card one"><span className="float-icon"><Sparkles size={15} /></span><span><strong>AI 计划已更新</strong><small>为你拆出 4 个下一步</small></span></div>
          <Image className="hero-asset" src="/generated/questpilot-hero.svg" alt="QuestPilot AI 工作台示意插画" width={1200} height={760} priority unoptimized />
          <div className="dashboard-card">
            <div className="dash-top"><div className="window-dots"><i /><i /><i /></div><span className="dash-chip">LIVE WORKSPACE</span></div>
            <div className="dash-meta">QuestPilot / 竞赛先锋队</div><div className="dash-title">从目标，到下一步</div>
            <div className="dash-metrics"><div className="metric"><b>82</b><span>AI 深度</span></div><div className="metric"><b>64%</b><span>计划完成</span></div><div className="metric"><b>3.8</b><span>评审准备度</span></div></div>
            <div className="dash-progress"><span /></div>
            <div className="dash-list"><div className="dash-task"><i /><span>明确真实用户与核心场景</span></div><div className="dash-task"><i /><span>完成 AI 技术路线设计</span></div><div className="dash-task"><i /><span>搭建可演示的计划画布</span></div></div>
          </div>
          <div className="float-card two"><span className="float-icon"><ShieldCheck size={15} /></span><span><strong>评审建议可追踪</strong><small>每条结论都绑定证据</small></span></div>
        </div>
      </div>
    </section>

    <section id="capabilities" className="section alt"><div className="container">
      <div className="section-heading"><h2>AI 不是一个功能，<br /><GradientText>而是一条完整的推进链。</GradientText></h2><p>从目标诊断到教师点评，QuestPilot 将 AI 结果变成任务、证据和团队下一步。</p></div>
      <div className="feature-grid">
        <SpotlightCard><span className="feature-number">01 / PLAN</span><span className="feature-icon"><BrainCircuit size={20} /></span><h3>目标诊断与计划生成</h3><p>输入目标、时间和队伍能力，AI 拆出阶段、任务、负责人和风险；输出经 schema 校验，失败自动回退并标注来源。</p><span className="cap-badge live">已接通模型</span></SpotlightCard>
        <SpotlightCard><span className="feature-number">02 / KNOWLEDGE</span><span className="feature-icon"><FileText size={20} /></span><h3>带证据的资料学习</h3><p>TXT / Markdown 按段落切块，TF-IDF + 余弦相似度检索，回答附命中片段、相似度分数与字符区间。</p><span className="cap-badge live">片段级检索已实现</span><span className="cap-badge todo">PDF / 网页解析接入中</span></SpotlightCard>
        <SpotlightCard><span className="feature-number">03 / REVIEW</span><span className="feature-icon"><Gauge size={20} /></span><h3>按评分标准评审作品</h3><p>分数由任务进度、资料片段、媒体任务与团队反馈计算，或由模型按维度打分，每个分数带证据说明。</p><span className="cap-badge live">证据驱动评分</span><span className="cap-badge todo">转写 / 抽帧接入中</span></SpotlightCard>
        <SpotlightCard><span className="feature-number">04 / TEAM</span><span className="feature-icon"><UsersRound size={20} /></span><h3>师生共同推进</h3><p>团队页面汇总成员与邀请记录，教师批注保留在团队空间并可回到计划画布执行。</p><span className="cap-badge live">本地协作已实现</span><span className="cap-badge todo">多团队隔离接入中</span></SpotlightCard>
        <SpotlightCard><span className="feature-number">05 / FLOW</span><span className="feature-icon"><Layers3 size={20} /></span><h3>一个可演示的工作台</h3><p>计划、资料、任务、媒体和评审在同一套信息架构里保持连续。</p></SpotlightCard>
        <SpotlightCard><span className="feature-number">06 / SAFETY</span><span className="feature-icon"><Bot size={20} /></span><h3>真实 API 与演示兜底</h3><p>未配置模型时使用可复现的本地结果，并在界面上标明“演示模式”，不把样例说成真实推理。</p><span className="cap-badge live">来源可追溯</span></SpotlightCard>
      </div>
    </div></section>

    <section id="rubric" className="section"><div className="container">
      <div className="section-heading"><h2>对齐比赛评分，<br /><GradientText>每一次 AI 输出都要有去处。</GradientText></h2><p>QuestPilot 把传智杯的评分维度变成产品中的任务提醒与评审证据。</p></div>
      <div className="rubric-grid">{rubric.map((item) => <div className="rubric-card" key={item.label}><span className="rubric-bar" style={{ background: item.color }} /><span className="rubric-label">{item.label}</span><span className="rubric-weight">{item.value}%</span><span className="rubric-score">{item.score}</span></div>)}</div>
    </div></section>

    <footer className="footer"><div className="container footer-inner"><span>QuestPilot · 竞途智策</span><span>AI 让下一步更清楚。</span><a href={workspaceHref}>打开工作台 <ArrowUpRight size={13} /></a></div></footer>
  </main>;
}

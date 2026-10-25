import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Plus,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { redirect } from "next/navigation";
import { AnimatedContent, AnimatedList, PillNav, SpotlightCard, Stepper } from "@/components/reactbits";
import { ProfileMenu } from "@/components/profile-menu";
import { insights, reviewActions } from "@/lib/demo-data";
import { getCurrentUser } from "@/lib/auth";
import { getStore } from "@/lib/runtime-store";
import { daysLeft, greeting } from "@/lib/deadline";
import { Brand } from "@/components/brand";

// 读取本地运行时状态，必须在每次请求时求值，不能参与构建期预渲染。
export const dynamic = "force-dynamic";

function Radar() {
  return (
    <div className="radar">
      <svg viewBox="0 0 240 200" role="img" aria-label="评分维度雷达图">
        <g transform="translate(120 100)">
          <polygon points="0,-73 69,-22 43,59 -43,59 -69,-22" fill="none" strokeWidth="1" />
          <polygon points="0,-50 48,-15 30,40 -30,40 -48,-15" fill="none" strokeWidth="1" />
          <polygon points="0,-27 26,-8 16,21 -16,21 -26,-8" fill="none" strokeWidth="1" />
          <line x1="0" y1="-73" x2="0" y2="62" />
          <line x1="-69" y1="-22" x2="59" y2="44" />
          <line x1="-43" y1="59" x2="56" y2="-43" />
          <polygon points="0,-60 57,-18 33,45 -30,39 -54,-17" />
        </g>
      </svg>
      <span className="radar-label a">AI 深度</span>
      <span className="radar-label b">创新性</span>
      <span className="radar-label c">体验</span>
      <span className="radar-label d">实用性</span>
      <span className="radar-label e">工程</span>
    </div>
  );
}

const statusLabel: Record<string, string> = { DONE: "已完成", IN_PROGRESS: "进行中", TODO: "待开始" };
const priorityLabel: Record<string, string> = { HIGH: "高", MEDIUM: "中", LOW: "低" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const store = getStore();
  const latestPlan = store.plans[0];
  const latestReview = store.reviews[0];
  const remaining = daysLeft();

  const displayTasks = (latestPlan?.tasks ?? []).map((task) => ({
    title: task.title,
    phase: task.phase,
    owner: task.owner,
    priority: priorityLabel[task.priority] ?? task.priority,
    status: statusLabel[task.status] ?? task.status,
    progress: task.progress,
  }));

  const displayRubric = (latestReview?.dimensions ?? []).slice(0, 4);

  return (
    <div className="dashboard-shell">
      <div className="dashboard-topbar">
        <div className="container">
          <header className="topbar">
            <Brand subtitle="竞途智策工作台" />
            <PillNav
              items={[
                { label: "工作台", href: "/dashboard", active: true },
                { label: "计划画布", href: "/plan" },
                { label: "作品评审", href: "/review" },
              ]}
            />
            <ProfileMenu />
          </header>
        </div>
      </div>

      <main className="container dashboard-main">
        <div className="dash-content">
          <AnimatedContent>
            <div className="dash-header">
              <div>
                <div className="eyebrow">
                  <i /> 省赛冲刺模式 · 还剩 {remaining} 天
                </div>
                <h1>
                  {greeting()}，{user.name}。
                </h1>
                <p>今天适合把“技术路线设计”推进到一个可以被评审的版本。</p>
              </div>
              <a className="button primary" href="/plan">
                <Sparkles size={15} /> 让 AI 规划下一步
              </a>
            </div>

            <div className="insights-grid">
              {insights.map((item) => (
                <div className={`insight-card ${item.tone}`} key={item.label}>
                  <small>{item.label}</small>
                  <strong>{item.value}</strong>
                  <span className="trend">
                    {item.trend} <ArrowUpRight size={11} />
                  </span>
                </div>
              ))}
            </div>

            <div className="dashboard-grid">
              <SpotlightCard className="panel">
                <div className="panel-head">
                  <div>
                    <h2>{latestPlan?.title ?? "还没有生成计划"}</h2>
                    <p>{latestPlan?.summary ?? "打开计划画布，用 AI 把目标拆成阶段任务。"}</p>
                  </div>
                  <a className="text-link" href="/plan">
                    打开画布 <ChevronRight size={13} />
                  </a>
                </div>
                <Stepper steps={["发现问题", "建立方案", "做出闭环", "打磨交付"]} active={1} />
                {displayTasks.length > 0 ? (
                  <AnimatedList className="task-list">
                    {displayTasks.map((task) => (
                      <div
                        className={`task-row ${task.status === "已完成" ? "done" : task.status === "进行中" ? "active" : ""}`}
                        key={task.title}
                      >
                        <span className="task-dot" />
                        <div>
                          <strong>{task.title}</strong>
                          <small>
                            {task.phase} · {task.owner} · {task.priority}优先级
                          </small>
                          <div className="progress-mini">
                            <span style={{ width: `${task.progress}%` }} />
                          </div>
                        </div>
                        <span className={`task-status ${task.status === "进行中" ? "active" : ""}`}>{task.status}</span>
                      </div>
                    ))}
                  </AnimatedList>
                ) : (
                  <p className="demo-note">暂无任务。生成计划后，阶段与任务会显示在这里。</p>
                )}
              </SpotlightCard>

              <div className="panel">
                <div className="panel-head">
                  <div>
                    <h2>评分准备度</h2>
                    <p>基于最近一次 AI 评审实时追踪</p>
                  </div>
                  <CalendarDays size={17} color="#8390a3" />
                </div>
                <Radar />
                <div className="rubric-mini">
                  {displayRubric.map((item, index) => (
                    <div key={item.label}>
                      <span>
                        <i style={{ background: ["#2563eb", "#7c3aed", "#0891b2", "#f59e0b"][index] ?? "#2563eb" }} />
                        {item.label}
                      </span>
                      <b>{item.score}</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="dashboard-grid" id="review">
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <h2>AI 评审建议</h2>
                    <p>每条建议都可以转成下一步任务</p>
                  </div>
                  <a className="text-link" href="/review">
                    查看全部 <ChevronRight size={13} />
                  </a>
                </div>
                <div className="action-list">
                  {reviewActions.map((action) => (
                    <div className="action-row" key={action.title}>
                      <span className="action-icon">{action.icon}</span>
                      <div>
                        <strong>{action.title}</strong>
                        <p>{action.detail}</p>
                      </div>
                      <span className="priority">{action.priority}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel" id="team">
                <div className="panel-head">
                  <div>
                    <h2>{store.team.name}</h2>
                    <p>{store.team.members.length} 位成员</p>
                  </div>
                  <UsersRound size={17} color="#8390a3" />
                </div>
                <div className="team-stack">
                  {store.team.members.map((member, index) => (
                    <div className="profile-chip" key={member.id}>
                      <span
                        className="avatar"
                        style={
                          index === 0
                            ? { background: "#efe8ff", color: "#704dcb" }
                            : index === 2
                              ? { background: "#def8f0", color: "#0a9184" }
                              : undefined
                        }
                      >
                        {member.name.slice(0, 1)}
                      </span>
                      <span>
                        {member.name} · {member.role}
                      </span>
                      <CheckCircle2 size={14} color="#1caa86" />
                    </div>
                  ))}
                </div>
                <a className="button secondary" style={{ width: "100%", marginTop: 15 }} href="/team">
                  <UsersRound size={15} /> 管理团队成员
                </a>
              </div>
            </div>

            <div className="panel" id="knowledge" style={{ marginTop: 15 }}>
              <div className="panel-head">
                <div>
                  <h2>资料知识库</h2>
                  <p>{store.documents.length} 份资料已建立引用索引</p>
                </div>
                <a className="button secondary" href="/knowledge">
                  <Plus size={15} /> 添加资料
                </a>
              </div>
              {store.documents.slice(0, 3).map((document) => (
                <div className="knowledge-row" key={document.id}>
                  <div className="knowledge-icon">
                    <BookOpen size={17} />
                  </div>
                  <div>
                    <strong>{document.title}</strong>
                    <small>
                      {document.sourceType} · {document.citations} 个可引用片段
                    </small>
                  </div>
                  <span className="dash-chip">已完成</span>
                </div>
              ))}
            </div>
          </AnimatedContent>
        </div>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span>QuestPilot · 竞途智策</span>
          <span>最后同步：刚刚</span>
          <Link href="/">
            返回首页 <ArrowUpRight size={13} />
          </Link>
        </div>
      </footer>
    </div>
  );
}

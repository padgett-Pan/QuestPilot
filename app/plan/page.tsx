"use client";

import { useCallback, useEffect, useState } from "react";
import { Bot, CalendarClock, CheckCircle2, ChevronDown, Flag, Sparkles, UsersRound } from "lucide-react";
import { Brand } from "@/components/brand";
import { ProfileMenu } from "@/components/profile-menu";
import { AnimatedList, PillNav, Stepper } from "@/components/reactbits";
import { daysLeft } from "@/lib/deadline";

type Task = { id: string; title: string; phase: string; owner: string; priority: string; status: string; progress: number };
type Plan = { id: string; title: string; summary: string; goal: string; source?: string; risks: string[]; tasks: Task[]; updatedAt: string };

const SOURCE_LABEL: Record<string, string> = {
  live: "真实模型生成（已通过 schema 校验）",
  "fallback-schema": "模型输出结构不合规，已回退演示计划",
  "fallback-error": "模型请求失败，已回退演示计划",
  demo: "演示计划（未配置文本模型）",
  unknown: "来源未知",
};

const STATUS_LABEL: Record<string, string> = { DONE: "已完成", IN_PROGRESS: "进行中", TODO: "待开始" };
const PRIORITY_LABEL: Record<string, string> = { HIGH: "高", MEDIUM: "中", LOW: "低" };

export default function PlanPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("正在读取当前计划…");

  const loadPlan = useCallback(async () => {
    const response = await fetch("/api/plans");
    if (!response.ok) {
      setNotice("读取计划失败，请先登录后重试。");
      return;
    }
    const data = await response.json();
    const current: Plan | undefined = data.plans?.[0];
    if (current) {
      setPlan(current);
      setNotice(`当前计划来源：${SOURCE_LABEL[current.source ?? "unknown"] ?? current.source}`);
    } else {
      setNotice("还没有计划，点击右侧按钮生成第一版。");
    }
  }, []);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  async function generate() {
    setLoading(true);
    setNotice("正在分析目标、队伍能力与评分标准…");
    const response = await fetch("/api/plans/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goal: "完成 AI Web 竞赛作品",
        team: "学生 + 指导教师",
        skills: "React、RAG、Agent、产品设计",
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setNotice(data.error ?? "生成失败，请稍后重试。");
      setLoading(false);
      return;
    }
    setNotice(`已生成并保存：${data.plan.title} · ${SOURCE_LABEL[data.source] ?? data.source}`);
    await loadPlan();
    setLoading(false);
  }

  // 按阶段分组，保持计划生成时的顺序
  const phases = (plan?.tasks ?? []).reduce<{ name: string; tasks: Task[] }[]>((groups, task) => {
    const existing = groups.find((group) => group.name === task.phase);
    if (existing) existing.tasks.push(task);
    else groups.push({ name: task.phase, tasks: [task] });
    return groups;
  }, []);

  const done = (plan?.tasks ?? []).filter((task) => task.status === "DONE").length;
  const total = plan?.tasks.length ?? 0;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="dashboard-shell">
      <div className="dashboard-topbar">
        <div className="container">
          <header className="topbar">
            <Brand subtitle="竞途智策工作台" />
            <PillNav
              items={[
                { label: "工作台", href: "/dashboard" },
                { label: "计划画布", href: "/plan", active: true },
                { label: "作品评审", href: "/review" },
              ]}
            />
            <ProfileMenu />
          </header>
        </div>
      </div>

      <main className="container dashboard-main">
        <div className="panel" style={{ marginBottom: 15 }}>
          <div className="dash-header" style={{ marginBottom: 0 }}>
            <div>
              <div className="eyebrow">
                <i /> AI Plan Canvas
              </div>
              <h1>把目标拆成下一步。</h1>
              <p>计划不是静态文档，而是一张会根据证据和进度更新的工作地图。</p>
            </div>
            <button className="button primary" onClick={generate} disabled={loading}>
              <Sparkles size={15} /> {loading ? "正在生成…" : "让 AI 重新规划"}
            </button>
          </div>
          <p style={{ margin: "20px 0 0", color: "#5570b9", fontSize: 13 }}>{notice}</p>
        </div>

        <div className="panel" style={{ marginBottom: 15 }}>
          <div className="panel-head">
            <div>
              <h2>{plan?.title ?? "暂无计划"}</h2>
              <p>
                截止 2026-11-18 · {done}/{total} 任务完成（{percent}%）
              </p>
            </div>
            <span className="dash-chip">{plan?.source === "live" ? "LIVE PLAN" : "PLAN"}</span>
          </div>
          <Stepper steps={["发现问题", "建立方案", "做出闭环", "打磨交付"]} active={phases.length > 0 ? Math.min(phases.length - 1, 3) : 1} />
        </div>

        <AnimatedList className="dashboard-grid">
          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>计划阶段</h2>
                <p>{phases.length} 个阶段 · {total} 个任务</p>
              </div>
              <ChevronDown size={17} color="#8390a3" />
            </div>
            {phases.length === 0 && <p className="demo-note">还没有阶段。点击“让 AI 重新规划”生成。</p>}
            {phases.map((phase) => {
              const phaseDone = phase.tasks.filter((task) => task.status === "DONE").length;
              return (
                <div className="task-row active" key={phase.name} style={{ marginBottom: 10 }}>
                  <span className="task-dot" />
                  <div>
                    <strong>
                      {phase.name}{" "}
                      <span style={{ color: "#8190a2", fontSize: 11, marginLeft: 7 }}>
                        {phaseDone}/{phase.tasks.length}
                      </span>
                    </strong>
                    <div className="dash-list" style={{ marginTop: 9 }}>
                      {phase.tasks.map((task) => (
                        <div className="dash-task" key={task.id}>
                          <CheckCircle2 size={14} color={task.status === "DONE" ? "#24ae8d" : "#aab5c6"} />
                          <span>
                            {task.title}
                            <small style={{ color: "#8190a2", marginLeft: 8 }}>
                              {task.owner} · {PRIORITY_LABEL[task.priority] ?? task.priority} · {STATUS_LABEL[task.status] ?? task.status}
                            </small>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>AI 教练</h2>
                <p>把复杂问题变成一个具体动作</p>
              </div>
              <Bot size={17} color="#8390a3" />
            </div>
            <div className="demo-note">
              <Bot size={15} />
              <span>{plan?.summary ?? "先补齐“评分标准 → 技术证据 → 任务”的映射，再优化视觉层。"}</span>
            </div>
            <div className="action-list" style={{ marginTop: 18 }}>
              {(plan?.risks ?? []).slice(0, 3).map((risk) => (
                <div className="action-row" key={risk}>
                  <span className="action-icon">
                    <Flag size={15} />
                  </span>
                  <div>
                    <strong>风险</strong>
                    <p>{risk}</p>
                  </div>
                </div>
              ))}
              <div className="action-row">
                <span className="action-icon">
                  <UsersRound size={15} />
                </span>
                <div>
                  <strong>等待教师</strong>
                  <p>指导教师可以对技术路线写第一条批注。</p>
                </div>
              </div>
              <div className="action-row">
                <span className="action-icon">
                  <CalendarClock size={15} />
                </span>
                <div>
                  <strong>时间风险</strong>
                  <p>距离省赛提交截止还有 {daysLeft()} 天。</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedList>
      </main>
    </div>
  );
}

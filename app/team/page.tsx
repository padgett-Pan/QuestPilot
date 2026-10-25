"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, MailPlus, MessageSquareText, UsersRound } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { ProfileMenu } from "@/components/profile-menu";
import { PillNav } from "@/components/reactbits";

type Member = { id: string; name: string; role: string; email: string };
type Invitation = { email: string; status: string; createdAt: string };
type Team = { id: string; name: string; members: Member[]; invitations: Invitation[] };

export default function TeamPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const loadTeam = useCallback(async () => {
    const response = await fetch("/api/teams");
    if (!response.ok) return;
    const data = await response.json();
    setTeam(data.team);
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  async function invite() {
    if (!team || !email.trim()) return;
    const response = await fetch(`/api/teams/${team.id}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? `邀请记录已创建：${data.invitation.email}（暂未发送邮件）` : (data.error ?? "创建失败"));
    if (response.ok) {
      setEmail("");
      loadTeam();
    }
  }

  return (
    <div className="dashboard-shell">
      <div className="dashboard-topbar">
        <div className="container">
          <header className="topbar">
            <Brand subtitle="团队协作空间" />
            <PillNav
              items={[
                { label: "工作台", href: "/dashboard" },
                { label: "计划画布", href: "/plan" },
                { label: "作品评审", href: "/review" },
              ]}
            />
            <ProfileMenu />
          </header>
        </div>
      </div>

      <main className="container dashboard-main">
        <div className="dash-header">
          <div>
            <div className="eyebrow">
              <i /> Team workspace
            </div>
            <h1>一起把方案推进下去。</h1>
            <p>教师批注、成员职责和评审建议在同一处汇合。</p>
          </div>
          <div className="invite-control">
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="成员邮箱" />
            <button className="button primary" onClick={invite}>
              <MailPlus size={15} /> 邀请
            </button>
          </div>
        </div>

        {message && (
          <div className="demo-note" style={{ marginBottom: 14 }}>
            <MailPlus size={15} />
            {message}
          </div>
        )}

        <div className="dashboard-grid">
          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>{team?.name ?? "读取中…"}</h2>
                <p>
                  {team ? `${team.members.length} 位成员 · 单团队演示空间` : "正在读取团队信息"}
                </p>
              </div>
              <UsersRound size={18} color="#8390a3" />
            </div>
            <div className="team-stack">
              {(team?.members ?? []).map((member, index) => (
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
            <div className="demo-note" style={{ marginTop: 14 }}>
              当前为单团队演示：注册账号共用同一个工作区，邀请只记录不发送邮件。多团队隔离见技术文档 P0 列表。
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>邀请记录</h2>
                <p>{team?.invitations.length ?? 0} 条</p>
              </div>
              <MessageSquareText size={18} color="#8390a3" />
            </div>
            {(team?.invitations.length ?? 0) === 0 && <p className="demo-note">还没有邀请记录。</p>}
            <div className="action-list">
              {(team?.invitations ?? []).map((invitation) => (
                <div className="action-row" key={`${invitation.email}-${invitation.createdAt}`}>
                  <span className="action-icon">
                    <MailPlus size={14} />
                  </span>
                  <div>
                    <strong>{invitation.email}</strong>
                    <p>状态：{invitation.status} · 未发送邮件</p>
                  </div>
                </div>
              ))}
            </div>
            <Link className="button secondary" style={{ width: "100%", marginTop: 15 }} href="/comments">
              <MessageSquareText size={15} /> 查看教师批注
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

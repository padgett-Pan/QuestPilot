"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, LogOut, Save, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { PillNav } from "@/components/reactbits";
import { ProfileMenu } from "@/components/profile-menu";

type Me = { id: string; name: string; email: string; role: "STUDENT" | "TEACHER" };

export default function SettingsPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.user) {
          setMe(data.user);
          setName(data.user.name);
        }
      })
      .catch(() => {});
  }, []);

  async function save() {
    setError("");
    setSaved("");
    const response = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error ?? "保存失败。");
      return;
    }
    setMe(data.user);
    setSaved("已保存到本地工作区。");
    router.refresh();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="dashboard-shell">
      <div className="dashboard-topbar">
        <div className="container">
          <header className="topbar">
            <Brand subtitle="设置" />
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
              <i /> Workspace settings
            </div>
            <h1>让工作区保持清楚。</h1>
            <p>管理个人信息与当前会话。资料与评审数据保存在本地运行时存储中。</p>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>个人资料</h2>
                <p>姓名会同步显示在团队协作记录中。</p>
              </div>
              <ShieldCheck size={18} color="#8390a3" />
            </div>
            <div className="settings-form">
              <label>
                姓名
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="你的名字" />
              </label>
              <label>
                邮箱
                <input value={me?.email ?? ""} readOnly disabled />
              </label>
              <label>
                角色
                <select value={me?.role ?? "STUDENT"} disabled>
                  <option value="STUDENT">学生</option>
                  <option value="TEACHER">指导教师</option>
                </select>
              </label>
            </div>
            <button className="button primary" style={{ marginTop: 18 }} onClick={save} disabled={!me}>
              <Save size={15} /> 保存资料
            </button>
            {saved && (
              <div className="demo-note">
                <Check size={15} /> {saved}
              </div>
            )}
            {error && <div className="demo-note">{error}</div>}
            <p className="demo-note" style={{ marginTop: 12 }}>
              邮箱与角色由注册流程决定，演示环境暂不支持修改。
            </p>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>会话</h2>
                <p>当前设备的登录状态。</p>
              </div>
              <LogOut size={18} color="#8390a3" />
            </div>
            <div className="demo-note">
              退出后会清除当前 session（服务端 token 同时失效），但不会删除你的计划、资料和评审记录。
            </div>
            <button className="button secondary" style={{ marginTop: 15 }} onClick={logout}>
              <LogOut size={15} /> 退出登录
            </button>
            <div style={{ marginTop: 15 }}>
              <Link className="text-link" href="/help">
                查看使用说明
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

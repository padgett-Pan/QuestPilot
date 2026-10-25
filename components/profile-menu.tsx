"use client";

import { Bell, ChevronDown, LogOut, Settings2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SessionUser = { id: string; name: string; role: "STUDENT" | "TEACHER" };

export function ProfileMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data?.user) setUser(data.user);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const displayName = user?.name ?? "未登录";

  return (
    <div className="profile-menu">
      <button
        className="profile-chip profile-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="账号菜单"
      >
        <span className="avatar">{displayName.slice(0, 1)}</span>
        <span>{displayName}</span>
        <Bell size={15} color="#8490a2" />
        <ChevronDown size={14} color="#8490a2" />
      </button>
      {open && (
        <div className="profile-dropdown">
          <a href="/settings">
            <UserRound size={15} /> 个人资料
          </a>
          <a href="/settings">
            <Settings2 size={15} /> 工作区设置
          </a>
          <button onClick={logout}>
            <LogOut size={15} /> 退出登录
          </button>
        </div>
      )}
    </div>
  );
}

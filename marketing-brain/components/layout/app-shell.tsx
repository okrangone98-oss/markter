// 앱 셸 — 사이드바 + 탑바 + 메인 영역을 결합하는 레이아웃 래퍼
import * as React from "react";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AppShell({ children, title, subtitle }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-slate-100">
      <Sidebar />
      {/* 사이드바 너비(240px)만큼 좌측 여백 */}
      <div className="pl-60">
        <Topbar title={title} subtitle={subtitle} />
        <main className="min-h-[calc(100vh-3.5rem)] px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

// 앱 셸 — 사이드바 + 탑바 + 메인 영역을 결합하는 레이아웃 래퍼
// 서버 컴포넌트에서 사용자 정보를 가져와 탑바에 전달합니다.
import * as React from "react";

import { createClient } from "@/lib/supabase/server";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export async function AppShell({ children, title, subtitle }: AppShellProps) {
  // 미들웨어가 이미 인증을 보장하므로 user는 보통 존재합니다.
  // 환경변수 미설정 시 createClient가 throw 할 수 있어 try/catch로 감쌉니다.
  let userInfo: { name: string | null; email: string | null; avatarUrl: string | null } | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userInfo = {
        name:
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined) ||
          user.email?.split("@")[0] ||
          null,
        email: user.email ?? null,
        avatarUrl:
          (user.user_metadata?.avatar_url as string | undefined) ||
          (user.user_metadata?.picture as string | undefined) ||
          null,
      };
    }
  } catch {
    // 환경변수 미설정 시: 익명 모드로 진행
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-slate-100">
      <Sidebar />
      {/* 사이드바 너비(240px)만큼 좌측 여백 */}
      <div className="pl-60">
        <Topbar title={title} subtitle={subtitle} user={userInfo} />
        <main className="min-h-[calc(100vh-3.5rem)] px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

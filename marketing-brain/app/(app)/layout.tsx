// (app) 라우트 그룹 레이아웃 — 인증이 필요한 영역의 공통 셸
// 사이드바 + 탑바 + 메인을 한 번에 입힌다.
import * as React from "react";

import { AppShell } from "@/components/layout/app-shell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}

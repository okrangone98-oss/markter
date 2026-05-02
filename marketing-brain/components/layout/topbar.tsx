// 상단바 — 페이지 제목, 사용자 아바타, 설정 아이콘
"use client";

import { Settings, User, Bell } from "lucide-react";

import { Button } from "@/components/ui/button";

interface TopbarProps {
  // 페이지별 제목 (선택)
  title?: string;
  // 부제목/서브 텍스트 (선택)
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-md">
      {/* 좌측: 제목 영역 */}
      <div className="flex flex-col">
        {title ? (
          <h1 className="text-sm font-semibold text-slate-100">{title}</h1>
        ) : null}
        {subtitle ? (
          <p className="text-xs text-slate-500">{subtitle}</p>
        ) : null}
      </div>

      {/* 우측: 알림 / 설정 / 아바타 */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="알림">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="설정">
          <Settings className="h-4 w-4" />
        </Button>
        {/* 아바타 자리표시자 — 추후 실제 사용자 이미지로 대체 */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 ring-1 ring-slate-700">
          <User className="h-4 w-4 text-slate-300" />
        </div>
      </div>
    </header>
  );
}

// 좌측 사이드바 — 로고 + 8개 네비게이션 (분석/지식/생성/성장 그룹)
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  Users,
  Swords,
  Radar,
  WandSparkles,
  Mic2,
  Film,
  Sparkles,
  Brain,
  ExternalLink,
} from "lucide-react";

import { cn } from "@/lib/utils";

// 네비 아이템 타입 — 한 곳에서 정의해서 휴먼 에러 방지
type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

// 사이드바 메뉴 구성 — PRD §5 폴더 구조와 일치 (전체 한국어로 통일)
const NAV_GROUPS: NavGroup[] = [
  {
    title: "분석",
    items: [
      { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
      { href: "/insights", label: "인사이트", icon: TrendingUp },
    ],
  },
  {
    title: "지식",
    items: [
      { href: "/wiki", label: "위키", icon: BookOpen },
      { href: "/personas", label: "페르소나", icon: Users },
      { href: "/competitors", label: "경쟁사", icon: Swords },
      { href: "/trends", label: "트렌드", icon: Radar },
    ],
  },
  {
    title: "생성",
    items: [
      { href: "/studio", label: "콘텐츠 스튜디오", icon: WandSparkles },
      { href: "/tts", label: "AI 음성 (TTS)", icon: Mic2 },
      { href: "/video", label: "영상 메이커", icon: Film },
    ],
  },
  {
    title: "성장",
    items: [{ href: "/coach", label: "성장 코치", icon: Sparkles }],
  },
  {
    title: "도구함",
    items: [{ href: "/links", label: "링크 모음", icon: ExternalLink }],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-slate-800 bg-slate-950/95 backdrop-blur-sm">
      {/* 로고 영역 */}
      <Link
        href="/dashboard"
        className="flex h-14 items-center gap-2 border-b border-slate-800 px-5"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/15 ring-1 ring-[var(--color-primary)]/40">
          <Brain className="h-4 w-4 text-[var(--color-primary)]" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-slate-50">
          Marketing Brain
        </span>
      </Link>

      {/* 네비게이션 영역 */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-6">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {group.title}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                // 현재 경로가 해당 메뉴와 일치하는지 — 하위 라우트도 활성으로 표시
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive
                            ? "text-[var(--color-primary)]"
                            : "text-slate-500 group-hover:text-slate-200"
                        )}
                      />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* 하단 버전/푸터 */}
      <div className="border-t border-slate-800 px-5 py-3 text-[11px] text-slate-500">
        v0.2 · 사용할수록 똑똑해지는
      </div>
    </aside>
  );
}

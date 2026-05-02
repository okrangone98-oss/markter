// 상단바 — 페이지 제목, 사용자 아바타, 로그아웃, 사용 가이드
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Settings, User, Bell, LogOut, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TopbarUser {
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
}

interface TopbarProps {
  title?: string;
  subtitle?: string;
  user?: TopbarUser | null;
}

// 라우트별 자동 제목 매핑 (Topbar의 좌측 빈 공간 해소)
const PATHNAME_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "대시보드", subtitle: "주요 지표 한눈에" },
  "/insights": { title: "인사이트", subtitle: "패턴·트렌드 분석" },
  "/wiki": { title: "마케팅 지식 위키", subtitle: "Layer 1 · 누적 지식" },
  "/personas": { title: "페르소나", subtitle: "고객 모델 관리" },
  "/competitors": { title: "경쟁사", subtitle: "벤치마크 추적" },
  "/trends": { title: "트렌드", subtitle: "시장 흐름" },
  "/studio": { title: "콘텐츠 스튜디오", subtitle: "Layer 2 · 생성" },
  "/tts": { title: "AI 음성 (TTS)", subtitle: "한국어 음성 합성" },
  "/video": { title: "숏폼 영상 메이커", subtitle: "Ken Burns + 자막" },
  "/coach": { title: "성장 코치", subtitle: "Layer 3 · 인텔리전스" },
  "/links": { title: "마케터 링크함", subtitle: "큐레이션 도구함" },
  "/help": { title: "사용 가이드", subtitle: "Marketing Brain 사용법" },
};

function resolveTitle(pathname: string): { title: string; subtitle: string } {
  // 정확히 일치 우선
  if (PATHNAME_TITLES[pathname]) return PATHNAME_TITLES[pathname];
  // prefix 매칭 (서브 라우트 대비)
  for (const key of Object.keys(PATHNAME_TITLES)) {
    if (pathname.startsWith(key + "/")) return PATHNAME_TITLES[key];
  }
  return { title: "Marketing Brain", subtitle: "" };
}

export function Topbar({ title, subtitle, user }: TopbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const initial = (user?.name || user?.email || "?").charAt(0).toUpperCase();

  // props로 전달된 title/subtitle 우선, 없으면 pathname 기반 자동 매핑
  const auto = resolveTitle(pathname);
  const finalTitle = title ?? auto.title;
  const finalSubtitle = subtitle ?? auto.subtitle;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-md">
      {/* 좌측: 제목 영역 — 항상 채워짐 */}
      <div className="flex flex-col">
        <h1 className="text-sm font-semibold text-slate-100">{finalTitle}</h1>
        {finalSubtitle && (
          <p className="text-[11px] text-slate-500">{finalSubtitle}</p>
        )}
      </div>

      {/* 우측: 도움말 / 알림 / 설정 / 아바타 */}
      <div className="flex items-center gap-1">
        <Tooltip content="사용 가이드 보기">
          <Link href="/help">
            <Button variant="ghost" size="icon" aria-label="사용 가이드">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </Link>
        </Tooltip>

        <Tooltip content="알림 (준비 중)">
          <Button variant="ghost" size="icon" aria-label="알림" disabled>
            <Bell className="h-4 w-4" />
          </Button>
        </Tooltip>

        <Tooltip content="설정 (준비 중)">
          <Button variant="ghost" size="icon" aria-label="설정" disabled>
            <Settings className="h-4 w-4" />
          </Button>
        </Tooltip>

        {/* 아바타 + 드롭다운 */}
        <div className="relative ml-1" ref={menuRef}>
          <Tooltip content={user?.name || user?.email || "사용자 메뉴"}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 ring-1 ring-slate-700 hover:ring-[var(--color-primary)]/50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              aria-label="사용자 메뉴"
            >
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name || "User"}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : user ? (
                <span className="text-xs font-semibold text-[var(--color-primary)]">
                  {initial}
                </span>
              ) : (
                <User className="h-4 w-4 text-slate-300" />
              )}
            </button>
          </Tooltip>

          {menuOpen && (
            <div className={cn(
              "absolute right-0 top-10 z-40 w-56 rounded-lg border border-slate-800",
              "bg-slate-900 shadow-lg ring-1 ring-black/5"
            )}>
              {user ? (
                <>
                  <div className="px-3 py-3 border-b border-slate-800">
                    <p className="text-sm font-medium text-slate-100 truncate">
                      {user.name || "이름 없음"}
                    </p>
                    {user.email && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {user.email}
                      </p>
                    )}
                  </div>
                  <Link
                    href="/help"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    <HelpCircle className="h-3.5 w-3.5" /> 사용 가이드
                  </Link>
                  <form action="/auth/signout" method="POST">
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition"
                    >
                      <LogOut className="h-3.5 w-3.5" /> 로그아웃
                    </button>
                  </form>
                </>
              ) : (
                <a
                  href="/login"
                  className="block px-3 py-2 text-sm text-[var(--color-primary)] hover:bg-slate-800"
                >
                  로그인
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

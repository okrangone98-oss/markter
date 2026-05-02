// 상단바 — 페이지 제목, 사용자 아바타, 로그아웃
"use client";

import { useState, useRef, useEffect } from "react";
import { Settings, User, Bell, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
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

export function Topbar({ title, subtitle, user }: TopbarProps) {
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

        {/* 아바타 + 드롭다운 */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 ring-1 ring-slate-700 hover:ring-[var(--color-primary)]/50 transition"
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

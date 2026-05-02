// 로그인 페이지 — Google OAuth 시작점
// useSearchParams() 는 Next.js 15+ 에서 Suspense 경계 필요 (정적 prerender 회피).
"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Brain } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/15 ring-1 ring-[var(--color-primary)]/30">
            <Brain className="h-7 w-7 text-[var(--color-primary)]" />
          </div>
          <h1 className="text-xl font-semibold text-slate-50 tracking-tight">
            Marketing Brain
          </h1>
          <p className="text-xs text-slate-500 text-center">
            사용할수록 똑똑해지는 마케팅 동반자
          </p>
        </div>

        {/* 로그인 카드 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
          <h2 className="mb-1 text-base font-semibold text-slate-100">
            로그인
          </h2>
          <p className="mb-5 text-xs text-slate-400">
            구글 계정으로 시작하세요. 데이터는 Supabase에 안전하게 저장됩니다.
          </p>

          <Suspense fallback={<LoginButtonFallback />}>
            <LoginButton />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-600">
          v0.1 (단일 HTML)을 쓰려면{" "}
          <a
            href="https://okrangone98-oss.github.io/markter/"
            className="text-[var(--color-primary)] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            여기
          </a>
        </p>
      </div>
    </div>
  );
}

function LoginButtonFallback() {
  return (
    <Button disabled className="w-full bg-white text-slate-900" size="lg">
      <span className="flex items-center gap-2.5">
        <GoogleIcon />
        Google 로 로그인
      </span>
    </Button>
  );
}

function LoginButton() {
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const errorParam = params.get("error");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorParam);

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
      // OAuth 리다이렉트가 시작되면 이 라인 이후는 실행되지 않음
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={signInWithGoogle}
        disabled={loading}
        className="w-full bg-white text-slate-900 hover:bg-slate-100"
        size="lg"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
            구글 로그인 진행 중...
          </span>
        ) : (
          <span className="flex items-center gap-2.5">
            <GoogleIcon />
            Google 로 로그인
          </span>
        )}
      </Button>

      {error && (
        <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          ⚠ {error}
        </div>
      )}
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}


// 미들웨어용 Supabase 세션 갱신 헬퍼
// - 모든 요청에서 세션 쿠키를 자동으로 갱신합니다.
// - 인증이 필요한 라우트 보호도 여기서 처리합니다 (/login, /auth/* 는 공개).
// - 자세한 패턴: https://supabase.com/docs/guides/auth/server-side/nextjs

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./types";

// 인증 없이 접근 가능한 경로 prefix 목록
const PUBLIC_PATHS = ["/login", "/auth/", "/api/auth/", "/_next/", "/favicon"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

/**
 * 미들웨어에서 호출해 Supabase 세션을 갱신합니다.
 * 반환된 NextResponse 를 그대로 미들웨어에서 return 하세요.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  // 응답 객체를 먼저 만들어 두고, Supabase 가 쿠키를 쓰면 함께 업데이트합니다.
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 환경변수가 없으면 인증 없이 그대로 통과시킵니다 (로컬 초기 셋업 단계 대응).
  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // 1) 요청 객체의 쿠키를 갱신해 다음 핸들러에서도 최신 값을 쓰게 합니다.
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        // 2) 응답을 새로 만들어 갱신된 요청 쿠키를 반영합니다.
        supabaseResponse = NextResponse.next({ request });
        // 3) 응답 쿠키도 갱신합니다.
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  // IMPORTANT: getUser() 호출은 세션 토큰을 검증·갱신하는 핵심 동작입니다.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    // 네트워크 오류 등은 미들웨어를 막지 않도록 콘솔에만 남깁니다.
    console.error("[Supabase middleware] 세션 갱신 중 오류:", error);
  }

  // 인증 게이팅 — 비공개 라우트인데 세션이 없으면 /login 으로 리다이렉트
  const pathname = request.nextUrl.pathname;
  if (!user && !isPublicPath(pathname) && pathname !== "/") {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // 이미 로그인했는데 /login 에 접근하면 dashboard 로 보냄
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin));
  }

  return supabaseResponse;
}

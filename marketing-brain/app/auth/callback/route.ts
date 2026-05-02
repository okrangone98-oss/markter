// OAuth 콜백 — Google 인증 후 Supabase가 이 라우트로 리다이렉트
// code 쿼리 파라미터를 세션 토큰으로 교환하고, profiles 행을 생성합니다.
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";
  const errorParam = url.searchParams.get("error");

  // OAuth 거부/오류 시 로그인 페이지로 메시지와 함께 복귀
  if (errorParam) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorParam)}`, url.origin)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin)
    );
  }

  // 로그인 성공 → profiles 행 자동 생성 (없을 때만)
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!existing) {
      await supabase
        .from("profiles")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert({
          id: user.id,
          display_name:
            (user.user_metadata?.full_name as string | undefined) ||
            (user.user_metadata?.name as string | undefined) ||
            user.email?.split("@")[0] ||
            null,
        } as never);
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}

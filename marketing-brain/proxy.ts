// Next.js 16 Proxy (이전 이름: Middleware)
// - Next.js 16부터 `middleware.ts` → `proxy.ts` 로 파일명이 변경되었습니다.
// - 기능은 동일하며, 모든 요청이 라우트에 도달하기 전에 실행됩니다.
// - 여기서는 매 요청마다 Supabase 세션을 자동 갱신합니다.

import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // _next/static, _next/image, favicon, 이미지 파일 등은 프록시를 거치지 않습니다.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

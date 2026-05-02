// 브라우저(클라이언트 컴포넌트)에서 사용하는 Supabase 클라이언트
// - 'use client' 컴포넌트나 훅 안에서만 호출하세요.
// - 쿠키는 브라우저가 자동 관리하므로 별도 핸들러가 필요 없습니다.

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * 브라우저용 Supabase 클라이언트를 생성합니다.
 * 환경변수 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 가 필요합니다.
 */
export function createClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // 환경변수 누락 시 즉시 명확한 에러를 띄워 디버깅을 쉽게 합니다.
    throw new Error(
      "[Supabase] NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다. .env.local 을 확인하세요."
    );
  }

  return createBrowserClient<Database>(url, anonKey);
}

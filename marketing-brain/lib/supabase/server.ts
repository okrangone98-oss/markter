// 서버(Server Component / Route Handler / Server Action)에서 사용하는 Supabase 클라이언트
// - Next.js 15+ 에서는 cookies() 가 비동기이므로 createClient 도 async 입니다.
// - Server Component 에서는 쿠키 쓰기가 차단될 수 있어 try/catch 로 무시합니다.

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * 서버용 Supabase 클라이언트를 생성합니다.
 * 호출 예시:
 *   const supabase = await createClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 */
export async function createClient(): Promise<SupabaseClient<Database>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "[Supabase] NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다. .env.local 을 확인하세요."
    );
  }

  // Next.js 15+ : cookies() 는 Promise 를 반환합니다.
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      // Supabase 가 세션 쿠키를 읽을 때 호출됩니다.
      getAll() {
        return cookieStore.getAll();
      },
      // Supabase 가 세션 갱신·로그인·로그아웃 시 쿠키를 쓸 때 호출됩니다.
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component 안에서는 쿠키 쓰기가 차단됩니다.
          // 이 경우 미들웨어에서 세션 갱신이 처리되므로 안전하게 무시합니다.
        }
      },
    },
  });
}

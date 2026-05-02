// 서버 측 API 키 헬퍼 — BYOK 우선, 환경변수 폴백
// 클라이언트 코드에서 절대 호출 금지 (Supabase RPC 의 security definer 함수 의존).

import { createClient } from "@/lib/supabase/server";

export type ApiProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "replicate"
  | "elevenlabs"
  | "openrouter";

// provider → 환경변수 폴백 키 이름
const ENV_FALLBACK: Record<ApiProvider, string | null> = {
  openai: null, // BYOK 전용 (서버 키 없음)
  anthropic: null,
  google: null,
  replicate: null,
  elevenlabs: null,
  openrouter: "OPENROUTER_API_KEY", // Marketing Brain 프로젝트에 설정된 무료 폴백
};

/**
 * 사용자의 BYOK 키를 가져오고, 없으면 서버 환경변수로 폴백.
 *
 * 반환값:
 *  - { key: string, source: "byok" | "env" } 사용 가능한 키 발견
 *  - { key: null, source: "missing" }            등록된 키 없음 → 호출자가 에러 처리
 *
 * 사용 예:
 *   const { key, source } = await getServerApiKey("openai");
 *   if (!key) return Response.json({ error: "OpenAI 키 미설정" }, { status: 400 });
 */
export async function getServerApiKey(
  provider: ApiProvider
): Promise<{ key: string | null; source: "byok" | "env" | "missing" }> {
  // 1) BYOK 시도 (로그인 상태일 때만)
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.rpc as any)("get_my_api_key", {
        provider,
      });
      if (!error && typeof data === "string" && data.trim().length > 0) {
        return { key: data, source: "byok" };
      }
    }
  } catch {
    // RPC 미적용 등은 silently 폴백
  }

  // 2) 환경변수 폴백
  const envName = ENV_FALLBACK[provider];
  if (envName) {
    const v = process.env[envName];
    if (v && v.trim().length > 0) return { key: v, source: "env" };
  }

  return { key: null, source: "missing" };
}

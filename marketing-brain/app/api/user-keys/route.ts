// /api/user-keys — BYOK API 키 관리 (저장 상태 조회 + 저장/삭제)
// 보안: 평문 키는 절대 클라이언트로 응답하지 않음. 마스킹 상태만 반환.
import type { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const PROVIDERS = ["openai", "anthropic", "replicate", "elevenlabs"] as const;
type Provider = (typeof PROVIDERS)[number];

function isProvider(s: string): s is Provider {
  return (PROVIDERS as readonly string[]).includes(s);
}

// GET — 어떤 키가 설정되어 있는지 (boolean 만 반환, 평문 X)
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });

  // RPC 호출 — RLS 안에서 자동으로 본인 데이터만 반환
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("get_my_api_key_status");
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const row = (data as Array<{
    has_openai: boolean;
    has_anthropic: boolean;
    has_replicate: boolean;
    has_elevenlabs: boolean;
    updated_at: string;
  }>)?.[0];

  return Response.json({
    keys: {
      openai: row?.has_openai ?? false,
      anthropic: row?.has_anthropic ?? false,
      replicate: row?.has_replicate ?? false,
      elevenlabs: row?.has_elevenlabs ?? false,
    },
    updated_at: row?.updated_at ?? null,
  });
}

// POST { provider, key } — 키 저장 또는 삭제(빈 문자열)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });

  let body: { provider?: string; key?: string };
  try { body = await request.json(); }
  catch { return Response.json({ error: "잘못된 JSON" }, { status: 400 }); }

  const provider = (body.provider ?? "").trim().toLowerCase();
  if (!isProvider(provider)) {
    return Response.json({ error: "지원하지 않는 provider" }, { status: 400 });
  }

  const key = (body.key ?? "").trim();
  if (key.length > 500) {
    return Response.json({ error: "키 길이가 너무 큼" }, { status: 400 });
  }

  // RPC 호출 — pgcrypto 로 암호화 후 저장
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.rpc as any)("set_my_api_key", {
    provider,
    plain_key: key,
  });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true, provider, action: key ? "set" : "deleted" });
}

// ── /api/remake/analyze — 유튜브 쇼츠 1-shot 분석 (Gemini video understanding) ──
// 다운로드 단계 없이 Gemini 가 YouTube URL을 직접 입력받아 트랜스크립트+DNA+씬을 동시 반환.
// BYOK 키는 서버에서 RPC 로 직접 조회 (클라이언트 노출 금지).

import type { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";

interface AnalyzeBody {
  url?: string;
}

const SYSTEM_PROMPT = `이 YouTube Shorts 영상을 분석해서 아래 JSON 스키마로만 응답하세요. 다른 설명·코드펜스 금지.
{
  "meta": { "title": "string", "durationSec": number },
  "transcript": "string (전체 음성 받아쓰기)",
  "dna": {
    "hookText": "string (오프닝 0~3초 문구)",
    "hookType": "string (질문/충격/통계/스토리 등)",
    "pacing": "string (빠름/보통/느림 + 컷 빈도)",
    "visualStyle": "string (분위기/색감/촬영기법)",
    "ctaPattern": "string (마지막 콜투액션 패턴)",
    "structureBeats": ["string", "string", "..."]
  },
  "scenes": [
    { "startSec": number, "endSec": number, "description": "string", "mood": "string" }
  ]
}`;

function extractJson(text: string): unknown {
  // 코드펜스 제거 후 첫 { ... } 블록 파싱
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Gemini 응답에서 JSON을 찾을 수 없습니다.");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function POST(req: NextRequest) {
  // 본문 파싱
  let body: AnalyzeBody;
  try {
    body = (await req.json()) as AnalyzeBody;
  } catch {
    return Response.json({ error: "잘못된 JSON" }, { status: 400 });
  }
  const url = (body.url ?? "").trim();
  if (!url || !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url)) {
    return Response.json(
      { error: "유효한 YouTube URL이 필요합니다." },
      { status: 400 },
    );
  }

  // 인증
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  // 구글 키 조회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: googleKey, error: keyErr } = await (supabase.rpc as any)(
    "get_my_api_key",
    { provider: "google" },
  );
  if (keyErr) {
    return Response.json({ error: keyErr.message }, { status: 500 });
  }
  if (!googleKey || typeof googleKey !== "string") {
    return Response.json(
      {
        error: "GOOGLE_KEY_MISSING",
        hint: "구글 AI Studio 키가 필요합니다. 설정 → API 키에서 등록하세요.",
      },
      { status: 400 },
    );
  }

  // Gemini 호출
  const geminiBody = {
    contents: [
      {
        parts: [
          { fileData: { fileUri: url } },
          { text: SYSTEM_PROMPT },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  };

  let geminiRes: Response;
  try {
    geminiRes = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(googleKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "네트워크 오류";
    return Response.json(
      { error: `Gemini 호출 실패: ${msg}` },
      { status: 502 },
    );
  }

  if (!geminiRes.ok) {
    const errJson = (await geminiRes.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    return Response.json(
      {
        error: `Gemini 분석 실패: ${errJson.error?.message ?? `HTTP ${geminiRes.status}`}`,
      },
      { status: 502 },
    );
  }

  const data = (await geminiRes.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    return Response.json(
      { error: "Gemini 응답이 비어있습니다." },
      { status: 502 },
    );
  }

  let parsed: {
    meta?: { title?: string; durationSec?: number };
    transcript?: string;
    dna?: Record<string, unknown>;
    scenes?: unknown[];
  };
  try {
    parsed = extractJson(text) as typeof parsed;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "파싱 실패";
    return Response.json(
      { error: `분석 결과 파싱 실패: ${msg}`, raw: text.slice(0, 500) },
      { status: 502 },
    );
  }

  // 90초 제한 체크
  const durationSec = parsed.meta?.durationSec ?? 0;
  if (durationSec > 90) {
    return Response.json(
      {
        error: `영상 길이가 ${durationSec}초입니다. 90초 이하의 쇼츠만 지원합니다.`,
      },
      { status: 400 },
    );
  }

  return Response.json(parsed);
}

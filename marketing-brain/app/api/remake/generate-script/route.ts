// ── /api/remake/generate-script — DNA + 사용자 브리프 → 새 스크립트 SSE 스트림 ──
// 원본을 그대로 베끼지 않고 같은 구조 패턴만 차용합니다.

import type { NextRequest } from "next/server";

import { streamOpenRouter } from "@/lib/llm/openrouter";
import type { LLMMessage } from "@/lib/llm/types";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;

interface ScriptBody {
  dna?: Record<string, unknown>;
  transcriptSnippet?: string;
  userBrief?: string;
  topic?: string;
}

const SYSTEM = `당신은 마케팅 콘텐츠 라이터입니다. 아래 영상의 DNA와 사용자 브리프를 바탕으로 새 쇼츠/릴스 스크립트를 작성하세요. 원본을 복제하지 말고 같은 구조 패턴(훅 타입, 페이싱, 비트 흐름, CTA 패턴)만 참고하세요.
출력 형식: [씬 1] ... [씬 2] ... 처럼 씬 단위로 분할. 각 씬은 1~2 문장의 자막 + 짧은 비주얼 묘사. 한국어로.`;

function buildUser(b: ScriptBody): string {
  const dnaStr = JSON.stringify(b.dna ?? {}, null, 2);
  const snippet = (b.transcriptSnippet ?? "").slice(0, 1200);
  return [
    `# 원본 영상 DNA`,
    "```json",
    dnaStr,
    "```",
    "",
    `# 원본 트랜스크립트 발췌`,
    snippet,
    "",
    `# 사용자 주제`,
    b.topic?.trim() || "(미지정)",
    "",
    `# 사용자 브리프`,
    b.userBrief?.trim() || "(없음)",
    "",
    `# 작성 지시`,
    "- 위 DNA의 구조 패턴만 흡수해 새 스크립트 작성",
    "- 6~10개 씬으로 분할, 각 씬은 [씬 N] 헤더로 시작",
    "- 마지막 씬은 CTA",
  ].join("\n");
}

export async function POST(req: NextRequest) {
  let body: ScriptBody;
  try {
    body = (await req.json()) as ScriptBody;
  } catch {
    return Response.json({ error: "잘못된 JSON" }, { status: 400 });
  }
  if (!body.dna || typeof body.dna !== "object") {
    return Response.json({ error: "dna 필드가 필요합니다." }, { status: 400 });
  }

  // 인증 + 키 조회 (없으면 환경변수 fallback)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  // BYOK openrouter/openai 키 조회 (둘 다 OpenRouter로 사용 가능). 우선 openai 키 사용, 없으면 env
  let apiKey: string | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: openaiKey } = await (supabase.rpc as any)("get_my_api_key", {
    provider: "openai",
  });
  if (openaiKey && typeof openaiKey === "string") {
    apiKey = openaiKey;
  } else {
    apiKey = process.env.OPENROUTER_API_KEY ?? null;
  }
  if (!apiKey) {
    return Response.json(
      {
        error: "OPENROUTER_KEY_MISSING",
        hint: "OpenRouter/OpenAI 키가 필요합니다. 설정 → API 키에서 등록하거나 관리자에게 문의하세요.",
      },
      { status: 400 },
    );
  }

  const messages: LLMMessage[] = [
    { role: "system", content: SYSTEM },
    { role: "user", content: buildUser(body) },
  ];

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const delta of streamOpenRouter(
          { messages, stream: true, temperature: 0.85, maxTokens: 1500 },
          apiKey!,
        )) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`),
          );
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : "알 수 없는 오류";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`),
        );
        controller.close();
      }
    },
  });

  return new Response(readable, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

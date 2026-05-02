// ── /api/generate — OpenRouter 프록시 라우트 ──
// 클라이언트는 절대 OPENROUTER_API_KEY 를 만질 수 없도록, 모든 LLM 호출은 이 서버 라우트를 거칩니다.
// PRD §11 가드레일: LLM 키는 서버 전용.

import { NextRequest } from 'next/server';
import { buildPrompt } from '@/lib/llm/prompts';
import { callOpenRouter, streamOpenRouter } from '@/lib/llm/openrouter';
import type {
  BuildPromptInput,
  ContentType,
  LLMMessage,
  ToneStyle,
} from '@/lib/llm/types';

export const runtime = 'nodejs';

interface GenerateRequestBody {
  input: BuildPromptInput;
  stream?: boolean;
}

/**
 * 입력 최소 검증 — type, topic 필수
 * (스트릭트 모드라 contentType / tone 화이트리스트 검사도 가벼이 수행)
 */
function validateInput(body: unknown): {
  ok: true;
  input: BuildPromptInput;
  stream: boolean;
} | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: '요청 본문이 비어있습니다.' };
  }
  const b = body as Partial<GenerateRequestBody>;
  const input = b.input;
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'input 필드가 필요합니다.' };
  }
  if (!input.type || typeof input.type !== 'string') {
    return { ok: false, error: '콘텐츠 타입(type)이 필요합니다.' };
  }
  if (!input.topic || typeof input.topic !== 'string' || !input.topic.trim()) {
    return { ok: false, error: '주제(topic)가 필요합니다.' };
  }
  if (!input.tone || typeof input.tone !== 'string') {
    return { ok: false, error: '톤(tone)이 필요합니다.' };
  }

  // 안전한 캐스팅 — 잘못된 값이면 buildPrompt 내부 fallback 으로 흡수됨
  const normalized: BuildPromptInput = {
    type: input.type as ContentType,
    topic: input.topic,
    tone: input.tone as ToneStyle,
    audience: input.audience,
    keywords: input.keywords,
    brandVoice: input.brandVoice,
    avoidWords: input.avoidWords,
    contextPages: Array.isArray(input.contextPages)
      ? input.contextPages.filter((p): p is string => typeof p === 'string')
      : undefined,
  };

  return {
    ok: true,
    input: normalized,
    stream: Boolean(b.stream),
  };
}

export async function POST(req: NextRequest) {
  // ── 환경 변수 가드 ──
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'OPENROUTER_API_KEY 환경변수가 설정되지 않았습니다.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // ── 본문 파싱 ──
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: '잘못된 JSON 형식입니다.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // ── 입력 검증 ──
  const v = validateInput(body);
  if (!v.ok) {
    return new Response(
      JSON.stringify({ error: v.error }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const { input, stream } = v;

  // ── 프롬프트 합성 ──
  const { system, user } = buildPrompt(input);
  const messages: LLMMessage[] = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];

  // ── 스트리밍 분기 ──
  if (stream) {
    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const delta of streamOpenRouter(
            { messages, stream: true },
            apiKey,
          )) {
            const payload = `data: ${JSON.stringify({ delta })}\n\n`;
            controller.enqueue(encoder.encode(payload));
          }
          // 종료 신호
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          const message = err instanceof Error ? err.message : '알 수 없는 오류';
          const payload = `data: ${JSON.stringify({ error: message })}\n\n`;
          controller.enqueue(encoder.encode(payload));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  }

  // ── 비스트리밍 분기 ──
  try {
    const content = await callOpenRouter({ messages }, apiKey);
    return new Response(
      JSON.stringify({ content }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return new Response(
      JSON.stringify({ error: `생성 실패: ${message}` }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

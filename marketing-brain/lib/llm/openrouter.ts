// ── OpenRouter SDK 래퍼 ──
// 서버 전용으로 호출하는 것을 권장 (API 키 노출 방지).
// v0.1 의 callGemini / callLLMOnce 두 호출부의 동작을 합쳐 타입화한 모듈입니다.

import type { LLMRequestOptions } from './types';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * 폴백 모델 체인 — v0.1 line 1843, 4156 두 곳을 합친 가장 풍부한 목록
 * 위에서부터 시도하다 429/403/빈응답일 때 다음 모델로 넘어갑니다.
 */
export const FREE_MODELS: string[] = [
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'openrouter/free',
  'deepseek/deepseek-r1:free',
  'deepseek/deepseek-chat:free',
  'google/gemma-3-27b-it:free',
  'nvidia/llama-3.1-nemotron-70b-instruct:free',
];

/**
 * 공통 헤더 빌더 — 서버에서 호출하므로 NEXT_PUBLIC_APP_URL 또는 localhost를 Referer로 사용
 */
function buildHeaders(apiKey: string): HeadersInit {
  const referer =
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': referer,
    'X-Title': 'Marketing Brain',
  };
}

/**
 * 요청 바디 빌더
 */
function buildBody(
  opts: LLMRequestOptions,
  model: string,
  stream: boolean,
): string {
  return JSON.stringify({
    model,
    stream,
    temperature: opts.temperature ?? 0.8,
    max_tokens: opts.maxTokens ?? 2048,
    messages: opts.messages,
  });
}

/**
 * 단발 비스트리밍 호출 — JSON 파싱이 필요한 경로(요약/정제 등)에서 사용.
 * FREE_MODELS 폴백 체인을 따라가며 첫 성공 응답을 반환합니다.
 */
export async function callOpenRouter(
  opts: LLMRequestOptions,
  apiKey: string,
): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenRouter API 키가 설정되지 않았습니다.');
  }

  const models = opts.model ? [opts.model] : FREE_MODELS;
  let lastError: string = '';

  for (const model of models) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: buildHeaders(apiKey),
        body: buildBody(opts, model, false),
      });

      if (!res.ok) {
        // 한도/접근불가면 다음 모델 시도
        const errJson = (await res.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        lastError = errJson.error?.message || `HTTP ${res.status}`;
        if (res.status === 429 || res.status === 403) continue;
        throw new Error(lastError);
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        lastError = '응답이 비어있습니다.';
        continue;
      }
      return content;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      // 마지막 모델까지 실패하면 throw
    }
  }

  throw new Error(`LLM 호출 실패: ${lastError || '알 수 없는 오류'}`);
}

/**
 * 스트리밍 호출 — SSE 라인을 파싱해 delta.content 만 yield 합니다.
 * 첫 모델이 실패하면(429/403/빈응답) 다음 모델로 폴백합니다.
 *
 * 사용 예:
 *   for await (const delta of streamOpenRouter(opts, key)) { ... }
 */
export async function* streamOpenRouter(
  opts: LLMRequestOptions,
  apiKey: string,
): AsyncGenerator<string, void, unknown> {
  if (!apiKey) {
    throw new Error('OpenRouter API 키가 설정되지 않았습니다.');
  }

  const models = opts.model ? [opts.model] : FREE_MODELS;
  let lastError: string = '';

  for (const model of models) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: buildHeaders(apiKey),
        body: buildBody(opts, model, true),
      });

      if (!res.ok) {
        const errJson = (await res.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        lastError = errJson.error?.message || `HTTP ${res.status}`;
        if (res.status === 429 || res.status === 403) continue;
        throw new Error(lastError);
      }

      if (!res.body) {
        lastError = '스트림 본문이 없습니다.';
        continue;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let gotContent = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        // SSE는 라인 단위로 끊어 처리; 마지막 불완전 라인은 버퍼에 남김
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (!data || data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            const text = parsed.choices?.[0]?.delta?.content;
            if (text) {
              gotContent = true;
              yield text;
            }
          } catch {
            // 부분/깨진 JSON은 조용히 스킵 (다음 청크에서 회복됨)
          }
        }
      }

      if (!gotContent) {
        lastError = '응답이 비어있습니다.';
        continue;
      }

      // 성공적으로 한 모델이 끝까지 스트림을 마쳤으면 종료
      return;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      // 다음 모델 시도
    }
  }

  throw new Error(`LLM 스트리밍 실패: ${lastError || '알 수 없는 오류'}`);
}

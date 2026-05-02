// ── 클라이언트 측 /api/generate 래퍼 ──
// 컴포넌트는 이 파일의 함수만 호출하면 됩니다 (절대 OpenRouter를 직접 호출하지 않음).

import type { BuildPromptInput } from './types';

/**
 * 비스트리밍 단발 호출 — 최종 텍스트만 받음
 */
export async function generate(input: BuildPromptInput): Promise<string> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, stream: false }),
  });

  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(errBody.error || `생성 실패: HTTP ${res.status}`);
  }

  const data = (await res.json()) as { content?: string; error?: string };
  if (data.error) throw new Error(data.error);
  if (!data.content) throw new Error('빈 응답');
  return data.content;
}

/**
 * 스트리밍 호출 — onDelta 콜백으로 매 청크를 흘려보내고, 종료 후 누적 텍스트를 반환.
 * AbortController.signal 을 옵션으로 받습니다.
 * model 옵션: 명시하면 해당 OpenRouter 모델 ID 사용 (BYOK 키 필요), 미지정 시 무료 폴백 체인.
 */
export async function streamGenerate(
  input: BuildPromptInput,
  onDelta: (chunk: string) => void,
  options?: { signal?: AbortSignal; model?: string },
): Promise<string> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, stream: true, model: options?.model }),
    signal: options?.signal,
  });

  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(errBody.error || `스트리밍 실패: HTTP ${res.status}`);
  }
  if (!res.body) {
    throw new Error('스트림 본문이 없습니다.');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulated = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (!data || data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data) as {
            delta?: string;
            error?: string;
          };
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          if (parsed.delta) {
            accumulated += parsed.delta;
            onDelta(parsed.delta);
          }
        } catch (err) {
          // 라우트가 흘려보낸 명시적 에러는 다시 throw
          if (err instanceof Error && err.message && !err.message.startsWith('Unexpected token')) {
            throw err;
          }
          // 부분 JSON은 다음 청크에서 회복되므로 스킵
        }
      }
    }
  } catch (err) {
    // AbortError 는 그대로 위로
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    throw err;
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // 이미 해제됐을 수 있음
    }
  }

  return accumulated;
}

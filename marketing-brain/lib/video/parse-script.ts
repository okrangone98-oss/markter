// 콘텐츠 스튜디오에서 만든 대본·스크립트를 영상 슬라이드로 자동 분할
// v0.1 의 parseScriptToScenes 로직을 그대로 포팅 (검증된 휴리스틱).

export interface ParsedSlide {
  title: string;
  body: string;
  // /remake 등에서 미리 생성된 이미지 URL 을 함께 전달할 때 사용 (옵셔널).
  imageUrl?: string;
}

/**
 * 스크립트 텍스트를 슬라이드 배열로 분할합니다.
 * 우선순위:
 *  1) 명시적 씬 마커 ([씬 N], [장면 N], [N초~M초], [N/M], [scene N]) 가 있으면 그 단위로 분할
 *  2) 없으면 빈 줄(2회 이상 개행) 단위로 분할
 *  3) 그것도 없으면 한 슬라이드로 통합
 *
 * 본문은 슬라이드 자막에 적합하도록 180자로 cap.
 */
export function parseScriptToSlides(raw: string): ParsedSlide[] {
  const text = (raw || "").trim();
  if (!text) return [];

  // 씬 마커 정규식 (Korean + English)
  const sceneMarker = /\[(?:씬|장면|scene|씬\s*\d+|\d+\s*[~\-]\s*\d+\s*초|\d+\/\d+)[^\]]*\]/gi;

  if (sceneMarker.test(text)) {
    sceneMarker.lastIndex = 0; // reset after test
    const parts = text.split(sceneMarker).map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) {
      return parts.map((p, i) => makeSlide(p, i));
    }
  }

  // 빈 줄 단위 분할
  const blocks = text.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  if (blocks.length >= 2) {
    return blocks.map((p, i) => makeSlide(p, i));
  }

  // 단일 블록 — 한 슬라이드로
  return [makeSlide(text, 0)];
}

function makeSlide(block: string, index: number): ParsedSlide {
  // 첫 줄을 헤드라인으로, 나머지를 본문으로
  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { title: `씬 ${index + 1}`, body: "" };
  }

  // 첫 줄이 짧고 (40자 이하) 마침표로 끝나지 않으면 헤드라인으로 사용
  const first = lines[0];
  const looksLikeHeadline = first.length <= 40 && !/[.。!?！？]\s*$/.test(first);

  if (looksLikeHeadline && lines.length > 1) {
    const body = lines.slice(1).join(" ").slice(0, 180);
    return { title: first.slice(0, 60), body };
  }

  return {
    title: `씬 ${index + 1}`,
    body: lines.join(" ").slice(0, 180),
  };
}

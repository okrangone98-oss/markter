// ── 프롬프트 빌더 ──
// v0.1 단일 HTML의 buildPrompt 함수를 그대로 포팅했습니다.
// (line 1718~ 의 toneMap, typeInstructions, system/user 합성 로직)

import type { BuildPromptInput, ContentType, ToneStyle } from './types';

/**
 * 톤 스타일 → 한국어 문체 지침 매핑 (v0.1 line 1719)
 */
export const TONE_MAP: Record<ToneStyle, string> = {
  professional: '전문적이고 신뢰감 있는',
  casual: '친근하고 캐주얼한',
  emotional: '감성적이고 에세이 같은',
  witty: '재치 있고 유머러스한',
  urgent: '긴박감 있고 행동을 유도하는',
  storytelling: '이야기 형식의 스토리텔링',
};

/**
 * 콘텐츠 타입별 작성 지침 (v0.1 line 1728~)
 * — 한 번 미세조정한 카피라 verbatim으로 보존합니다.
 */
export const TYPE_INSTRUCTIONS: Record<ContentType, string> = {
  blog_intro: `블로그 글의 도입부(인트로)를 작성하세요. 독자를 끌어당기는 첫 문장으로 시작해 3~4문단으로 작성하세요.`,
  blog_full: `SEO 최적화된 블로그 글 전체를 작성하세요. 제목, 소제목(H2), 본문, 마무리 구성으로 1,200~1,500자 내외로 작성하세요.`,
  email_cold: `콜드 이메일을 작성하세요. 제목줄, 도입, 가치 제안, CTA 구조로 작성하세요.`,
  email_newsletter: `뉴스레터 이메일을 작성하세요. 매력적인 제목, 본문, 구독자 행동 유도로 구성하세요.`,
  instagram_feed: `인스타그램 피드 캡션을 작성하세요. 첫 줄 후킹, 본문, 해시태그 10개 포함해서 작성하세요.`,
  instagram_story: `인스타그램 스토리용 짧고 강렬한 문구 5개를 작성하세요.`,
  thread_series: `5부작 스레드를 작성하세요. 1편: 후킹/도입, 2~4편: 핵심 내용, 5편: 마무리+CTA 구조로 각 편을 [1/5] 형식으로 구분하세요.`,
  twitter_thread: `X(트위터) 스레드를 작성하세요. 각 트윗은 280자 이내로, [1/n] 형식으로 구분하세요.`,
  facebook_post: `페이스북 포스트를 작성하세요. 참여를 유도하는 질문이나 CTA를 포함하세요.`,
  product_detail: `상세페이지 텍스트를 작성하세요. 헤드라인, 서브헤드, 특징 3가지, 고객 후기 예시, CTA 순서로 작성하세요.`,
  ad_copy: `광고 카피 3가지 버전(A/B/C)을 작성하세요. 각각 헤드라인과 서브카피를 포함하세요.`,
  slogan: `브랜드 슬로건 5개를 작성하세요. 짧고 기억에 남는 문구로 작성하세요.`,
  cta_variants: `CTA(행동 유도) 문구 5가지 변형을 작성하세요. 강도와 톤이 다른 버전으로 작성하세요.`,
  youtube_script: `유튜브 영상 대본을 작성하세요. [인트로 (30초)], [본론 1], [본론 2], [본론 3], [아웃트로 + CTA] 구조로 작성하세요.`,
  shorts_script: `60초 쇼츠/릴스 대본을 작성하세요. 초 단위로 [0~5초: ...] 형식으로 씬을 구분하세요.`,
  tts_narration: `TTS 나레이션 원고를 작성하세요. 읽기 편하고 자연스러운 구어체로 작성하세요.`,
  video_subtitle: `영상 자막 텍스트를 작성하세요. 짧은 단위로 끊어서 자막에 적합한 형태로 작성하세요.`,
  proposal: `기획서 개요를 작성하세요. 배경, 목적, 주요 내용, 기대효과, 일정 구조로 작성하세요.`,
  report_summary: `보고서 요약을 작성하세요. 핵심 내용, 주요 수치, 결론, 권고사항 구조로 작성하세요.`,
  faq: `FAQ 10개를 작성하세요. Q: A: 형식으로 실제 고객이 물을 만한 질문과 답변을 작성하세요.`,
  meeting_minutes: `회의록을 정리하세요. 회의 목적, 주요 논의사항, 결정사항, 다음 액션 아이템 구조로 작성하세요.`,
  press_release: `보도자료를 작성하세요. 핵심 헤드라인, 리드 문단(언제/어디서/누가/무엇을/왜), 본문, 인용구, 회사 소개 순서로 작성하세요.`,
};

/**
 * buildPrompt — system/user 메시지 한 쌍을 만들어 반환합니다.
 *
 * v0.1 원본 동작:
 *  - 톤 + 대상 독자 + 브랜드 문체 + 금지 표현을 system 프롬프트로 합성
 *  - 타입별 instruction + 주제 + 키워드를 user 프롬프트로 합성
 *  - 마크다운 없이 깔끔한 텍스트 출력 강제
 *
 * 추가 사항(이번 버전):
 *  - contextPages가 제공되면 system 끝에 "[관련 마케팅 지식 위키 — 이 정보를 적극 활용하세요]" 블록을 주입
 *    (v0.1의 버전에서 buildPrompt를 래핑해 위키 컨텍스트를 붙이던 것과 동일한 결과물)
 */
export function buildPrompt(input: BuildPromptInput): {
  system: string;
  user: string;
} {
  const {
    type,
    topic,
    tone,
    audience,
    keywords,
    brandVoice,
    avoidWords,
    contextPages,
  } = input;

  // ── system 프롬프트 합성 ──
  let system = `당신은 전문 콘텐츠 크리에이터입니다. ${
    TONE_MAP[tone] || '자연스러운'
  } 문체로 작성하세요.`;

  if (audience) {
    system += ` 대상 독자: ${audience}.`;
  }
  if (brandVoice && brandVoice.trim()) {
    system += `\n\n[브랜드 문체 지침]\n${brandVoice}`;
  }
  if (avoidWords && avoidWords.trim()) {
    system += `\n\n[금지 표현]: ${avoidWords} — 이 표현들은 절대 사용하지 마세요.`;
  }

  system += '\n\n마크다운 없이 깔끔한 텍스트로 작성하세요.';

  // ── 위키 컨텍스트 주입 (있을 때만) ──
  if (contextPages && contextPages.length > 0) {
    const ctx = contextPages.filter((p) => p && p.trim()).join('\n\n---\n\n');
    if (ctx) {
      system += `\n\n[관련 마케팅 지식 위키 — 이 정보를 적극 활용하세요]\n${ctx}`;
    }
  }

  // ── user 프롬프트 합성 ──
  let user = `${
    TYPE_INSTRUCTIONS[type] || '다음 주제로 콘텐츠를 작성하세요.'
  }\n\n주제: ${topic}`;

  if (keywords) {
    user += `\n핵심 키워드: ${keywords}`;
  }

  return { system, user };
}

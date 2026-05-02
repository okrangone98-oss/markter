// ── LLM 도메인 타입 정의 ──
// v0.1 단일 HTML에서 추출한 콘텐츠 타입/톤/프로필을 타입화합니다.

/**
 * 콘텐츠 종류 ID — buildPrompt의 typeInstructions 키와 1:1 매칭
 */
export type ContentType =
  | 'blog_intro'
  | 'blog_full'
  | 'instagram_feed'
  | 'instagram_story'
  | 'thread_series'
  | 'twitter_thread'
  | 'facebook_post'
  | 'product_detail'
  | 'ad_copy'
  | 'slogan'
  | 'cta_variants'
  | 'youtube_script'
  | 'shorts_script'
  | 'tts_narration'
  | 'video_subtitle'
  | 'proposal'
  | 'report_summary'
  | 'faq'
  | 'meeting_minutes'
  | 'email_cold'
  | 'email_newsletter'
  | 'press_release';

/**
 * 톤 스타일 — buildPrompt의 toneMap 키와 1:1 매칭
 */
export type ToneStyle =
  | 'professional'
  | 'casual'
  | 'emotional'
  | 'witty'
  | 'urgent'
  | 'storytelling';

/**
 * 브랜드 프로필 — 문체와 금지 표현 한 묶음
 */
export interface BrandProfile {
  voice: string;
  avoid: string;
}

/**
 * buildPrompt 입력값
 * - contextPages: 위키 등 외부 컨텍스트 본문(이미 잘라낸 문자열)을 주입할 때 사용
 */
export interface BuildPromptInput {
  type: ContentType;
  topic: string;
  tone: ToneStyle;
  audience?: string;
  keywords?: string;
  brandVoice?: string;
  avoidWords?: string;
  contextPages?: string[];
}

/**
 * OpenRouter chat/completions 메시지 형식
 */
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * LLM 호출 옵션 — OpenRouter 요청 바디로 변환됨
 */
export interface LLMRequestOptions {
  messages: LLMMessage[];
  model?: string;
  temperature?: number;
  stream?: boolean;
  maxTokens?: number;
}

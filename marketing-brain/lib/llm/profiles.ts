// ── 초기 시드 프로필 ──
// v0.1 단일 HTML line 1666 의 profiles 객체를 그대로 옮겨 시드 데이터로 사용합니다.
// (Supabase 마이그레이션 시 brand_profiles 테이블에 삽입할 기준값)

import type { BrandProfile } from './types';

export const INITIAL_PROFILES: Record<string, BrandProfile> = {
  // 파책남 — 감성/성찰/자연 중심 에세이 톤
  pakchaenam: {
    voice: `파책남(@slowbukbunri) 글쓰기 스타일:
- 장면에서 출발 → 공감으로 착지
- 구어적 자기 노출: "오호", "잠깐", "ㅎㅎ" 자연스럽게 사용
- 감성·성찰·자연 중심 에세이 톤
- AI 냄새 희석, 1인칭 경험 스토리텔링
- 양양, 귀촌, 서핑, 로컬 커뮤니티 맥락`,
    avoid: '혁신적인, 놀라운, 최고의, ~드립니다, 안녕하세요',
  },

  // 양양군 농촌활성화지원센터 — 공식 문체
  center: {
    voice: `양양군 농촌활성화지원센터 공식 문체:
- 공문서체: ~임, ~함, ~할 계획임
- 신뢰감 있고 전문적인 톤
- 지역 주민 역량강화, 공동체 활성화 중심`,
    avoid: '구어체, 이모티콘, 캐주얼한 표현',
  },

  // 비즈니스 제안 — 논리/설득 톤
  business: {
    voice: `비즈니스 제안 문체:
- 논리적·설득력 있는 구조
- 데이터와 근거 중심
- 액션 유도 CTA 포함`,
    avoid: '감성적 표현, 불필요한 수식어',
  },
};

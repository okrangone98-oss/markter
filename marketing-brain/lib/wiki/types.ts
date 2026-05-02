// 위키 도메인 타입 — 프론트엔드/API 공용
// DB 스키마(WikiPageRow)는 source 컬럼이 없어 0002 마이그레이션에서 추가합니다.

export const WIKI_CATEGORIES = [
  "브랜드",
  "경쟁사",
  "페르소나",
  "캠페인",
  "트렌드",
  "가이드",
  "기타",
] as const;

export type WikiCategory = (typeof WIKI_CATEGORIES)[number];

export const WIKI_CATEGORY_ICONS: Record<WikiCategory, string> = {
  브랜드: "🏷",
  경쟁사: "⚔",
  페르소나: "👤",
  캠페인: "🚀",
  트렌드: "📈",
  가이드: "📐",
  기타: "📁",
};

export interface WikiPage {
  id: string;
  title: string;
  content: string;
  category: WikiCategory;
  tags: string[];
  source: string | null;
  created_at: string;
  updated_at: string;
}

export interface WikiPageCreateInput {
  title: string;
  content: string;
  category?: WikiCategory;
  tags?: string[];
  source?: string | null;
}

export interface WikiPageUpdateInput {
  title?: string;
  content?: string;
  category?: WikiCategory;
  tags?: string[];
  source?: string | null;
}

export function isValidCategory(c: string): c is WikiCategory {
  return (WIKI_CATEGORIES as readonly string[]).includes(c);
}

export function normalizeCategory(c: string | null | undefined): WikiCategory {
  if (c && isValidCategory(c)) return c;
  return "기타";
}

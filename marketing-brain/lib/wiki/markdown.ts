// 위키 마크다운 렌더링 — [[wikilink]] 처리 + marked
import { marked } from "marked";

import type { WikiPage } from "./types";

// [[제목]] → <a class="wiki-link" data-id="..."> 형태로 변환
// 페이지 목록을 받아 존재 여부에 따라 dead 클래스 부여
export function renderWikiMarkdown(body: string, pages: WikiPage[]): string {
  const titleToId: Record<string, string> = {};
  for (const p of pages) {
    titleToId[(p.title || "").toLowerCase().trim()] = p.id;
  }

  const withLinks = (body || "").replace(/\[\[([^\]]+)\]\]/g, (_m, t: string) => {
    const id = titleToId[t.toLowerCase().trim()] || "";
    const cls = id ? "wiki-link" : "wiki-link wiki-link-dead";
    const safe = t.replace(/"/g, "&quot;");
    return `<a class="${cls}" data-page-id="${id}" data-title="${safe}">${safe}</a>`;
  });

  return marked.parse(withLinks, { async: false }) as string;
}

// 백링크: 본문에 [[이 페이지 제목]] 이 들어있는 다른 페이지들
export function findBacklinks(currentTitle: string, pages: WikiPage[]): WikiPage[] {
  const target = (currentTitle || "").toLowerCase().trim();
  if (!target) return [];
  const re = new RegExp(
    `\\[\\[\\s*${target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\]\\]`,
    "i"
  );
  return pages.filter(
    (p) => (p.title || "").toLowerCase().trim() !== target && re.test(p.content || "")
  );
}

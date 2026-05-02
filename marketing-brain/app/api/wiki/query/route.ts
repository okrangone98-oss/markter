// /api/wiki/query — 자연어 질문 → 위키 텍스트 검색 → LLM 답변
// v0.1 의 runWikiQuery + searchWiki(token overlap) 동작 포팅.
// 임베딩 검색은 추후 도입; 현재는 ILIKE + 토큰 점수.

import type { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { callOpenRouter } from "@/lib/llm/openrouter";

export const runtime = "nodejs";

interface PageRow {
  id: string;
  title: string;
  category: string | null;
  content: string;
  tags: string[] | null;
}

// v0.1 의 searchWiki: 토큰별 title/body hits 가중 점수
function rankPages(query: string, pages: PageRow[], k = 6): PageRow[] {
  const tokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  if (!tokens.length) return [];
  const scored = pages.map((p) => {
    const text = `${p.title} ${(p.tags ?? []).join(" ")} ${p.content || ""}`.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      const titleHits = ((p.title || "").toLowerCase().match(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
      const bodyHits = (text.match(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
      score += titleHits * 5 + bodyHits;
    }
    return { p, score };
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((x) => x.p);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return Response.json({ error: "OPENROUTER_API_KEY 미설정" }, { status: 500 });

  let body: { question?: string };
  try { body = await request.json(); }
  catch { return Response.json({ error: "잘못된 JSON" }, { status: 400 }); }

  const question = (body.question || "").trim();
  if (!question) return Response.json({ error: "질문이 필요합니다" }, { status: 400 });

  // 사용자의 모든 페이지 가져와서 클라이언트 사이드 점수 매김 (RLS 통과)
  const { data: rows } = await supabase
    .from("wiki_pages")
    .select("id,title,category,content,tags")
    .limit(500);
  const pages: PageRow[] = (rows ?? []) as PageRow[];

  const top = rankPages(question, pages, 6);

  if (top.length === 0) {
    return Response.json({
      answer: "위키에 관련된 정보가 없습니다. 새 페이지를 작성하거나 더 많은 자료를 인제스트해보세요.",
      cited: [],
    });
  }

  const ctx = top
    .map((p) => `### ${p.title} (${p.category || "기타"})\n${(p.content || "").slice(0, 1200)}`)
    .join("\n\n---\n\n");

  const system = `당신은 마케팅 지식 위키의 어시스턴트입니다. 아래 위키 페이지를 근거로 사용자 질문에 답하세요. 추측하지 말고, 위키에 없는 내용은 "위키에 정보 없음"이라고 명시하세요. 답변은 한국어 마크다운으로, 핵심부터 간결하게.`;
  const userMsg = `[질문]\n${question}\n\n[관련 위키 페이지]\n${ctx}`;

  try {
    const answer = await callOpenRouter(
      {
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
        temperature: 0.5,
        maxTokens: 1800,
      },
      apiKey
    );

    return Response.json({
      answer,
      cited: top.map((p) => ({
        id: p.id,
        title: p.title,
        snippet: (p.content || "").slice(0, 160).replace(/\n/g, " "),
      })),
    });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

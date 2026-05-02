// /api/wiki/ingest — 텍스트 → LLM 분석 → 위키 페이지 제안 (생성/갱신)
// v0.1 의 runWikiIngest 동작을 서버 측으로 옮겼습니다 (API 키는 서버 env).
// 사용자가 미리보기 후 선택해서 적용합니다 (이 라우트는 제안만 반환).

import type { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { callOpenRouter } from "@/lib/llm/openrouter";
import { normalizeCategory } from "@/lib/wiki/types";

export const runtime = "nodejs";

interface ProposalCreate {
  op: "create";
  title: string;
  category: string;
  tags?: string[];
  body: string;
}

interface ProposalUpdate {
  op: "update";
  id: string;
  appendBody: string;
}

type Proposal = ProposalCreate | ProposalUpdate;

// LLM 응답에서 첫 JSON 블록을 추출
function extractJSON(text: string): unknown | null {
  // 우선 fenced ```json``` 블록
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  // 첫 { ~ 마지막 } 사이를 추출
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return Response.json({ error: "OPENROUTER_API_KEY 미설정" }, { status: 500 });

  let body: { text?: string };
  try { body = await request.json(); }
  catch { return Response.json({ error: "잘못된 JSON" }, { status: 400 }); }

  const inputText = (body.text || "").trim();
  if (!inputText) return Response.json({ error: "텍스트가 필요합니다" }, { status: 400 });
  if (inputText.length > 12000) {
    return Response.json({ error: "12,000자 이하로 줄여주세요" }, { status: 400 });
  }

  // 기존 페이지 인덱스 (LLM이 갱신 vs 신규 판단할 때 사용)
  const { data: pages } = await supabase
    .from("wiki_pages")
    .select("id,title,category,content")
    .order("updated_at", { ascending: false })
    .limit(80);

  const existingIndex = (pages ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => `- [${p.id}] (${p.category}) ${p.title} — ${(p.content || "").slice(0, 120).replace(/\n/g, " ")}...`
  ).join("\n") || "(아직 페이지 없음)";

  const system = `당신은 마케팅 지식 위키의 큐레이터입니다. 입력된 텍스트를 분석해 다음을 수행하세요:
1. 핵심 정보(엔티티, 인사이트, 트렌드, 데이터)를 추출
2. 기존 페이지가 있으면 갱신(update) 제안, 없으면 신규(create) 제안
3. 카테고리: 브랜드/경쟁사/페르소나/캠페인/트렌드/가이드/기타 중 정확히 하나
4. 마크다운 본문 작성 (## 핵심 요약, ## 상세, ## 관련 [[다른페이지제목]])

반드시 아래 JSON 형식으로만 응답 (코드블록 가능):
{
  "operations": [
    {"op":"create","title":"...","category":"경쟁사","tags":["..."],"body":"# ...\\n## 핵심 요약\\n..."},
    {"op":"update","id":"<위 인덱스의 id>","appendBody":"\\n## 추가 정보 (날짜)\\n..."}
  ],
  "summary": "이번 인제스트의 한 줄 요약"
}`;

  const userMsg = `[기존 페이지 인덱스]\n${existingIndex}\n\n[새 입력]\n${inputText}`;

  try {
    const raw = await callOpenRouter(
      {
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
        temperature: 0.4,
        maxTokens: 3500,
      },
      apiKey
    );

    const parsed = extractJSON(raw) as { operations?: Proposal[]; summary?: string } | null;
    if (!parsed || !Array.isArray(parsed.operations)) {
      return Response.json({ error: "LLM 응답 파싱 실패", raw: raw.slice(0, 400) }, { status: 502 });
    }

    // 카테고리 정규화 + 유효한 op만 통과
    const ops: Proposal[] = parsed.operations
      .filter((o): o is Proposal => o && (o.op === "create" || o.op === "update"))
      .map((o) => {
        if (o.op === "create") {
          return { ...o, category: normalizeCategory(o.category), tags: o.tags ?? [] };
        }
        return o;
      });

    return Response.json({ operations: ops, summary: parsed.summary ?? "" });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

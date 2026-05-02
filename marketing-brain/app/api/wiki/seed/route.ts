// /api/wiki/seed — 사용자별 1회 위키 시드 (Phase 1 세컨드브레인)
// Idempotent: 사용자에게 이미 페이지가 1개라도 있으면 스킵.
// 클라이언트는 wiki 페이지가 0개일 때만 호출 (sessionStorage 가드).

import { createClient } from "@/lib/supabase/server";
import { SEED_WIKI_PAGES } from "@/lib/wiki/seed-pages";
import { normalizeCategory } from "@/lib/wiki/types";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });

  // Idempotent 체크: 이미 페이지가 있으면 절대 시드하지 않음
  const { count, error: countError } = await supabase
    .from("wiki_pages")
    .select("id", { count: "exact", head: true });

  if (countError) {
    return Response.json({ error: countError.message }, { status: 500 });
  }
  if ((count ?? 0) > 0) {
    return Response.json({ created: 0, skipped: true, reason: "기존 페이지가 있어 시드 생략" });
  }

  // batch insert
  const rows = SEED_WIKI_PAGES.map((p) => ({
    user_id: user.id,
    title: p.title,
    content: p.content,
    category: normalizeCategory(p.category),
    tags: p.tags ?? [],
    source: p.source ?? null,
  }));

  // Supabase v2 generic resolution 우회 캐스트 (런타임 정상)
  const { error } = await supabase
    .from("wiki_pages")
    .insert(rows as never);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ created: rows.length, skipped: false });
}

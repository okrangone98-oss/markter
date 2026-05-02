// 위키 페이지 컬렉션 — GET (목록) / POST (생성)
import type { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { normalizeCategory, type WikiPage, type WikiPageCreateInput } from "@/lib/wiki/types";

export const runtime = "nodejs";

interface DbWikiRow {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[] | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}

function rowToPage(row: DbWikiRow): WikiPage {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: normalizeCategory(row.category),
    tags: row.tags ?? [],
    source: row.source,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });

  const url = request.nextUrl;
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("search");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "200", 10), 500);

  let q = supabase
    .from("wiki_pages")
    .select("id,title,content,category,tags,source,created_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (category) q = q.eq("category", category);
  if (search) q = q.or(`title.ilike.%${search}%,content.ilike.%${search}%`);

  const { data, error } = await q;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ pages: (data ?? []).map((r) => rowToPage(r as DbWikiRow)) });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });

  let body: WikiPageCreateInput;
  try { body = await request.json(); }
  catch { return Response.json({ error: "잘못된 JSON" }, { status: 400 }); }

  const title = (body.title ?? "").trim();
  if (!title) return Response.json({ error: "제목이 필요합니다" }, { status: 400 });

  const insert = {
    user_id: user.id,
    title,
    content: body.content ?? "",
    category: normalizeCategory(body.category),
    tags: body.tags ?? [],
    source: body.source ?? null,
  };

  // Supabase v2 generic resolution 우회용 캐스트 (런타임은 정상)
  const { data, error } = await supabase
    .from("wiki_pages")
    .insert(insert as never)
    .select("id,title,content,category,tags,source,created_at,updated_at")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ page: rowToPage(data as DbWikiRow) }, { status: 201 });
}

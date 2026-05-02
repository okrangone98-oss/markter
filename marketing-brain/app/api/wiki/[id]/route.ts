// 위키 페이지 단건 — GET / PATCH / DELETE
import type { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { normalizeCategory, type WikiPage, type WikiPageUpdateInput } from "@/lib/wiki/types";

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });

  const { data, error } = await supabase
    .from("wiki_pages")
    .select("id,title,content,category,tags,source,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!data) return Response.json({ error: "페이지를 찾을 수 없습니다" }, { status: 404 });
  return Response.json({ page: rowToPage(data as DbWikiRow) });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });

  let body: WikiPageUpdateInput;
  try { body = await request.json(); }
  catch { return Response.json({ error: "잘못된 JSON" }, { status: 400 }); }

  const patch: Record<string, unknown> = {};
  if (body.title !== undefined) patch.title = body.title.trim() || "제목 없음";
  if (body.content !== undefined) patch.content = body.content;
  if (body.category !== undefined) patch.category = normalizeCategory(body.category);
  if (body.tags !== undefined) patch.tags = body.tags;
  if (body.source !== undefined) patch.source = body.source;

  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "변경할 필드가 없습니다" }, { status: 400 });
  }

  // Supabase v2 generic resolution 우회용 캐스트 (런타임은 정상)
  const { data, error } = await supabase
    .from("wiki_pages")
    .update(patch as never)
    .eq("id", id)
    .select("id,title,content,category,tags,source,created_at,updated_at")
    .maybeSingle();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!data) return Response.json({ error: "페이지를 찾을 수 없습니다" }, { status: 404 });
  return Response.json({ page: rowToPage(data as DbWikiRow) });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });

  const { error } = await supabase.from("wiki_pages").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

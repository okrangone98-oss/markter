// 마케팅 지식 위키 — Karpathy LLM Wiki 패턴 (멀티 디바이스, Supabase 영속)
// 좌측 사이드바 + 우측 메인 (대시보드 또는 에디터)
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, Trash2, Save, ArrowLeft, Tag, Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import { useWikiStore } from "@/lib/stores/wiki";
import {
  WIKI_CATEGORIES,
  WIKI_CATEGORY_ICONS,
  type WikiCategory,
  type WikiPage,
} from "@/lib/wiki/types";
import { renderWikiMarkdown, findBacklinks } from "@/lib/wiki/markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip } from "@/components/ui/tooltip";
import { UploadDialog } from "@/components/wiki/upload-dialog";
import { IngestDialog } from "@/components/wiki/ingest-dialog";
import { QueryDialog } from "@/components/wiki/query-dialog";

/* ══════════════════════════════════════════════════════════
   메인 페이지
   ══════════════════════════════════════════════════════════ */
export default function WikiPage() {
  const { pages, currentPageId, fetchPages, loading, error } = useWikiStore();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [ingestOpen, setIngestOpen] = useState(false);
  const [queryOpen, setQueryOpen] = useState(false);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const currentPage = pages.find((p) => p.id === currentPageId) || null;

  return (
    <div className="flex h-[calc(100vh-5.5rem)] gap-4">
      <WikiSidebar
        onUploadClick={() => setUploadOpen(true)}
        onIngestClick={() => setIngestOpen(true)}
        onQueryClick={() => setQueryOpen(true)}
      />
      <main className="flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/40 p-6">
        {loading && pages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
            위키 불러오는 중...
          </div>
        ) : error ? (
          <div className="text-sm text-red-400">⚠ {error}</div>
        ) : currentPage ? (
          <WikiEditor page={currentPage} allPages={pages} />
        ) : (
          <WikiDashboard
            pages={pages}
            onUploadClick={() => setUploadOpen(true)}
            onIngestClick={() => setIngestOpen(true)}
            onQueryClick={() => setQueryOpen(true)}
          />
        )}
      </main>

      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <IngestDialog open={ingestOpen} onClose={() => setIngestOpen(false)} />
      <QueryDialog open={queryOpen} onClose={() => setQueryOpen(false)} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   사이드바
   ══════════════════════════════════════════════════════════ */
function WikiSidebar({
  onUploadClick,
  onIngestClick,
  onQueryClick,
}: {
  onUploadClick: () => void;
  onIngestClick: () => void;
  onQueryClick: () => void;
}) {
  const { pages, currentPageId, search, setSearch, selectPage, createPage } = useWikiStore();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = pages.slice().sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [pages, search]);

  const byCategory = useMemo(() => {
    const m: Record<string, WikiPage[]> = {};
    filtered.forEach((p) => {
      (m[p.category] = m[p.category] || []).push(p);
    });
    return m;
  }, [filtered]);

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4 overflow-y-auto">
      <Button onClick={() => createPage()} size="sm" className="w-full">
        <Plus className="h-4 w-4" /> 새 페이지
      </Button>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="페이지 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-xs"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
          페이지 ({filtered.length})
        </div>
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-4">
            {search ? "검색 결과 없음" : "페이지 없음"}
          </p>
        ) : (
          WIKI_CATEGORIES.filter((c) => byCategory[c]?.length).map((cat) => (
            <div key={cat} className="mb-3">
              <div className="text-[10px] font-semibold text-[var(--color-primary)] mb-1 px-1">
                {WIKI_CATEGORY_ICONS[cat]} {cat} · {byCategory[cat].length}
              </div>
              <ul className="flex flex-col gap-0.5">
                {byCategory[cat].map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => selectPage(p.id)}
                      className={cn(
                        "w-full rounded px-2 py-1.5 text-left text-xs transition-colors truncate",
                        currentPageId === p.id
                          ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                          : "text-slate-300 hover:bg-slate-800/60"
                      )}
                    >
                      {p.title || "제목 없음"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-800 pt-3 space-y-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
          ⚡ AI 작업
        </div>
        <Tooltip content="텍스트를 붙여넣으면 LLM이 분석해 신규/갱신 위키 페이지를 자동 제안합니다.">
          <button
            onClick={onIngestClick}
            className="w-full flex items-center gap-1.5 rounded px-2 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-800/60 hover:text-[var(--color-primary)] transition-colors"
          >
            📥 AI 인제스트
          </button>
        </Tooltip>
        <Tooltip content="자연어로 질문하면 위키를 검색해 답변. 답변을 새 페이지로 저장 가능.">
          <button
            onClick={onQueryClick}
            className="w-full flex items-center gap-1.5 rounded px-2 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-800/60 hover:text-[var(--color-primary)] transition-colors"
          >
            ❓ AI 쿼리
          </button>
        </Tooltip>
      </div>

      <div className="border-t border-slate-800 pt-3 space-y-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
          📂 파일 업로드
        </div>
        <button
          onClick={onUploadClick}
          className="w-full flex items-center gap-1.5 rounded px-2 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-800/60 hover:text-[var(--color-primary)] transition-colors"
        >
          <Upload className="h-3 w-3" /> Excel · PDF · CSV · Sheets
        </button>
      </div>
    </aside>
  );
}

/* ══════════════════════════════════════════════════════════
   대시보드 (v0.1 패턴 포팅 — Obsidian/Outline 스타일)
   ══════════════════════════════════════════════════════════ */
function WikiDashboard({
  pages,
  onUploadClick,
  onIngestClick,
  onQueryClick,
}: {
  pages: WikiPage[];
  onUploadClick: () => void;
  onIngestClick: () => void;
  onQueryClick: () => void;
}) {
  const { createPage, selectPage, filterByCategory, filterByTag } = useWikiStore();

  const total = pages.length;
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;

  const recentlyEdited = pages.filter(
    (p) => now - new Date(p.updated_at).getTime() < week
  ).length;

  const catCounts = Object.fromEntries(WIKI_CATEGORIES.map((c) => [c, 0])) as Record<WikiCategory, number>;
  pages.forEach((p) => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
  const distinctCats = WIKI_CATEGORIES.filter((c) => catCounts[c] > 0).length;

  const sources = new Set(pages.map((p) => p.source).filter(Boolean));

  const recent = pages
    .slice()
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);

  const tagFreq: Record<string, number> = {};
  pages.forEach((p) => p.tags.forEach((t) => { if (t) tagFreq[t] = (tagFreq[t] || 0) + 1; }));
  const topTags = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]).slice(0, 15);
  const maxTagFreq = topTags[0]?.[1] || 1;

  const sourceFreq: Record<string, number> = {};
  pages.forEach((p) => { if (p.source) sourceFreq[p.source] = (sourceFreq[p.source] || 0) + 1; });
  const topSources = Object.entries(sourceFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const sourcedPages = pages.filter((p) => p.source).length;

  const days = useMemo(() => {
    const arr: Array<{ start: number; end: number; count: number; label: string }> = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      arr.push({
        start: d.getTime(),
        end: d.getTime() + 86_400_000,
        count: 0,
        label: d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" }),
      });
    }
    pages.forEach((p) => {
      const u = new Date(p.updated_at).getTime();
      const day = arr.find((d) => u >= d.start && u < d.end);
      if (day) day.count++;
    });
    return arr;
  }, [pages]);
  const maxDayCount = Math.max(1, ...days.map((d) => d.count));

  const gapSeverity = (count: number) => {
    if (count === 0) return "critical";
    if (count < Math.max(2, total * 0.05)) return "low";
    return "healthy";
  };
  const gaps = WIKI_CATEGORIES
    .map((c) => ({ cat: c, count: catCounts[c], severity: gapSeverity(catCounts[c]) }))
    .filter((g) => g.severity !== "healthy");

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-300 leading-relaxed">
        {total === 0 ? (
          <>👋 환영합니다! 위키에 첫 페이지를 추가해 시작하세요.</>
        ) : (
          <>
            📚 현재 <b className="text-[var(--color-primary)]">{total}개 페이지</b> 보유 ·
            이번 주 <b className="text-[var(--color-primary)]">{recentlyEdited}개</b> 업데이트 ·
            출처 파일 <b className="text-[var(--color-primary)]">{sources.size}개</b>
          </>
        )}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard label="전체 페이지" value={total} />
        <StatCard label="이번 주 활동" value={recentlyEdited} />
        <StatCard label="활성 카테고리" value={distinctCats} suffix={`/${WIKI_CATEGORIES.length}`} />
        <StatCard label="출처 파일" value={sources.size} />
      </div>

      <SectionTitle>🗂 카테고리 분포</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {WIKI_CATEGORIES.map((cat) => {
          const count = catCounts[cat];
          const sev = gapSeverity(count);
          const pct = total > 0 ? Math.min(100, (count / Math.max(1, total)) * 100 * 1.6) : 0;
          return (
            <button
              key={cat}
              onClick={() => filterByCategory(cat)}
              className="text-left rounded-lg border border-slate-800 bg-slate-900/40 p-3 hover:border-[var(--color-primary)]/40 hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-xs font-semibold text-slate-200">
                  {WIKI_CATEGORY_ICONS[cat]} {cat}
                </span>
                {sev !== "healthy" && <GapBadge severity={sev as "critical" | "low"} />}
              </div>
              <div className="text-xl font-bold text-[var(--color-primary)] mt-1.5 leading-none">
                {count}
              </div>
              <div className="h-[3px] bg-slate-800 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, var(--color-primary), var(--color-purple))",
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <DashCard title="⏱ 최근 업데이트">
          {recent.length === 0 ? (
            <Empty>아직 페이지가 없습니다</Empty>
          ) : (
            recent.map((p) => (
              <button
                key={p.id}
                onClick={() => selectPage(p.id)}
                className="w-full text-left flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-slate-800/40"
              >
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-200 truncate">
                    {p.title || "제목 없음"}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {WIKI_CATEGORY_ICONS[p.category]} {p.category}
                    {p.source ? " · 출처 있음" : ""}
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                  {relativeTime(new Date(p.updated_at).getTime())}
                </span>
              </button>
            ))
          )}
        </DashCard>

        <DashCard title="⚠ 지식 공백">
          {gaps.length === 0 ? (
            <div className="py-4 text-center text-xs text-[var(--color-primary)]">
              ✓ 모든 카테고리 활성!
            </div>
          ) : (
            gaps.map((g) => (
              <button
                key={g.cat}
                onClick={() =>
                  g.count === 0 ? createPage({ category: g.cat }) : filterByCategory(g.cat)
                }
                className="w-full text-left flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-slate-800/40"
                title={g.count === 0 ? `${g.cat} 첫 페이지 만들기` : `${g.cat} 카테고리 보기`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-200">
                    {WIKI_CATEGORY_ICONS[g.cat]} {g.cat}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {g.count === 0 ? "비어있음 — 클릭하여 새 페이지 만들기 +" : `단 ${g.count}개 — 추가 권장`}
                  </div>
                </div>
                <GapBadge severity={g.severity as "critical" | "low"} />
              </button>
            ))
          )}
        </DashCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <DashCard title="🏷 인기 태그">
          {topTags.length === 0 ? (
            <Empty>태그 없음 — 페이지에 태그를 추가해보세요</Empty>
          ) : (
            <div className="leading-loose">
              {topTags.map(([t, n]) => {
                const size = 0.7 + (n / maxTagFreq) * 0.35;
                return (
                  <button
                    key={t}
                    onClick={() => filterByTag(t)}
                    className="inline-block mr-1.5 mb-1 px-2 py-0.5 rounded-full bg-[var(--color-purple)]/10 text-[var(--color-purple)] border border-[var(--color-purple)]/25 hover:-translate-y-px transition-transform"
                    style={{ fontSize: `${size.toFixed(2)}rem` }}
                  >
                    {t} <span className="opacity-60 text-[10px]">{n}</span>
                  </button>
                );
              })}
            </div>
          )}
        </DashCard>

        <DashCard title="📂 출처 인사이트">
          <div className="flex gap-3 text-xs mb-2">
            <span>
              <b className="text-[var(--color-primary)] text-base">{sourcedPages}</b>{" "}
              <span className="text-slate-500">업로드</span>
            </span>
            <span>
              <b className="text-[var(--color-purple)] text-base">{total - sourcedPages}</b>{" "}
              <span className="text-slate-500">수동</span>
            </span>
          </div>
          {topSources.length === 0 ? (
            <Empty>아직 업로드한 파일이 없습니다</Empty>
          ) : (
            topSources.map(([s, n]) => (
              <div
                key={s}
                className="flex justify-between text-[11px] text-slate-500 py-1 border-b border-dashed border-slate-800 last:border-0"
              >
                <span className="truncate flex-1 mr-2" title={s}>
                  {(s.split("/").pop() || s).slice(0, 40)}
                </span>
                <span className="text-[var(--color-primary)]">{n}p</span>
              </div>
            ))
          )}
        </DashCard>
      </div>

      <SectionTitle>📅 최근 14일 활동</SectionTitle>
      <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(14, 1fr)" }}>
        {days.map((d, i) => {
          const intensity = d.count === 0 ? 0.06 : 0.2 + (d.count / maxDayCount) * 0.8;
          return (
            <div
              key={i}
              title={`${d.label} · ${d.count}건`}
              className="aspect-square rounded-sm hover:scale-110 transition-transform"
              style={{ background: `rgba(0, 229, 200, ${intensity.toFixed(2)})` }}
            />
          );
        })}
      </div>

      <SectionTitle>⚡ 빠른 시작</SectionTitle>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => createPage()} size="sm">
          <Plus className="h-3.5 w-3.5" /> 새 페이지
        </Button>
        <Button variant="secondary" size="sm" onClick={onUploadClick}>
          📂 Excel · PDF · CSV 업로드
        </Button>
        <Button variant="secondary" size="sm" onClick={onIngestClick}>
          🤖 AI 인제스트
        </Button>
        <Button variant="secondary" size="sm" onClick={onQueryClick}>
          ❓ AI 쿼리
        </Button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   에디터 — 텍스트 + 라이브 프리뷰 + debounced 자동 저장
   ══════════════════════════════════════════════════════════ */
function WikiEditor({ page, allPages }: { page: WikiPage; allPages: WikiPage[] }) {
  const { updatePage, deletePage, backToDashboard, selectPage } = useWikiStore();

  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const [category, setCategory] = useState<WikiCategory>(page.category);
  const [tagsRaw, setTagsRaw] = useState(page.tags.join(", "));
  const [status, setStatus] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTitle(page.title);
    setContent(page.content);
    setCategory(page.category);
    setTagsRaw(page.tags.join(", "));
    setStatus("");
  }, [page.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(doSave, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, category, tagsRaw]);

  async function doSave() {
    setStatus("저장 중...");
    const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
    const result = await updatePage(page.id, {
      title: title.trim() || "제목 없음",
      content,
      category,
      tags,
    });
    setStatus(result ? `✓ 저장됨 ${new Date().toLocaleTimeString("ko-KR")}` : "⚠ 저장 실패");
  }

  async function doDelete() {
    if (!confirm(`"${page.title}" 삭제하시겠습니까?`)) return;
    if (await deletePage(page.id)) backToDashboard();
  }

  const previewHtml = useMemo(
    () => renderWikiMarkdown(content, allPages),
    [content, allPages]
  );

  const backlinks = useMemo(
    () => findBacklinks(page.title, allPages),
    [page.title, allPages]
  );

  function onPreviewClick(e: React.MouseEvent<HTMLDivElement>) {
    const t = e.target as HTMLElement;
    if (t.classList.contains("wiki-link")) {
      e.preventDefault();
      const id = t.dataset.pageId;
      if (id) selectPage(id);
      else {
        const tt = t.dataset.title || "";
        if (confirm(`"${tt}" 페이지가 없습니다. 새로 만드시겠습니까?`)) {
          useWikiStore.getState().createPage({ title: tt });
        }
      }
    }
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <button
          onClick={backToDashboard}
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-[var(--color-primary)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> 대시보드로
        </button>
        <span className="text-[11px] text-slate-500">{status}</span>
      </div>

      <div className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="페이지 제목"
          className="flex-1 font-semibold"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as WikiCategory)}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 max-w-[140px]"
        >
          {WIKI_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {WIKI_CATEGORY_ICONS[c]} {c}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <Tag className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        <Input
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          placeholder="태그 (쉼표 구분)"
          className="pl-8 h-8 text-xs"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-[400px]">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="# 제목&#10;&#10;## 핵심 요약&#10;- &#10;&#10;## 관련&#10;[[다른 페이지 제목]]"
          className="resize-none font-mono text-xs leading-relaxed h-full min-h-[400px]"
        />
        <div
          onClick={onPreviewClick}
          className="rounded-md border border-slate-800 bg-slate-900/40 p-4 overflow-y-auto text-sm leading-relaxed prose-wiki min-h-[400px]"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={doSave}>
          <Save className="h-3.5 w-3.5" /> 저장
        </Button>
        <Button size="sm" variant="ghost" onClick={doDelete}>
          <Trash2 className="h-3.5 w-3.5 text-red-400" /> 삭제
        </Button>
      </div>

      {backlinks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            🔗 이 페이지를 참조하는 페이지 ({backlinks.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {backlinks.map((b) => (
              <button
                key={b.id}
                onClick={() => selectPage(b.id)}
                className="px-2 py-1 rounded-md text-[11px] bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-[var(--color-primary)]"
              >
                {b.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 작은 재사용 컴포넌트 ── */
function StatCard({ label, value, suffix }: { label: string; value: number | string; suffix?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="text-2xl font-bold text-[var(--color-primary)] leading-none">
        {value}
        {suffix && <span className="text-xs text-slate-500 font-medium">{suffix}</span>}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-2 font-semibold">
        {label}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-2">
      {children}
    </div>
  );
}

function DashCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="py-4 text-center text-xs text-slate-500">{children}</div>;
}

function GapBadge({ severity }: { severity: "critical" | "low" }) {
  const cls =
    severity === "critical"
      ? "bg-red-500/15 text-red-400 border-red-500/30"
      : "bg-amber-500/15 text-amber-400 border-amber-500/30";
  const text = severity === "critical" ? "보강 필요" : "부족";
  return (
    <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-semibold tracking-wide", cls)}>
      {text}
    </span>
  );
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}일 전`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}개월 전`;
  return `${Math.floor(mo / 12)}년 전`;
}

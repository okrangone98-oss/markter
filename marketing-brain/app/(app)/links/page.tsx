// 마케터 링크 모음 — 자주 쓰는 도구·플랫폼 빠른 접근
"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { MARKETER_LINKS, type MarketerLink, type LinkGroup } from "@/lib/links/data";
import { Input } from "@/components/ui/input";

// 카테고리 색상 → Tailwind 토큰
const COLOR_CLASS: Record<LinkGroup["color"], string> = {
  cyan: "border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-400/60",
  purple: "border-purple-500/30 bg-purple-500/5 hover:border-purple-400/60",
  amber: "border-amber-500/30 bg-amber-500/5 hover:border-amber-400/60",
  green: "border-green-500/30 bg-green-500/5 hover:border-green-400/60",
  blue: "border-blue-500/30 bg-blue-500/5 hover:border-blue-400/60",
  rose: "border-rose-500/30 bg-rose-500/5 hover:border-rose-400/60",
  slate: "border-slate-600/40 bg-slate-700/5 hover:border-slate-500/60",
};

const HEADER_COLOR_CLASS: Record<LinkGroup["color"], string> = {
  cyan: "text-cyan-400",
  purple: "text-purple-400",
  amber: "text-amber-400",
  green: "text-green-400",
  blue: "text-blue-400",
  rose: "text-rose-400",
  slate: "text-slate-300",
};

export default function LinksPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MARKETER_LINKS;
    return MARKETER_LINKS.map((g) => ({
      ...g,
      items: g.items.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.desc.toLowerCase().includes(q) ||
          (it.tag || "").toLowerCase().includes(q)
      ),
    })).filter((g) => g.items.length > 0);
  }, [search]);

  const totalLinks = MARKETER_LINKS.reduce((s, g) => s + g.items.length, 0);
  const filteredCount = filtered.reduce((s, g) => s + g.items.length, 0);

  return (
    <div className="mx-auto max-w-6xl py-4 space-y-6">
      {/* 헤더 */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 ring-1 ring-[var(--color-primary)]/30">
          <ExternalLink className="h-6 w-6 text-[var(--color-primary)]" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            Marketer Toolbox
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            🔗 마케터 링크 모음
          </h1>
          <p className="text-sm text-slate-400">
            AI 도구 · 디자인 · 영상 · 마케팅 플랫폼 · 분석 · 학습까지 한 곳에서
            ({filteredCount === totalLinks ? totalLinks : `${filteredCount}/${totalLinks}`}개 링크)
          </p>
        </div>
      </div>

      {/* 검색 */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="도구·플랫폼 검색 (예: 네이버, 영상, 무료)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 카테고리 그룹 */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-500">
          🔍 검색 결과가 없습니다. 다른 키워드로 시도해보세요.
        </div>
      ) : (
        <div className="space-y-7">
          {filtered.map((group) => (
            <section key={group.category}>
              <h2 className={cn(
                "text-sm font-bold mb-3",
                HEADER_COLOR_CLASS[group.color]
              )}>
                {group.category}
                <span className="ml-2 text-[11px] font-normal text-slate-500">
                  {group.items.length}개
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.items.map((item) => (
                  <LinkCard key={item.url} item={item} colorClass={COLOR_CLASS[group.color]} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="pt-6 border-t border-slate-800 text-xs text-slate-500">
        💡 도구가 빠졌나요? <code className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">marketing-brain/lib/links/data.ts</code> 에 추가하세요.
        모든 링크는 새 탭에서 열립니다.
      </div>
    </div>
  );
}

function LinkCard({ item, colorClass }: { item: MarketerLink; colorClass: string }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group block rounded-xl border p-4 transition-all hover:-translate-y-0.5",
        colorClass
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white">
          {item.name}
        </h3>
        <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300 shrink-0 mt-0.5" />
      </div>
      <p className="text-xs text-slate-400 leading-snug mb-2">
        {item.desc}
      </p>
      {item.tag && (
        <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 font-medium">
          {item.tag}
        </span>
      )}
    </a>
  );
}

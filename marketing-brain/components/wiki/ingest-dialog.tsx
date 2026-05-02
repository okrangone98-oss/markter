// AI 인제스트 다이얼로그 — 텍스트 붙여넣기 → LLM 분석 → 위키 페이지 제안 → 선택 적용
"use client";

import { useState } from "react";
import { Sparkles, X, Loader2, FileText, RefreshCw } from "lucide-react";

import { useWikiStore } from "@/lib/stores/wiki";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { normalizeCategory, type WikiCategory } from "@/lib/wiki/types";

interface IngestDialogProps {
  open: boolean;
  onClose: () => void;
}

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

export function IngestDialog({ open, onClose }: IngestDialogProps) {
  const { pages, fetchPages, createPage, updatePage } = useWikiStore();

  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [summary, setSummary] = useState("");
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  if (!open) return null;

  function reset() {
    setText("");
    setProposals([]);
    setSummary("");
    setChecked(new Set());
    setError(null);
  }

  function handleClose() { reset(); onClose(); }

  async function analyze() {
    if (!text.trim()) { setError("텍스트를 입력하세요"); return; }
    setError(null);
    setAnalyzing(true);
    try {
      const r = await fetch("/api/wiki/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || `HTTP ${r.status}`);
      setProposals(json.operations || []);
      setSummary(json.summary || "");
      setChecked(new Set((json.operations || []).map((_: unknown, i: number) => i)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAnalyzing(false);
    }
  }

  async function applySelected() {
    setApplying(true);
    let applied = 0;
    for (const idx of Array.from(checked)) {
      const p = proposals[idx];
      if (!p) continue;
      if (p.op === "create") {
        const r = await createPage({
          title: p.title,
          content: p.body,
          category: normalizeCategory(p.category) as WikiCategory,
          tags: p.tags ?? [],
        });
        if (r) applied++;
      } else if (p.op === "update") {
        const target = pages.find((x) => x.id === p.id);
        if (target) {
          const r = await updatePage(p.id, {
            content: target.content + "\n\n" + p.appendBody,
          });
          if (r) applied++;
        }
      }
    }
    setApplying(false);
    await fetchPages();
    if (applied > 0) {
      reset();
      onClose();
    } else {
      setError("적용된 항목이 없습니다");
    }
  }

  function toggle(i: number) {
    setChecked((c) => {
      const next = new Set(c);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={handleClose}>
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
            AI 인제스트 — 텍스트에서 위키 자동 생성
          </h2>
          <button onClick={handleClose} className="text-slate-500 hover:text-slate-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {proposals.length === 0 ? (
            <>
              <div>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={10}
                  placeholder="경쟁사 분석, 시장 리포트, 인터뷰 메모, 캠페인 결과, 트렌드 자료... 어떤 텍스트라도 붙여넣으세요. LLM이 분석해 위키 페이지를 자동으로 만들거나 기존 페이지를 갱신합니다."
                  className="text-xs leading-relaxed"
                />
                <p className="mt-2 text-[10px] text-slate-500">
                  💡 12,000자 이하 권장. 마크다운/일반 텍스트 모두 가능. URL 직접 fetch는 미지원 (텍스트로 붙여넣어주세요).
                </p>
              </div>
              <Button onClick={analyze} disabled={analyzing || !text.trim()} className="w-full">
                {analyzing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    분석 중... (5~15초)
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    분석 시작
                  </span>
                )}
              </Button>
            </>
          ) : (
            <>
              {summary && (
                <div className="rounded-md border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-3 text-xs text-slate-300">
                  <strong className="text-[var(--color-primary)]">요약:</strong> {summary}
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{proposals.length}개 작업 제안 · {checked.size}개 선택</span>
                <div className="flex gap-2">
                  <button onClick={() => setChecked(new Set(proposals.map((_, i) => i)))} className="hover:text-slate-200">전체 선택</button>
                  <span className="text-slate-700">|</span>
                  <button onClick={() => setChecked(new Set())} className="hover:text-slate-200">전체 해제</button>
                </div>
              </div>

              {proposals.map((p, i) => (
                <div key={i} className={cn(
                  "rounded-lg border p-3 transition-colors",
                  checked.has(i)
                    ? "border-[var(--color-primary)]/40 bg-slate-900/50"
                    : "border-slate-800 bg-slate-900/30 opacity-60"
                )}>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked.has(i)}
                      onChange={() => toggle(i)}
                      className="h-4 w-4 mt-0.5 accent-[var(--color-primary)]"
                    />
                    <div className="flex-1 min-w-0">
                      {p.op === "create" ? (
                        <>
                          <div className="text-xs">
                            <span className="rounded bg-[var(--color-primary)]/15 text-[var(--color-primary)] px-1.5 py-0.5 mr-2 font-semibold">신규</span>
                            <strong className="text-slate-100">{p.title}</strong>
                            <span className="text-slate-500 ml-2">({p.category})</span>
                          </div>
                          <pre className="mt-2 max-h-24 overflow-hidden rounded bg-slate-950 p-2 text-[10px] text-slate-500 whitespace-pre-wrap font-mono">
                            {p.body.slice(0, 280)}{p.body.length > 280 ? "..." : ""}
                          </pre>
                        </>
                      ) : (
                        <>
                          <div className="text-xs">
                            <span className="rounded bg-amber-500/15 text-amber-400 px-1.5 py-0.5 mr-2 font-semibold">갱신</span>
                            <strong className="text-slate-100">
                              {pages.find((x) => x.id === p.id)?.title ?? p.id}
                            </strong>
                          </div>
                          <pre className="mt-2 max-h-24 overflow-hidden rounded bg-slate-950 p-2 text-[10px] text-slate-500 whitespace-pre-wrap font-mono">
                            {p.appendBody.slice(0, 280)}{p.appendBody.length > 280 ? "..." : ""}
                          </pre>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              ))}
            </>
          )}

          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
              ⚠ {error}
            </div>
          )}
        </div>

        <div className="flex justify-between gap-2 px-5 py-3 border-t border-slate-800">
          {proposals.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={reset}>
              <RefreshCw className="h-3.5 w-3.5" /> 다시 분석
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleClose}>닫기</Button>
            {proposals.length > 0 && (
              <Button onClick={applySelected} disabled={applying || checked.size === 0} size="sm">
                {applying ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    적용 중...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    {checked.size}개 위키에 적용
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

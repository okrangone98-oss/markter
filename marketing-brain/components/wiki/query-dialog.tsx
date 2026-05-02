// AI 쿼리 다이얼로그 — 자연어 질문 → 위키 검색 + LLM 답변 → 새 페이지로 저장 가능
"use client";

import { useState } from "react";
import { HelpCircle, X, Loader2, Save, ArrowRight } from "lucide-react";

import { useWikiStore } from "@/lib/stores/wiki";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QueryDialogProps {
  open: boolean;
  onClose: () => void;
}

interface CitedPage {
  id: string;
  title: string;
  snippet: string;
}

export function QueryDialog({ open, onClose }: QueryDialogProps) {
  const { selectPage, createPage, fetchPages } = useWikiStore();
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState("");
  const [cited, setCited] = useState<CitedPage[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function reset() {
    setQuestion("");
    setAnswer("");
    setCited([]);
    setError(null);
  }

  function handleClose() { reset(); onClose(); }

  async function ask() {
    if (!question.trim()) { setError("질문을 입력하세요"); return; }
    setError(null);
    setAsking(true);
    setAnswer("");
    setCited([]);
    try {
      const r = await fetch("/api/wiki/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || `HTTP ${r.status}`);
      setAnswer(json.answer || "");
      setCited(json.cited || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAsking(false);
    }
  }

  async function saveAsPage() {
    const refs = cited.map((c) => `[[${c.title}]]`).join(" · ");
    const body = `# ${question}\n\n## 답변\n${answer}\n\n## 참조\n${refs || "_(없음)_"}\n\n*${new Date().toLocaleString("ko-KR")} 쿼리 결과*`;
    const r = await createPage({
      title: `Q: ${question.slice(0, 60)}`,
      content: body,
      category: "가이드",
      tags: ["쿼리"],
    });
    if (r) {
      reset();
      onClose();
      await fetchPages();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={handleClose}>
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-[var(--color-primary)]" />
            AI 쿼리 — 위키에 질문하기
          </h2>
          <button onClick={handleClose} className="text-slate-500 hover:text-slate-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !asking) ask(); }}
              placeholder="예: 카카오 비즈메시지 단가는? / 3040 여성 페르소나의 SNS 행동 패턴은?"
              autoFocus
            />
            <Button onClick={ask} disabled={asking || !question.trim()}>
              {asking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>

          {asking && (
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              위키에서 검색 + LLM 답변 생성 중... (5~10초)
            </div>
          )}

          {answer && (
            <>
              {cited.length > 0 && (
                <div className="rounded-md border border-slate-800 bg-slate-900/50 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                    참조 페이지 ({cited.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cited.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { selectPage(c.id); handleClose(); }}
                        className="px-2 py-1 rounded text-[11px] bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-[var(--color-primary)] transition"
                        title={c.snippet}
                      >
                        {c.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-md border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-4">
                <div className="text-[10px] uppercase tracking-wider text-[var(--color-primary)] mb-2 font-semibold">
                  답변
                </div>
                <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {answer}
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
              ⚠ {error}
            </div>
          )}
        </div>

        <div className="flex justify-between gap-2 px-5 py-3 border-t border-slate-800">
          <span />
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleClose}>닫기</Button>
            {answer && (
              <Button onClick={saveAsPage} size="sm">
                <Save className="h-3.5 w-3.5" /> 답변을 새 페이지로 저장
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

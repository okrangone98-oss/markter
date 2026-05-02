// 위키 파일 업로드 다이얼로그 — Excel/PDF/CSV/Google Sheets
"use client";

import { useState } from "react";
import { Upload, X, FileSpreadsheet, FileText, Sheet, Loader2 } from "lucide-react";

import { useWikiStore } from "@/lib/stores/wiki";
import {
  parseFile,
  fetchGoogleSheetsAsPage,
  type ParsedPage,
} from "@/lib/wiki/file-parsers";
import {
  WIKI_CATEGORIES,
  WIKI_CATEGORY_ICONS,
  type WikiCategory,
} from "@/lib/wiki/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
}

export function UploadDialog({ open, onClose }: UploadDialogProps) {
  const { bulkCreatePages, fetchPages } = useWikiStore();
  const [mode, setMode] = useState<"file" | "sheets">("file");
  const [parsing, setParsing] = useState(false);
  const [proposals, setProposals] = useState<ParsedPage[]>([]);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [editedTitles, setEditedTitles] = useState<Record<number, string>>({});
  const [editedCats, setEditedCats] = useState<Record<number, WikiCategory>>({});
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  function reset() {
    setProposals([]);
    setChecked(new Set());
    setEditedTitles({});
    setEditedCats({});
    setError(null);
    setSheetsUrl("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setParsing(true);
    setError(null);
    const all: ParsedPage[] = [];
    for (const file of Array.from(files)) {
      try {
        const pages = await parseFile(file);
        all.push(...pages);
      } catch (e) {
        setError((e as Error).message);
      }
    }
    setProposals(all);
    setChecked(new Set(all.map((_, i) => i)));
    setParsing(false);
  }

  async function handleSheets() {
    if (!sheetsUrl.trim()) {
      setError("URL을 입력하세요");
      return;
    }
    setParsing(true);
    setError(null);
    try {
      const page = await fetchGoogleSheetsAsPage(sheetsUrl.trim());
      setProposals([page]);
      setChecked(new Set([0]));
    } catch (e) {
      setError((e as Error).message);
    }
    setParsing(false);
  }

  async function handleSave() {
    setSaving(true);
    const selected = proposals
      .map((p, i) => ({ p, i }))
      .filter(({ i }) => checked.has(i))
      .map(({ p, i }) => ({
        title: (editedTitles[i] ?? p.title).trim() || "제목 없음",
        content: p.content,
        category: editedCats[i] ?? p.category,
        tags: p.tags,
        source: p.source,
      }));

    if (selected.length === 0) {
      setError("저장할 항목을 선택하세요");
      setSaving(false);
      return;
    }

    const { created, failed } = await bulkCreatePages(selected);
    setSaving(false);

    if (failed > 0) {
      setError(`${created}개 저장됨 / ${failed}개 실패. 새로고침 후 확인하세요.`);
    } else {
      // 성공 — 다이얼로그 닫고 목록 새로고침
      reset();
      onClose();
      await fetchPages();
    }
  }

  function toggleCheck(i: number) {
    setChecked((c) => {
      const next = new Set(c);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Upload className="h-4 w-4 text-[var(--color-primary)]" />
            위키 파일 업로드
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* 모드 탭 */}
          <div className="flex gap-1 mb-4 p-1 bg-slate-900 rounded-lg w-fit">
            <button
              onClick={() => setMode("file")}
              className={cn(
                "px-3 py-1.5 text-xs rounded transition-colors",
                mode === "file" ? "bg-slate-700 text-slate-100" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <FileSpreadsheet className="inline h-3.5 w-3.5 mr-1" />
              파일 업로드
            </button>
            <button
              onClick={() => setMode("sheets")}
              className={cn(
                "px-3 py-1.5 text-xs rounded transition-colors",
                mode === "sheets" ? "bg-slate-700 text-slate-100" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Sheet className="inline h-3.5 w-3.5 mr-1" />
              Google Sheets URL
            </button>
          </div>

          {/* 입력 영역 */}
          {proposals.length === 0 && (
            <>
              {mode === "file" ? (
                <label className="block">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.tsv,.pdf,.txt,.md"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <div className="cursor-pointer rounded-xl border-2 border-dashed border-slate-700 hover:border-[var(--color-primary)]/50 p-8 text-center transition-colors">
                    {parsing ? (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
                        <span className="text-sm">분석 중...</span>
                      </div>
                    ) : (
                      <>
                        <FileText className="h-10 w-10 mx-auto text-slate-500 mb-2" />
                        <p className="text-sm text-slate-300 mb-1">
                          파일을 클릭해 선택 (여러 개 가능)
                        </p>
                        <p className="text-xs text-slate-500">
                          .xlsx · .xls · .csv · .tsv · .pdf · .txt · .md
                        </p>
                      </>
                    )}
                  </div>
                </label>
              ) : (
                <div className="space-y-3">
                  <Input
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit#gid=0"
                    value={sheetsUrl}
                    onChange={(e) => setSheetsUrl(e.target.value)}
                  />
                  <div className="text-xs text-slate-500 leading-relaxed space-y-1">
                    <p>💡 <b>가장 확실</b>: 시트 → 파일 → 공유 → <b>웹에 게시(Publish to web)</b> → CSV → 게시 → URL 붙여넣기</p>
                    <p>💡 <b>또는</b>: 공유 → "링크가 있는 모든 사용자: 뷰어" + 워크스페이스 외부 공유 허용</p>
                    <p>💡 <b>가장 간단</b>: 다운로드 → Excel → 위 <b>파일 업로드</b>에 드래그 (100% 동작)</p>
                  </div>
                  <Button
                    onClick={handleSheets}
                    disabled={parsing}
                    className="w-full"
                  >
                    {parsing ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        가져오는 중...
                      </span>
                    ) : (
                      "🔄 가져오기"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* 미리보기 */}
          {proposals.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{proposals.length}개 항목 분석됨 · {checked.size}개 선택</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setChecked(new Set(proposals.map((_, i) => i)))}
                    className="hover:text-slate-200"
                  >
                    전체 선택
                  </button>
                  <span className="text-slate-700">|</span>
                  <button
                    onClick={() => setChecked(new Set())}
                    className="hover:text-slate-200"
                  >
                    전체 해제
                  </button>
                </div>
              </div>
              {proposals.map((p, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-lg border p-3 transition-colors",
                    checked.has(i)
                      ? "border-[var(--color-primary)]/40 bg-slate-900/50"
                      : "border-slate-800 bg-slate-900/30 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={checked.has(i)}
                      onChange={() => toggleCheck(i)}
                      className="h-4 w-4 accent-[var(--color-primary)]"
                    />
                    <Input
                      value={editedTitles[i] ?? p.title}
                      onChange={(e) =>
                        setEditedTitles((s) => ({ ...s, [i]: e.target.value }))
                      }
                      className="h-7 text-xs flex-1"
                    />
                    <select
                      value={editedCats[i] ?? p.category}
                      onChange={(e) =>
                        setEditedCats((s) => ({ ...s, [i]: e.target.value as WikiCategory }))
                      }
                      className="rounded border border-slate-700 bg-slate-900 px-2 text-xs text-slate-200 max-w-[110px]"
                    >
                      {WIKI_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {WIKI_CATEGORY_ICONS[c]} {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-[10px] text-slate-500 mb-1.5 ml-6">
                    {p.content.length}자 · {p.tags.join(", ")} · 출처: {p.source}
                  </div>
                  <pre className="ml-6 max-h-16 overflow-hidden rounded bg-slate-950 p-2 text-[10px] text-slate-500 whitespace-pre-wrap font-mono">
                    {p.content.slice(0, 200)}
                    {p.content.length > 200 ? "..." : ""}
                  </pre>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
              ⚠ {error}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-between gap-2 px-5 py-3 border-t border-slate-800">
          {proposals.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={reset}>
              ← 다시 선택
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              닫기
            </Button>
            {proposals.length > 0 && (
              <Button onClick={handleSave} disabled={saving || checked.size === 0} size="sm">
                {saving ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    저장 중...
                  </span>
                ) : (
                  `📥 ${checked.size}개 위키로 저장`
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

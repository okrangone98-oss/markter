// ── /remake — 영상 리메이커 (Concept Replicator) ──
// 5단계: 입력 → 분석 → 스크립트 → 이미지 → /video 핸드오프
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wand2, Upload, Send, Loader2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTTSVideoStore } from "@/lib/stores/tts-video";
import { parseScriptToSlides, type ParsedSlide } from "@/lib/video/parse-script";

/* ── 타입 ── */
interface AnalyzeResult {
  meta: { title: string; durationSec: number };
  transcript: string;
  dna: {
    hookText?: string;
    hookType?: string;
    pacing?: string;
    visualStyle?: string;
    ctaPattern?: string;
    structureBeats?: string[];
  };
  scenes: Array<{ startSec: number; endSec: number; description: string; mood: string }>;
}

type Phase =
  | "idle"
  | "analyzing"
  | "analyzed"
  | "generating_script"
  | "script_ready"
  | "generating_images"
  | "ready"
  | "error";

interface SlideOutput extends Omit<ParsedSlide, "imageUrl"> {
  imageUrl: string | null;
  imageError?: string;
  warning?: string;
}

interface State {
  phase: Phase;
  error: string | null;
  errorHint?: string;
  url: string;
  topic: string;
  brief: string;
  photo: string | null; // data URI
  analyze: AnalyzeResult | null;
  scriptText: string;
  slides: SlideOutput[];
}

const INITIAL: State = {
  phase: "idle",
  error: null,
  url: "",
  topic: "",
  brief: "",
  photo: null,
  analyze: null,
  scriptText: "",
  slides: [],
};

const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2MB

export default function RemakePage() {
  const router = useRouter();
  const setPendingSlides = useTTSVideoStore((s) => s.setPendingSlides);
  const [s, setS] = useState<State>(INITIAL);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── 키 누락 안내 헬퍼 ── */
  function setKeyError(code: string, hint?: string) {
    const map: Record<string, string> = {
      GOOGLE_KEY_MISSING:
        "구글 AI Studio 키가 필요합니다. 설정 → API 키에서 등록하세요.",
      OPENROUTER_KEY_MISSING:
        "OpenRouter/OpenAI 키가 필요합니다. 설정 → API 키에서 등록하세요.",
      REPLICATE_KEY_MISSING:
        "Replicate 키가 필요합니다. 설정 → API 키에서 등록하세요.",
    };
    setS((p) => ({
      ...p,
      phase: "error",
      error: map[code] ?? code,
      errorHint: hint,
    }));
  }

  /* ── 1) 분석 시작 ── */
  async function handleAnalyze() {
    if (!s.url.trim()) {
      setS((p) => ({ ...p, phase: "error", error: "YouTube URL을 입력하세요." }));
      return;
    }
    setS((p) => ({ ...p, phase: "analyzing", error: null, errorHint: undefined }));
    try {
      const res = await fetch("/api/remake/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: s.url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error && /KEY_MISSING/.test(data.error)) {
          setKeyError(data.error, data.hint);
          return;
        }
        setS((p) => ({
          ...p,
          phase: "error",
          error: data.error ?? `분석 실패 (HTTP ${res.status})`,
        }));
        return;
      }
      setS((p) => ({ ...p, phase: "analyzed", analyze: data as AnalyzeResult }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "네트워크 오류";
      setS((p) => ({ ...p, phase: "error", error: `분석 실패: ${msg}` }));
    }
  }

  /* ── 2) 스크립트 생성 (스트리밍) ── */
  async function handleGenerateScript() {
    if (!s.analyze) return;
    setS((p) => ({ ...p, phase: "generating_script", scriptText: "", error: null }));
    try {
      const res = await fetch("/api/remake/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dna: s.analyze.dna,
          transcriptSnippet: s.analyze.transcript,
          userBrief: s.brief,
          topic: s.topic,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.error && /KEY_MISSING/.test(data.error)) {
          setKeyError(data.error, data.hint);
          return;
        }
        setS((p) => ({
          ...p,
          phase: "error",
          error: data?.error ?? `스크립트 생성 실패 (HTTP ${res.status})`,
        }));
        return;
      }
      if (!res.body) throw new Error("응답 본문이 없습니다.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith("data:")) continue;
          const payload = t.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const parsed = JSON.parse(payload) as { delta?: string; error?: string };
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.delta) {
              acc += parsed.delta;
              setS((p) => ({ ...p, scriptText: acc }));
            }
          } catch {
            // 파싱 실패는 조용히 스킵
          }
        }
      }
      setS((p) => ({ ...p, phase: "script_ready", scriptText: acc }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "오류";
      setS((p) => ({ ...p, phase: "error", error: `스크립트 생성 실패: ${msg}` }));
    }
  }

  /* ── 3) 이미지 생성 (NDJSON 스트림) ── */
  async function handleGenerateImages() {
    const parsed = parseScriptToSlides(s.scriptText).slice(0, 8);
    if (parsed.length === 0) {
      setS((p) => ({ ...p, phase: "error", error: "스크립트에서 슬라이드를 추출할 수 없습니다." }));
      return;
    }
    const initSlides: SlideOutput[] = parsed.map((sl) => ({
      ...sl,
      imageUrl: null,
    }));
    setS((p) => ({
      ...p,
      phase: "generating_images",
      slides: initSlides,
      error: null,
    }));

    try {
      const res = await fetch("/api/remake/generate-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slides: parsed.map((sl) => ({ title: sl.title, body: sl.body })),
          userPhotoBase64: s.photo,
          visualStyle: s.analyze?.dna.visualStyle ?? "",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.error && /KEY_MISSING/.test(data.error)) {
          setKeyError(data.error, data.hint);
          return;
        }
        setS((p) => ({
          ...p,
          phase: "error",
          error: data?.error ?? `이미지 생성 실패 (HTTP ${res.status})`,
        }));
        return;
      }
      if (!res.body) throw new Error("응답 본문이 없습니다.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const t = line.trim();
          if (!t) continue;
          try {
            const r = JSON.parse(t) as {
              index: number;
              imageUrl?: string;
              error?: string;
              warning?: string;
            };
            setS((p) => {
              const next = [...p.slides];
              if (next[r.index]) {
                next[r.index] = {
                  ...next[r.index],
                  imageUrl: r.imageUrl ?? null,
                  imageError: r.error,
                  warning: r.warning,
                };
              }
              return { ...p, slides: next };
            });
          } catch {
            // skip
          }
        }
      }
      setS((p) => ({ ...p, phase: "ready" }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "오류";
      setS((p) => ({ ...p, phase: "error", error: `이미지 생성 실패: ${msg}` }));
    }
  }

  /* ── 4) /video 로 핸드오프 ── */
  function handleSendToVideo() {
    if (s.slides.length === 0) return;
    // 생성된 이미지 URL 도 함께 전달 (ParsedSlide.imageUrl 옵션)
    setPendingSlides(
      s.slides.map((sl) => ({
        title: sl.title,
        body: sl.body,
        imageUrl: sl.imageUrl ?? undefined,
      }))
    );
    router.push("/video");
  }

  /* ── 사진 업로드 ── */
  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      setS((p) => ({
        ...p,
        error: `사진 크기는 2MB 이하여야 합니다. (현재 ${(file.size / 1024 / 1024).toFixed(1)}MB)`,
      }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setS((p) => ({ ...p, photo: result, error: null }));
      }
    };
    reader.readAsDataURL(file);
  }

  const isBusy =
    s.phase === "analyzing" ||
    s.phase === "generating_script" ||
    s.phase === "generating_images";

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/15 ring-1 ring-[var(--color-primary)]/40">
          <Wand2 className="h-5 w-5 text-[var(--color-primary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">영상 리메이커</h1>
          <p className="text-sm text-slate-400">
            마음에 드는 쇼츠/릴스의 DNA를 추출해, 내 주제로 새 콘텐츠를 만듭니다.
          </p>
        </div>
      </header>

      {/* 에러 배너 */}
      {s.error && (
        <Card className="border-red-900/60 bg-red-950/30">
          <CardContent className="flex items-start gap-3 p-4 text-sm text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <p>{s.error}</p>
              {s.errorHint && (
                <p className="mt-1 text-red-300/80">{s.errorHint}</p>
              )}
              {/KEY_MISSING|키가 필요/.test(s.error) && (
                <Link
                  href="/settings/api-keys"
                  className="mt-2 inline-block text-cyan-300 underline hover:text-cyan-200"
                >
                  설정 → API 키로 이동
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 1) 입력 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>1. 원본 영상 + 내 주제 입력</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              YouTube Shorts URL (90초 이하)
            </label>
            <Input
              placeholder="https://www.youtube.com/shorts/..."
              value={s.url}
              onChange={(e) => setS((p) => ({ ...p, url: e.target.value }))}
              disabled={isBusy}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">내 주제</label>
            <Input
              placeholder="예: 1인 사업자를 위한 시간 관리법"
              value={s.topic}
              onChange={(e) => setS((p) => ({ ...p, topic: e.target.value }))}
              disabled={isBusy}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              브리프 (선택)
            </label>
            <Textarea
              placeholder="강조하고 싶은 메시지, 타겟 독자, 톤 등"
              value={s.brief}
              onChange={(e) => setS((p) => ({ ...p, brief: e.target.value }))}
              disabled={isBusy}
              rows={3}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              내 얼굴 사진 (선택, 2MB 이하 — 페이스 스왑용)
            </label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
              >
                <Upload className="h-4 w-4" />
                {s.photo ? "변경" : "업로드"}
              </Button>
              {s.photo && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.photo}
                    alt="얼굴 미리보기"
                    className="h-12 w-12 rounded-md object-cover ring-1 ring-slate-700"
                  />
                  <button
                    type="button"
                    className="text-xs text-slate-400 hover:text-slate-200"
                    onClick={() => setS((p) => ({ ...p, photo: null }))}
                    disabled={isBusy}
                  >
                    제거
                  </button>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhoto}
              />
            </div>
          </div>
          <Button onClick={handleAnalyze} disabled={isBusy || !s.url.trim()}>
            {s.phase === "analyzing" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                분석 중…
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                영상 분석 시작
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 2) 분석 미리보기 */}
      {s.analyze && (
        <Card>
          <CardHeader>
            <CardTitle>2. 추출된 DNA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div>
                <div className="text-xs text-slate-500">제목</div>
                <div>{s.analyze.meta.title || "(없음)"}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">길이</div>
                <div>{s.analyze.meta.durationSec}초</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">훅 타입</div>
                <div>{s.analyze.dna.hookType ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">페이싱</div>
                <div>{s.analyze.dna.pacing ?? "—"}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-slate-500">비주얼 스타일</div>
                <div>{s.analyze.dna.visualStyle ?? "—"}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-slate-500">CTA 패턴</div>
                <div>{s.analyze.dna.ctaPattern ?? "—"}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-slate-500">구조 비트</div>
                <ul className="mt-1 list-disc pl-5 text-slate-300">
                  {(s.analyze.dna.structureBeats ?? []).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
            <Button
              onClick={handleGenerateScript}
              disabled={isBusy || !s.topic.trim()}
              className="mt-2"
            >
              {s.phase === "generating_script" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  스크립트 생성 중…
                </>
              ) : (
                <>다음: 새 스크립트 작성</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 3) 스크립트 */}
      {(s.scriptText || s.phase === "generating_script") && (
        <Card>
          <CardHeader>
            <CardTitle>3. 새 스크립트</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={s.scriptText}
              onChange={(e) => setS((p) => ({ ...p, scriptText: e.target.value }))}
              rows={12}
              disabled={s.phase === "generating_script"}
              className="font-mono text-xs"
            />
            {s.phase !== "generating_script" && s.scriptText && (
              <Button onClick={handleGenerateImages} disabled={isBusy}>
                {s.phase === "generating_images" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    이미지 생성 중…
                  </>
                ) : (
                  <>다음: 슬라이드 이미지 생성</>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* 4) 슬라이드 그리드 */}
      {s.slides.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>4. 슬라이드 이미지</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {s.slides.map((sl, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950"
                >
                  <div className="relative aspect-[9/16] bg-slate-900">
                    {sl.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sl.imageUrl}
                        alt={sl.title}
                        className="h-full w-full object-cover"
                      />
                    ) : sl.imageError ? (
                      <div className="flex h-full items-center justify-center p-2 text-center text-xs text-red-300">
                        {sl.imageError}
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-600">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <div className="line-clamp-1 text-xs font-semibold text-slate-200">
                      {sl.title}
                    </div>
                    <div className="line-clamp-2 text-[11px] text-slate-400">
                      {sl.body}
                    </div>
                    {sl.warning === "no_face_swap" && (
                      <div className="mt-1 text-[10px] text-amber-300">
                        얼굴 합성 없이 생성됨
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5) 영상 메이커로 보내기 */}
      {s.phase === "ready" && (
        <Card>
          <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-300">
              완성! 슬라이드 텍스트를 영상 메이커로 보내 영상으로 합성하세요.
              <br />
              <span className="text-xs text-slate-500">
                (이미지는 별도로 다운로드해 영상 메이커에서 첨부하세요.)
              </span>
            </div>
            <Button onClick={handleSendToVideo}>
              <Send className="h-4 w-4" />
              영상 메이커로 보내기
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

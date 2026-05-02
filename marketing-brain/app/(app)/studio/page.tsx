// 콘텐츠 스튜디오 — Layer 2: Generation (MVP)
// v0.1 단일 HTML의 콘텐츠 생성 폼을 Next.js로 포팅한 최소 버전.
// 추후 추가: 위키 컨텍스트 주입, 다중 변형(A/B/C), 자동 개선 루프, 페르소나/경쟁사 주입.
"use client";

import { useState, useRef } from "react";
import {
  WandSparkles,
  Send,
  StopCircle,
  Copy,
  Download,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { streamGenerate } from "@/lib/llm/client";
import { INITIAL_PROFILES } from "@/lib/llm/profiles";
import { TONE_MAP, TYPE_INSTRUCTIONS } from "@/lib/llm/prompts";
import type { ContentType, ToneStyle } from "@/lib/llm/types";

// 콘텐츠 타입 한국어 라벨 (드롭다운 표시용)
const TYPE_LABELS: Record<ContentType, string> = {
  blog_intro: "📝 블로그 인트로",
  blog_full: "📝 블로그 전문 (SEO)",
  instagram_feed: "📱 인스타그램 피드",
  instagram_story: "📱 인스타그램 스토리",
  thread_series: "🧵 스레드 5부작",
  twitter_thread: "🐦 X 트위터 스레드",
  facebook_post: "📘 페이스북 포스트",
  product_detail: "🛒 상세페이지",
  ad_copy: "📢 광고 카피 (A/B/C)",
  slogan: "✨ 슬로건 5개",
  cta_variants: "🎯 CTA 변형 5개",
  youtube_script: "🎬 유튜브 대본",
  shorts_script: "🎥 쇼츠/릴스 대본",
  tts_narration: "🎙 TTS 나레이션",
  video_subtitle: "💬 영상 자막",
  proposal: "📋 기획서 개요",
  report_summary: "📊 보고서 요약",
  faq: "❓ FAQ 10개",
  meeting_minutes: "🗒 회의록",
  email_cold: "✉️ 콜드 이메일",
  email_newsletter: "📨 뉴스레터",
  press_release: "📰 보도자료",
};

const TONE_LABELS: Record<ToneStyle, string> = {
  professional: "전문적·신뢰감",
  casual: "친근·캐주얼",
  emotional: "감성·에세이",
  witty: "재치·유머",
  urgent: "긴박감·CTA",
  storytelling: "스토리텔링",
};

const PROFILE_LABELS: Record<string, string> = {
  pakchaenam: "🌊 파책남 (감성 에세이)",
  center: "🏛 양양군 센터 (공식 문체)",
  business: "💼 비즈니스 제안",
  custom: "⚙️ 직접 입력",
};

export default function StudioPage() {
  // ── 폼 상태 ──
  const [profile, setProfile] = useState<string>("pakchaenam");
  const [type, setType] = useState<ContentType>("blog_intro");
  const [tone, setTone] = useState<ToneStyle>("emotional");
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [audience, setAudience] = useState("");
  const [customVoice, setCustomVoice] = useState("");
  const [customAvoid, setCustomAvoid] = useState("");

  // ── 결과 상태 ──
  const [result, setResult] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  function getBrandFields() {
    if (profile === "custom") {
      return { brandVoice: customVoice, avoidWords: customAvoid };
    }
    const p = INITIAL_PROFILES[profile];
    return p ? { brandVoice: p.voice, avoidWords: p.avoid } : { brandVoice: "", avoidWords: "" };
  }

  async function handleGenerate() {
    if (!topic.trim()) {
      setError("주제를 입력하세요");
      return;
    }
    setError(null);
    setResult("");
    setGenerating(true);
    abortRef.current = new AbortController();

    const { brandVoice, avoidWords } = getBrandFields();

    try {
      await streamGenerate(
        { type, topic: topic.trim(), tone, audience, keywords, brandVoice, avoidWords },
        (chunk) => setResult((prev) => prev + chunk),
        { signal: abortRef.current.signal }
      );
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError((e as Error).message);
      }
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  }

  function handleStop() {
    abortRef.current?.abort();
  }

  async function handleCopy() {
    if (!result.trim()) return;
    try {
      await navigator.clipboard.writeText(result);
      // 잠깐 시각 피드백
      const btn = document.getElementById("copy-btn");
      if (btn) {
        btn.textContent = "✓ 복사됨";
        setTimeout(() => { if (btn) btn.textContent = "복사"; }, 1500);
      }
    } catch {
      setError("클립보드 접근 실패");
    }
  }

  function handleDownload() {
    if (!result.trim()) return;
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marketing-brain-${type}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-4">
      {/* 헤더 */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 ring-1 ring-[var(--color-primary)]/30">
          <WandSparkles className="h-6 w-6 text-[var(--color-primary)]" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            Layer 2 · Generation
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            콘텐츠 스튜디오
          </h1>
          <p className="text-sm text-slate-400">
            22개 콘텐츠 타입 · 6개 톤 · 3개 브랜드 프로필 · 실시간 스트리밍
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* 좌측: 입력 폼 */}
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-5">
          <div className="space-y-1.5">
            <Label>브랜드 프로필</Label>
            <select
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            >
              {Object.entries(PROFILE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {profile === "custom" && (
            <>
              <div className="space-y-1.5">
                <Label>브랜드 문체 지침</Label>
                <Textarea
                  rows={3}
                  value={customVoice}
                  onChange={(e) => setCustomVoice(e.target.value)}
                  placeholder="이 브랜드의 문체, 자주 쓰는 표현 등"
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label>금지 표현 (쉼표 구분)</Label>
                <Input
                  value={customAvoid}
                  onChange={(e) => setCustomAvoid(e.target.value)}
                  placeholder="예: 혁신적인, 안녕하세요"
                  className="text-xs"
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label>콘텐츠 타입</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ContentType)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            >
              {(Object.keys(TYPE_LABELS) as ContentType[]).map((k) => (
                <option key={k} value={k}>{TYPE_LABELS[k]}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              {TYPE_INSTRUCTIONS[type]}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>톤 스타일</Label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as ToneStyle)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            >
              {(Object.keys(TONE_LABELS) as ToneStyle[]).map((k) => (
                <option key={k} value={k}>
                  {TONE_LABELS[k]} — {TONE_MAP[k]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>주제 *</Label>
            <Textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="콘텐츠의 핵심 주제·상황·맥락을 설명하세요"
            />
          </div>

          <div className="space-y-1.5">
            <Label>핵심 키워드</Label>
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="쉼표 구분 (예: 서핑, 양양, 로컬)"
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label>대상 독자 (선택)</Label>
            <Input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="예: 30~40대 직장인 여성"
              className="text-xs"
            />
          </div>

          {generating ? (
            <Button onClick={handleStop} variant="destructive" className="w-full">
              <StopCircle className="h-4 w-4" /> 중지
            </Button>
          ) : (
            <Button onClick={handleGenerate} className="w-full" size="lg">
              <Send className="h-4 w-4" /> 생성하기
            </Button>
          )}

          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              ⚠ {error}
            </div>
          )}
        </div>

        {/* 우측: 결과 */}
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/40 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">
              생성 결과
              {generating && (
                <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-[var(--color-primary)]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-primary)]" />
                  스트리밍 중...
                </span>
              )}
            </h2>
            {result && (
              <div className="flex gap-1">
                <Button
                  id="copy-btn"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 text-xs"
                >
                  <Copy className="h-3 w-3" /> 복사
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="h-7 text-xs"
                >
                  <Download className="h-3 w-3" /> 다운로드
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="h-7 text-xs"
                >
                  <RefreshCw className="h-3 w-3" /> 재생성
                </Button>
              </div>
            )}
          </div>

          <div className="min-h-[400px] rounded-md border border-slate-800 bg-slate-900/40 p-4 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
            {result || (
              <span className="text-slate-600">
                좌측에서 입력 후 <b className="text-slate-400">생성하기</b> 버튼을 눌러주세요.
              </span>
            )}
          </div>

          {result && (
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>{result.length}자</span>
              <span>약 {Math.ceil(result.length / 5)}단어</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

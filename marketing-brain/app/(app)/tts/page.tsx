"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic2,
  Download,
  Film,
  RefreshCw,
  Volume2,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { useTTSVideoStore } from "@/lib/stores/tts-video";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

/* ── 타입 ── */
type Engine = "neural" | "puter" | "openai" | "elevenlabs";

interface EngineInfo {
  id: Engine;
  name: string;
  desc: string;
  badge: string;
  free: boolean;
  icon: string;
}

interface VoiceOption {
  id: string;
  name: string;
}

/* ── 상수 ── */
const ENGINES: EngineInfo[] = [
  {
    id: "neural",
    name: "Microsoft Neural",
    desc: "최고 무료 음질 · 한국어 자연스러움",
    badge: "무료",
    free: true,
    icon: "🧠",
  },
  {
    id: "puter",
    name: "Puter (AWS Polly)",
    desc: "Polly Neural · 빠른 응답",
    badge: "무료",
    free: true,
    icon: "⚡",
  },
  {
    id: "openai",
    name: "OpenAI TTS-HD",
    desc: "스튜디오 품질 · API 키 필요",
    badge: "유료 키",
    free: false,
    icon: "🎯",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    desc: "최상급 자연스러움 · API 키 필요",
    badge: "유료 키",
    free: false,
    icon: "💎",
  },
];

const OPENAI_VOICES: VoiceOption[] = [
  { id: "nova", name: "Nova (여성, 자연스러움)" },
  { id: "alloy", name: "Alloy (중성)" },
  { id: "echo", name: "Echo (남성, 차분)" },
  { id: "fable", name: "Fable (영국식)" },
  { id: "onyx", name: "Onyx (남성, 깊은 목소리)" },
  { id: "shimmer", name: "Shimmer (여성, 밝음)" },
];

const ELEVENLABS_VOICES: VoiceOption[] = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (다국어 지원)" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi (에너지)" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella (소프트)" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni (부드러운 남성)" },
  { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli (젊은 여성)" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh (청년 남성)" },
  { id: "VR6AewLTigWG4xSOukaG", name: "Arnold (중후한 남성)" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam (서술형)" },
  { id: "yoZ06aMxZJJ28mfd3POQ", name: "Sam (중간 음조)" },
];

const POLLY_KO_VOICES: VoiceOption[] = [
  { id: "Seoyeon", name: "Seoyeon (한국어 Neural)" },
];

/* ── 유틸 ── */
function charEstimateSec(text: string): number {
  return Math.round((text.length / 5) * 0.3);
}

/* ══════════════════════════════════════════════════════════
   TTS 페이지 컴포넌트
   ══════════════════════════════════════════════════════════ */
export default function TTSPage() {
  const { setTTSResult } = useTTSVideoStore();

  const [engine, setEngine] = useState<Engine>("neural");
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [text, setText] = useState("");
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);

  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [synthEl, setSynthEl] = useState<HTMLElement | null>(null); // SpeechSynthesis 전용
  const [toast, setToast] = useState("");

  const audioRef = useRef<HTMLAudioElement>(null);
  const resultBlobRef = useRef<Blob | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  /* 엔진 변경 시 보이스 목록 갱신 */
  useEffect(() => {
    if (engine === "neural") {
      loadNeuralVoices();
    } else if (engine === "puter") {
      setVoices(POLLY_KO_VOICES);
      setSelectedVoice(POLLY_KO_VOICES[0].id);
    } else if (engine === "openai") {
      setVoices(OPENAI_VOICES);
      setSelectedVoice(OPENAI_VOICES[0].id);
    } else {
      setVoices(ELEVENLABS_VOICES);
      setSelectedVoice(ELEVENLABS_VOICES[0].id);
    }
  }, [engine]);

  /* Puter SDK 동적 로드 */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("puter-sdk")) return;
    const s = document.createElement("script");
    s.id = "puter-sdk";
    s.src = "https://js.puter.com/v2/";
    document.head.appendChild(s);
  }, []);

  function loadNeuralVoices() {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setVoices([{ id: "", name: "SpeechSynthesis 미지원 브라우저" }]);
      return;
    }
    const populate = () => {
      const all = window.speechSynthesis.getVoices();
      const ko = all.filter(
        (v) =>
          v.lang.startsWith("ko") &&
          (v.name.toLowerCase().includes("neural") ||
            v.name.includes("SunHi") ||
            v.name.includes("InJoon") ||
            v.name.includes("Hyunsu") ||
            v.name.includes("Sun Hi") ||
            v.name.includes("In-Joon") ||
            v.localService === false)
      );
      const list: VoiceOption[] =
        ko.length > 0
          ? ko.map((v) => ({ id: v.voiceURI, name: v.name }))
          : all
              .filter((v) => v.lang.startsWith("ko"))
              .map((v) => ({ id: v.voiceURI, name: v.name }));

      if (list.length === 0) {
        setVoices([{ id: "", name: "한국어 보이스 없음 (Edge/Chrome 권장)" }]);
      } else {
        setVoices(list);
        setSelectedVoice(list[0].id);
      }
    };
    const v = window.speechSynthesis.getVoices();
    if (v.length > 0) {
      populate();
    } else {
      window.speechSynthesis.onvoiceschanged = populate;
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function insertBreak(dur: string) {
    const ta = document.getElementById("tts-textarea") as HTMLTextAreaElement;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const tag = `<break time="${dur}"/>`;
    const next = text.slice(0, start) + tag + text.slice(end);
    setText(next);
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + tag.length;
      ta.focus();
    }, 0);
  }

  function cleanMarkdown() {
    const cleaned = text
      .replace(/#{1,6}\s*/g, "")
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
      .replace(/_{1,3}([^_]+)_{1,3}/g, "$1")
      .replace(/`[^`]+`/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[-*]\s+/g, "")
      .replace(/\n{3,}/g, "\n\n");
    setText(cleaned);
    showToast("✨ 마크다운 정리됨");
  }

  /* ── TTS 실행 ── */
  async function runTTS() {
    if (!text.trim()) {
      showToast("⚠ 읽을 텍스트를 입력하세요");
      return;
    }
    setLoading(true);
    setSynthEl(null);
    clearResult();
    try {
      if (engine === "neural") {
        const el = await ttsNeural(text, selectedVoice, rate, pitch);
        setSynthEl(el);
      } else {
        let blob: Blob;
        if (engine === "puter") blob = await ttsPuter(text, selectedVoice);
        else if (engine === "openai") blob = await ttsOpenAI(text, selectedVoice, rate, apiKey);
        else blob = await ttsElevenLabs(text, selectedVoice, apiKey);

        if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
        const url = URL.createObjectURL(blob);
        resultBlobRef.current = blob;
        resultUrlRef.current = url;
        setResultBlob(blob);
        setResultUrl(url);

        // Zustand 스토어에 저장 (영상 메이커 연결용)
        setTTSResult({ blob, url, name: `tts-${Date.now()}.mp3` });
      }
      showToast("✓ 음성 생성 완료");
    } catch (e: unknown) {
      showToast("⚠ " + ((e as Error).message || "음성 생성 실패"));
    } finally {
      setLoading(false);
    }
  }

  function clearResult() {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    resultBlobRef.current = null;
    setResultUrl(null);
    setResultBlob(null);
    setSynthEl(null);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setTTSResult(null);
  }

  function downloadAudio() {
    const blob = resultBlobRef.current;
    const url = resultUrlRef.current;
    if (!blob || !url) return;
    const ext = blob.type.includes("mpeg") ? "mp3" : blob.type.includes("wav") ? "wav" : "audio";
    const a = document.createElement("a");
    a.href = url;
    a.download = `marketing-brain-voice-${Date.now()}.${ext}`;
    a.click();
  }

  /* ── 엔진별 함수 ── */
  function ttsNeural(
    txt: string,
    voiceURI: string,
    r: number,
    p: number
  ): Promise<HTMLElement> {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error("이 브라우저는 SpeechSynthesis를 지원하지 않습니다"));
        return;
      }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(
        txt.replace(/<break[^/]*\/>/g, ", ")
      );
      const v = window.speechSynthesis.getVoices().find((x) => x.voiceURI === voiceURI);
      if (v) { u.voice = v; u.lang = v.lang; }
      u.rate = r;
      u.pitch = p;

      const wrap = document.createElement("div");
      wrap.className = "flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900 p-4";

      const playBtn = document.createElement("button");
      playBtn.className = "rounded-md bg-[#00e5c8] px-4 py-2 text-sm font-medium text-slate-950";
      playBtn.textContent = "▶ 재생";
      let playing = false;
      playBtn.onclick = () => {
        if (!playing) {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
          playing = true;
          playBtn.textContent = "⏸ 정지";
        } else {
          window.speechSynthesis.cancel();
          playing = false;
          playBtn.textContent = "▶ 재생";
        }
      };
      u.onend = () => { playing = false; playBtn.textContent = "▶ 재생"; };

      const label = document.createElement("span");
      label.className = "text-sm text-slate-400";
      label.textContent = `${v ? v.name : "기본 보이스"} · ${txt.length}자`;

      wrap.appendChild(playBtn);
      wrap.appendChild(label);
      resolve(wrap);
    });
  }

  async function ttsPuter(txt: string, voice: string): Promise<Blob> {
    const w = window as unknown as { puter?: { ai?: { txt2speech?: (t: string, o: Record<string, unknown>) => Promise<HTMLAudioElement> } } };
    if (!w.puter?.ai?.txt2speech) {
      throw new Error("Puter SDK 로드 실패 — 페이지 새로고침 후 다시 시도");
    }
    const hasBreak = /<break/i.test(txt);
    const payload = hasBreak ? `<speak>${txt}</speak>` : txt;
    const opts: Record<string, unknown> = { voice, engine: "neural" };
    if (hasBreak) opts.ssml = true;
    const audio = await w.puter.ai.txt2speech(payload, opts);
    const src = audio.src || audio.currentSrc;
    if (!src) throw new Error("Puter 응답에 오디오 소스가 없습니다");
    const resp = await fetch(src);
    return resp.blob();
  }

  async function ttsOpenAI(txt: string, voice: string, r: number, key: string): Promise<Blob> {
    if (!key.trim()) throw new Error("OpenAI API 키를 입력하세요");
    const clean = txt.replace(/<break[^/]*\/>/g, ", ");
    const resp = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + key.trim(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1-hd",
        voice,
        input: clean,
        speed: Math.max(0.25, Math.min(4.0, r)),
        response_format: "mp3",
      }),
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error("OpenAI TTS 실패: " + err.slice(0, 120));
    }
    return resp.blob();
  }

  async function ttsElevenLabs(txt: string, voiceId: string, key: string): Promise<Blob> {
    if (!key.trim()) throw new Error("ElevenLabs API 키를 입력하세요");
    const clean = txt.replace(/<break[^/]*\/>/g, " ... ");
    const resp = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": key.trim(),
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: clean,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error("ElevenLabs 실패: " + err.slice(0, 120));
    }
    return resp.blob();
  }

  const hasResult = resultUrl !== null || synthEl !== null;

  /* ── 렌더 ── */
  return (
    <div className="mx-auto max-w-3xl py-4">
      {/* 헤더 */}
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 ring-1 ring-[var(--color-primary)]/30">
          <Mic2 className="h-6 w-6 text-[var(--color-primary)]" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            Layer 2 · Generation
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            AI 음성 합성 (TTS)
          </h1>
          <p className="text-sm text-slate-400">
            한국어 자연 음성 · 4가지 엔진 · MP3 다운로드
          </p>
        </div>
      </div>

      {/* 토스트 */}
      {toast && (
        <div className="mb-4 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200">
          {toast}
        </div>
      )}

      <Card>
        <CardContent className="flex flex-col gap-5 pt-6">
          {/* 엔진 선택 */}
          <div className="space-y-2">
            <Label>음성 엔진</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ENGINES.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setEngine(e.id)}
                  className={cn(
                    "flex flex-col gap-1 rounded-lg border p-3 text-left transition-all",
                    engine === e.id
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "border-slate-700 bg-slate-900 hover:border-slate-600"
                  )}
                >
                  <span className="text-xl">{e.icon}</span>
                  <span className="text-xs font-semibold text-slate-100">
                    {e.name}
                  </span>
                  <span className="text-[11px] leading-snug text-slate-400">
                    {e.desc}
                  </span>
                  <span
                    className={cn(
                      "mt-1 w-fit rounded px-1.5 py-0.5 text-[10px] font-medium",
                      e.free
                        ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                        : "bg-[var(--color-purple)]/15 text-[var(--color-purple)]"
                    )}
                  >
                    {e.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 보이스 선택 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>보이스</Label>
              {engine === "neural" && (
                <button
                  onClick={loadNeuralVoices}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                >
                  <RefreshCw className="h-3 w-3" /> 새로고침
                </button>
              )}
            </div>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-[var(--color-primary)] focus:outline-none"
            >
              {voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            {engine === "neural" && (
              <p className="text-[11px] text-slate-500">
                💡 Microsoft Edge / 최신 Chrome에서 SunHi · InJoon · Hyunsu 한국어 Neural 보이스가 가장 자연스럽습니다.
              </p>
            )}
          </div>

          {/* API 키 (OpenAI / ElevenLabs) */}
          {(engine === "openai" || engine === "elevenlabs") && (
            <div className="space-y-1.5">
              <Label>
                {engine === "openai" ? "OpenAI API 키" : "ElevenLabs API 키"}
              </Label>
              <Input
                type="password"
                placeholder={engine === "openai" ? "sk-..." : "elevenlabs 키..."}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-[11px] text-slate-500">
                {engine === "openai"
                  ? "platform.openai.com/api-keys 에서 발급 · 브라우저에서 직접 호출"
                  : "elevenlabs.io/app/settings/api-keys 에서 발급"}
              </p>
            </div>
          )}

          {/* 텍스트 입력 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>읽을 텍스트</Label>
              <span className="text-[11px] text-slate-500">
                {text.length}자 · 약 {charEstimateSec(text)}초
              </span>
            </div>
            <Textarea
              id="tts-textarea"
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="여기에 음성으로 변환할 텍스트를 붙여넣거나 작성하세요. 영상 대본·카드뉴스에서 자동으로 가져올 수도 있어요."
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => insertBreak("300ms")}
                className="rounded border border-slate-700 px-2 py-1 text-[11px] text-slate-400 hover:border-slate-500 hover:text-slate-200"
              >
                ⏸ 짧은 쉼
              </button>
              <button
                onClick={() => insertBreak("700ms")}
                className="rounded border border-slate-700 px-2 py-1 text-[11px] text-slate-400 hover:border-slate-500 hover:text-slate-200"
              >
                ⏸ 중간 쉼
              </button>
              <button
                onClick={() => insertBreak("1.2s")}
                className="rounded border border-slate-700 px-2 py-1 text-[11px] text-slate-400 hover:border-slate-500 hover:text-slate-200"
              >
                ⏸ 긴 쉼
              </button>
              <button
                onClick={cleanMarkdown}
                className="rounded border border-slate-700 px-2 py-1 text-[11px] text-slate-400 hover:border-slate-500 hover:text-slate-200"
              >
                ✨ 마크다운 정리
              </button>
            </div>
          </div>

          {/* 속도 / 피치 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>
                속도{" "}
                <span className="text-[var(--color-primary)]">
                  {rate.toFixed(2)}×
                </span>
              </Label>
              <input
                type="range"
                min={0.5}
                max={1.6}
                step={0.05}
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full accent-[var(--color-primary)]"
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                피치{" "}
                <span className="text-[var(--color-primary)]">
                  {pitch.toFixed(2)}
                </span>
              </Label>
              <input
                type="range"
                min={0.7}
                max={1.4}
                step={0.05}
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full accent-[var(--color-primary)]"
                disabled={engine !== "neural"}
              />
              {engine !== "neural" && (
                <p className="text-[11px] text-slate-600">
                  피치 조절은 Neural 엔진 전용
                </p>
              )}
            </div>
          </div>

          {/* 실행 버튼 */}
          <Button
            onClick={runTTS}
            disabled={loading}
            size="lg"
            className="w-full text-base font-semibold"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                음성 생성 중...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Mic2 className="h-5 w-5" /> 음성 생성
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 결과 플레이어 */}
      {hasResult && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Volume2 className="h-4 w-4 text-[var(--color-primary)]" />
                생성된 음성
              </CardTitle>
              <div className="flex gap-2">
                {resultUrl && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={downloadAudio}
                    >
                      <Download className="h-4 w-4" />
                      다운로드
                    </Button>
                    <Button variant="secondary" size="sm" asChild>
                      <Link href="/video">
                        <Film className="h-4 w-4" />
                        영상 메이커로
                      </Link>
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearResult}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {resultUrl ? (
              <div className="space-y-2">
                <audio
                  ref={audioRef}
                  controls
                  src={resultUrl}
                  className="w-full"
                />
              </div>
            ) : synthEl ? (
              <div className="space-y-2">
                <SynthPlayer el={synthEl} />
                <p className="text-[11px] text-slate-500">
                  💡 Microsoft Neural은 브라우저 내장 재생만 지원합니다.{" "}
                  <strong>MP3 다운로드 / 영상 메이커 연결</strong>이 필요하면 Puter, OpenAI, ElevenLabs 엔진을 선택하세요.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* SpeechSynthesis 플레이어 — DOM 엘리먼트를 React 트리에 마운트 */
function SynthPlayer({ el }: { el: HTMLElement }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = "";
      ref.current.appendChild(el);
    }
  }, [el]);
  return <div ref={ref} />;
}

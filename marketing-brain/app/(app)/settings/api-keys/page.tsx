// API 키 설정 — BYOK (Bring Your Own Key)
// OpenAI, Anthropic, Replicate, ElevenLabs 4개 제공자
"use client";

import { useEffect, useState } from "react";
import { Key, Save, Trash2, ExternalLink, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ProviderInfo {
  id: "openai" | "anthropic" | "google" | "replicate" | "elevenlabs";
  name: string;
  desc: string;
  prefix: string;
  signupUrl: string;
  models: string;
  costHint: string;
}

const PROVIDERS: ProviderInfo[] = [
  {
    id: "openai",
    name: "OpenAI",
    desc: "GPT-5 / GPT-5.5 · Codex · GPT-image · Whisper · TTS-HD",
    prefix: "sk-...",
    signupUrl: "https://platform.openai.com/api-keys",
    models: "최신 GPT 텍스트·코딩·이미지·음성·전사",
    costHint: "GPT-5 1K토큰 ~$0.005 · 이미지 ~$0.04 · Whisper ~$0.006/분",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    desc: "Claude Opus 5.7 · Sonnet 4.6 (긴 문맥·코딩·분석 최강)",
    prefix: "sk-ant-...",
    signupUrl: "https://console.anthropic.com/settings/keys",
    models: "고품질 텍스트·코드·문서 분석",
    costHint: "Sonnet 4.6 1K토큰 ~$0.003 · Opus 약 5x",
  },
  {
    id: "google",
    name: "Google AI Studio",
    desc: "Gemini 2.5 Pro · Gemma 4 · 영상 직접 분석 (Vision) 가능",
    prefix: "AIza...",
    signupUrl: "https://aistudio.google.com/app/apikey",
    models: "텍스트·이미지·영상 분석 (60초 Shorts 인풋 가능)",
    costHint: "무료 5 RPM · 유료 1K토큰 ~$0.001 (가장 저렴)",
  },
  {
    id: "replicate",
    name: "Replicate",
    desc: "Seedance 2.0 · Veo 3 · Flux · Kling · PuLID 페이스 스왑",
    prefix: "r8_...",
    signupUrl: "https://replicate.com/account/api-tokens",
    models: "최신 영상 생성·이미지·페이스 스왑",
    costHint: "Flux ~$0.003/장 · Seedance 2.0 5초 ~$0.40",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    desc: "최상급 TTS + 음성 클론 (한국어 자연도 ↑)",
    prefix: "elevenlabs 키",
    signupUrl: "https://elevenlabs.io/app/settings/api-keys",
    models: "TTS · 음성 클론",
    costHint: "Free 10K자/월 · Starter $5/월 30K자",
  },
];

interface KeyStatus {
  openai: boolean;
  anthropic: boolean;
  google: boolean;
  replicate: boolean;
  elevenlabs: boolean;
}

export default function ApiKeysPage() {
  const [status, setStatus] = useState<KeyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  // 입력 폼 상태 (각 키에 대해 평문 입력)
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [savedFlash, setSavedFlash] = useState<Record<string, boolean>>({});

  useEffect(() => { fetchStatus(); }, []);

  async function fetchStatus() {
    setLoading(true);
    try {
      const r = await fetch("/api/user-keys");
      const json = await r.json();
      if (!r.ok) throw new Error(json.error);
      setStatus(json.keys);
      setUpdatedAt(json.updated_at);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function saveKey(provider: ProviderInfo["id"], key: string) {
    setSaving((s) => ({ ...s, [provider]: true }));
    setError(null);
    try {
      const r = await fetch("/api/user-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, key }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error);
      // 입력 칸 비우고 상태 갱신
      setInputs((i) => ({ ...i, [provider]: "" }));
      setSavedFlash((s) => ({ ...s, [provider]: true }));
      setTimeout(() => setSavedFlash((s) => ({ ...s, [provider]: false })), 2000);
      await fetchStatus();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving((s) => ({ ...s, [provider]: false }));
    }
  }

  return (
    <div className="mx-auto max-w-3xl py-4 space-y-6">
      {/* 헤더 */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 ring-1 ring-[var(--color-primary)]/30">
          <Key className="h-6 w-6 text-[var(--color-primary)]" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            Settings
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            API 키 (BYOK)
          </h1>
          <p className="text-sm text-slate-400">
            본인의 유료 API 키를 등록하면 GPT-5·Claude·Seedance·ElevenLabs 등 고품질 모델을 사용할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 보안 안내 */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-200/80 leading-relaxed">
        <p className="font-semibold text-amber-300 mb-1.5">🔐 보안</p>
        <ul className="space-y-1 ml-4 list-disc">
          <li>키는 Supabase 에 <strong>pgcrypto 대칭 암호화</strong>되어 저장됩니다 (RLS 로 본인만 접근).</li>
          <li>저장된 키는 <strong>API 호출 시에만 서버에서 복호화</strong>되며, 클라이언트(브라우저)로 절대 다시 응답되지 않습니다.</li>
          <li>해당 페이지에서는 등록 여부(✓ / —)만 확인 가능하고, 실제 키는 다시 볼 수 없습니다.</li>
          <li>변경하려면 새 키를 입력해 덮어쓰거나, 빈 칸으로 저장해 삭제하세요.</li>
        </ul>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          ⚠ {error}
        </div>
      )}

      {/* 키 목록 */}
      <div className="space-y-3">
        {PROVIDERS.map((p) => {
          const isSet = status?.[p.id] ?? false;
          const isSaving = saving[p.id] ?? false;
          const flash = savedFlash[p.id] ?? false;
          const value = inputs[p.id] ?? "";

          return (
            <div
              key={p.id}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                isSet
                  ? "border-[var(--color-primary)]/30 bg-slate-900/50"
                  : "border-slate-800 bg-slate-900/30"
              )}
            >
              {/* 헤더 */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-sm font-semibold text-slate-100">{p.name}</h2>
                    {loading ? (
                      <Loader2 className="h-3.5 w-3.5 text-slate-500 animate-spin" />
                    ) : isSet ? (
                      <Tooltip content="키가 저장되어 있습니다 (값은 보안상 표시 X)">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--color-primary)]/15 text-[var(--color-primary)] text-[10px] font-semibold">
                          <CheckCircle2 className="h-3 w-3" /> 설정됨
                        </span>
                      </Tooltip>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 text-[10px]">
                        <AlertCircle className="h-3 w-3" /> 미설정
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{p.desc}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{p.costHint}</p>
                </div>
                <a
                  href={p.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[var(--color-primary)] hover:underline whitespace-nowrap"
                >
                  키 발급
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* 입력 + 저장 */}
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={value}
                  onChange={(e) => setInputs((i) => ({ ...i, [p.id]: e.target.value }))}
                  placeholder={isSet ? "(이미 설정됨 — 새 키 입력 시 덮어씀)" : p.prefix}
                  className="flex-1 text-xs"
                />
                <Button
                  size="sm"
                  onClick={() => saveKey(p.id, value)}
                  disabled={isSaving || !value.trim()}
                >
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : flash ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  저장
                </Button>
                {isSet && (
                  <Tooltip content="키를 삭제합니다 (서버에서 즉시 제거)">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`${p.name} 키를 삭제하시겠습니까?`)) saveKey(p.id, "");
                      }}
                      disabled={isSaving}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </Button>
                  </Tooltip>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {updatedAt && (
        <p className="text-[10px] text-slate-600 text-center">
          마지막 갱신: {new Date(updatedAt).toLocaleString("ko-KR")}
        </p>
      )}

      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-xs text-slate-400 leading-relaxed">
        <p className="font-semibold text-slate-300 mb-2">💡 사용 흐름</p>
        <ol className="space-y-1 ml-4 list-decimal">
          <li>위에서 키를 저장하면 Studio·Video 페이지의 모델 선택 드롭다운에서 유료 모델이 활성화됩니다.</li>
          <li>키가 없는 제공자의 모델을 선택하면 무료 모델로 자동 폴백합니다.</li>
          <li>모든 호출은 서버에서 이루어지며 청구는 직접 본인 계정으로 됩니다.</li>
        </ol>
      </div>
    </div>
  );
}

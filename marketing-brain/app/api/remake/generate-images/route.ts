// ── /api/remake/generate-images — Replicate(PuLID-Flux) 슬라이드 이미지 NDJSON 스트림 ──
// 사진 + 비주얼 스타일 → 각 슬라이드별 이미지 생성. 사진 없으면 flux-dev 폴백.

import type { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const REPLICATE_URL = "https://api.replicate.com/v1/predictions";
const PULID_VERSION =
  "8baa7ef2255075b46f4d91cd238c21d31181b3e6a864463f967960bb0112525b";
// flux-dev (no face). pinned to a known public version for consistency.
const FLUX_DEV_VERSION =
  "843b6e3b4cdf779e1ef4f432a90a78aa2ca893a51f6e9fbf2b0e3e3c88c95df3";

const MAX_SLIDES = 8;

interface SlideIn {
  title?: string;
  body?: string;
}
interface ImagesBody {
  slides?: SlideIn[];
  userPhotoBase64?: string | null;
  visualStyle?: string;
}

function buildPrompt(slide: SlideIn, visualStyle: string): string {
  const title = (slide.title ?? "").trim();
  const body = (slide.body ?? "").trim();
  const styleHint = visualStyle?.trim() || "modern, cinematic, vibrant";
  return [
    `${title}. ${body}`.slice(0, 280),
    `style: ${styleHint}`,
    "9:16 vertical short-form video frame, high detail, professional",
  ].join(", ");
}

async function pollPrediction(
  id: string,
  apiKey: string,
): Promise<{ status: string; output?: unknown; error?: string }> {
  // 최대 ~120초 폴링 (2초 간격)
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(`${REPLICATE_URL}/${id}`, {
      headers: { Authorization: `Token ${apiKey}` },
    });
    if (!res.ok) {
      return { status: "failed", error: `폴링 HTTP ${res.status}` };
    }
    const data = (await res.json()) as {
      status: string;
      output?: unknown;
      error?: string;
    };
    if (
      data.status === "succeeded" ||
      data.status === "failed" ||
      data.status === "canceled"
    ) {
      return data;
    }
  }
  return { status: "failed", error: "타임아웃" };
}

async function runOne(
  slide: SlideIn,
  apiKey: string,
  userPhotoBase64: string | null,
  visualStyle: string,
): Promise<{ imageUrl?: string; error?: string; warning?: string }> {
  const prompt = buildPrompt(slide, visualStyle);
  const useFaceSwap = Boolean(userPhotoBase64);

  const input: Record<string, unknown> = useFaceSwap
    ? {
        prompt,
        main_face_image: userPhotoBase64, // base64 data URI
        width: 720,
        height: 1280,
        num_steps: 20,
        guidance_scale: 4,
      }
    : {
        prompt,
        width: 720,
        height: 1280,
        num_inference_steps: 20,
        guidance: 3.5,
      };

  const version = useFaceSwap ? PULID_VERSION : FLUX_DEV_VERSION;

  const res = await fetch(REPLICATE_URL, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ version, input }),
  });

  if (!res.ok) {
    const errJson = (await res.json().catch(() => ({}))) as {
      detail?: string;
      title?: string;
    };
    return {
      error: `Replicate 시작 실패: ${errJson.detail ?? errJson.title ?? `HTTP ${res.status}`}`,
    };
  }
  const created = (await res.json()) as { id?: string };
  if (!created.id) return { error: "Replicate prediction id 누락" };

  const final = await pollPrediction(created.id, apiKey);
  if (final.status !== "succeeded") {
    return { error: final.error ?? `상태: ${final.status}` };
  }
  const out = final.output;
  const imageUrl = Array.isArray(out)
    ? (out[0] as string | undefined)
    : typeof out === "string"
      ? out
      : undefined;
  if (!imageUrl) return { error: "출력 URL을 찾을 수 없습니다." };
  return useFaceSwap ? { imageUrl } : { imageUrl, warning: "no_face_swap" };
}

export async function POST(req: NextRequest) {
  let body: ImagesBody;
  try {
    body = (await req.json()) as ImagesBody;
  } catch {
    return Response.json({ error: "잘못된 JSON" }, { status: 400 });
  }

  const slides = (body.slides ?? []).slice(0, MAX_SLIDES);
  if (slides.length === 0) {
    return Response.json({ error: "slides 가 비어있습니다." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: replicateKey } = await (supabase.rpc as any)("get_my_api_key", {
    provider: "replicate",
  });
  if (!replicateKey || typeof replicateKey !== "string") {
    return Response.json(
      {
        error: "REPLICATE_KEY_MISSING",
        hint: "Replicate 키가 필요합니다. 설정 → API 키에서 등록하세요.",
      },
      { status: 400 },
    );
  }

  const photo =
    body.userPhotoBase64 && typeof body.userPhotoBase64 === "string"
      ? body.userPhotoBase64
      : null;
  const visualStyle = body.visualStyle ?? "";

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      // 순차 처리 — Replicate 동시 호출 부담 줄이고 NDJSON으로 진행상황 노출
      for (let i = 0; i < slides.length; i++) {
        const result = await runOne(
          slides[i],
          replicateKey,
          photo,
          visualStyle,
        ).catch((err: unknown) => ({
          error: err instanceof Error ? err.message : String(err),
        }));
        const line =
          JSON.stringify({ index: i, ...result }) + "\n";
        controller.enqueue(encoder.encode(line));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}

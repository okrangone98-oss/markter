"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  Film,
  Plus,
  Trash2,
  Download,
  Play,
  Square,
  Upload,
  Music,
  Mic,
  RefreshCw,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useTTSVideoStore } from "@/lib/stores/tts-video";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/* ── 타입 ── */
type Ratio = "9:16" | "1:1" | "16:9";
type CaptionStyle = "modern" | "kinetic" | "subtitle" | "title" | "none";
type Effect = "auto" | "zoom-in" | "zoom-out" | "pan-right" | "pan-left" | "none";
type Transition = "fade" | "slide" | "cut";

interface Slide {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  imageFile: File | null;
}

interface AudioFile {
  name: string;
  blob: Blob;
  url: string;
}

interface VideoState {
  ratio: Ratio;
  captionStyle: CaptionStyle;
  effect: Effect;
  transition: Transition;
  slideDuration: number;
  bgm: (AudioFile & { volume: number }) | null;
  bgmDuck: boolean;
  narration: AudioFile | null;
  slides: Slide[];
  rendered: { blob: Blob; url: string; ext: string } | null;
}

const PUTER_VOICES = [
  { id: "Seoyeon", name: "서연 (여성)" },
  { id: "InJoon", name: "인준 (남성, Azure/Puter)" },
  { id: "SunHi", name: "선희 (여성, Azure/Puter)" },
];

const ELEVENLABS_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (다국어)" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam (서술형)" },
  { id: "yoZ06aMxZJJ28mfd3POQ", name: "Sam (중간 음조)" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni (부드러운 남성)" },
];

/* ── 상수 ── */
const RATIO_DIM: Record<Ratio, { w: number; h: number }> = {
  "9:16": { w: 720, h: 1280 },
  "1:1":  { w: 1080, h: 1080 },
  "16:9": { w: 1280, h: 720 },
};

const CAPTION_OPTIONS: { value: CaptionStyle; label: string }[] = [
  { value: "modern", label: "모던 (그라디언트 박스)" },
  { value: "kinetic", label: "키네틱 (단어 강조)" },
  { value: "subtitle", label: "미니멀 자막" },
  { value: "title", label: "큰 제목 (헤드라인)" },
  { value: "none", label: "자막 없음" },
];

const EFFECT_OPTIONS: { value: Effect; label: string }[] = [
  { value: "auto", label: "Ken Burns (자동 줌/팬)" },
  { value: "zoom-in", label: "줌 인" },
  { value: "zoom-out", label: "줌 아웃" },
  { value: "pan-right", label: "우측 팬" },
  { value: "pan-left", label: "좌측 팬" },
  { value: "none", label: "정적 (효과 없음)" },
];

const TRANSITION_OPTIONS: { value: Transition; label: string }[] = [
  { value: "fade", label: "페이드" },
  { value: "slide", label: "슬라이드" },
  { value: "cut", label: "컷 (즉시)" },
];

const BG_GRADIENTS = [
  ["#0e1016", "#1c1f2a"],
  ["#0c2a2e", "#103a48"],
  ["#1a1124", "#371445"],
  ["#1d1208", "#3a1f0d"],
];

function uid() {
  return Math.random().toString(36).slice(2);
}

/* ══════════════════════════════════════════════════════════
   캔버스 렌더링 유틸
   ══════════════════════════════════════════════════════════ */
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function getKenBurns(effect: Effect, slideIdx: number, t: number) {
  const e = easeInOut(t);
  let scale = 1, dx = 0, dy = 0;
  let actual = effect;
  if (effect === "auto") {
    const modes: Effect[] = ["zoom-in", "zoom-out", "pan-right", "pan-left"];
    actual = modes[slideIdx % modes.length];
  }
  if (actual === "zoom-in")    scale = 1.0 + 0.12 * e;
  else if (actual === "zoom-out")  scale = 1.12 - 0.12 * e;
  else if (actual === "pan-right") { scale = 1.08; dx = -0.06 + 0.12 * e; }
  else if (actual === "pan-left")  { scale = 1.08; dx = 0.06 - 0.12 * e; }
  return { scale, dx, dy };
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawCaption(
  ctx: CanvasRenderingContext2D,
  slide: Slide,
  tNorm: number,
  style: CaptionStyle
) {
  if (style === "none") return;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const isVert = H >= W;
  const titleSize = isVert ? Math.round(W * 0.075) : Math.round(W * 0.05);
  const bodySize  = isVert ? Math.round(W * 0.05)  : Math.round(W * 0.034);
  const padX = W * 0.06;
  const maxW = W - padX * 2;
  const fadeIn = Math.min(1, tNorm * 4);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  if (style === "title") {
    ctx.font = `700 ${titleSize}px 'DM Sans', sans-serif`;
    ctx.fillStyle = `rgba(255,255,255,${fadeIn})`;
    const lines = wrapText(ctx, slide.title || slide.body || "", maxW);
    let y = H * 0.42;
    lines.forEach((l) => {
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 16;
      ctx.fillText(l, padX, y);
      y += titleSize * 1.2;
    });
    ctx.shadowBlur = 0;
  } else if (style === "subtitle") {
    ctx.font = `500 ${bodySize}px 'DM Sans', sans-serif`;
    const lines = wrapText(ctx, slide.body || slide.title || "", maxW);
    const totalH = lines.length * bodySize * 1.4;
    let y = H - totalH - H * 0.06;
    lines.forEach((l) => {
      ctx.fillStyle = `rgba(0,0,0,${fadeIn * 0.55})`;
      ctx.fillRect(padX - 8, y - bodySize, ctx.measureText(l).width + 16, bodySize * 1.3);
      ctx.fillStyle = `rgba(255,255,255,${fadeIn})`;
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 4;
      ctx.fillText(l, padX, y);
      y += bodySize * 1.4;
    });
    ctx.shadowBlur = 0;
  } else if (style === "modern" || style === "kinetic") {
    // 하단 그라디언트 박스
    const boxH = H * 0.35;
    const grad = ctx.createLinearGradient(0, H - boxH, 0, H);
    grad.addColorStop(0, `rgba(0,0,0,0)`);
    grad.addColorStop(0.4, `rgba(0,0,0,${0.7 * fadeIn})`);
    grad.addColorStop(1, `rgba(0,0,0,${0.85 * fadeIn})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, H - boxH, W, boxH);

    let y = H - H * 0.05;
    if (slide.body) {
      ctx.font = `400 ${bodySize}px 'DM Sans', sans-serif`;
      const lines = wrapText(ctx, slide.body, maxW);
      lines.reverse().forEach((l) => {
        ctx.fillStyle = `rgba(220,220,220,${fadeIn})`;
        ctx.fillText(l, padX, y);
        y -= bodySize * 1.4;
      });
      y -= bodySize * 0.4;
    }
    if (slide.title) {
      if (style === "kinetic") {
        // 시안 강조 첫 단어
        const words = slide.title.split(" ");
        let x = padX;
        ctx.font = `700 ${titleSize}px 'DM Sans', sans-serif`;
        words.forEach((w, i) => {
          ctx.fillStyle = i === 0
            ? `rgba(0,229,200,${fadeIn})`
            : `rgba(255,255,255,${fadeIn})`;
          ctx.fillText(w + " ", x, y);
          x += ctx.measureText(w + " ").width;
        });
      } else {
        ctx.font = `700 ${titleSize}px 'DM Sans', sans-serif`;
        ctx.fillStyle = `rgba(255,255,255,${fadeIn})`;
        ctx.fillText(slide.title, padX, y);
      }
    }
  }
}

function drawSlide(
  ctx: CanvasRenderingContext2D,
  slide: Slide,
  slideIdx: number,
  tNorm: number,
  effect: Effect,
  captionStyle: CaptionStyle,
  imgEl: HTMLImageElement | null,
  transAlpha: number
) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;

  ctx.save();
  ctx.fillStyle = "#08090c";
  ctx.fillRect(0, 0, W, H);

  if (imgEl) {
    const { scale, dx, dy } = getKenBurns(effect, slideIdx, tNorm);
    const ir = imgEl.width / imgEl.height;
    const cr = W / H;
    let dw, dh;
    if (ir > cr) { dh = H * scale; dw = dh * ir; }
    else         { dw = W * scale; dh = dw / ir; }
    const ox = (W - dw) / 2 + dx * W;
    const oy = (H - dh) / 2 + dy * H;
    ctx.drawImage(imgEl, ox, oy, dw, dh);
    const over = ctx.createLinearGradient(0, H * 0.45, 0, H);
    over.addColorStop(0, "rgba(0,0,0,0)");
    over.addColorStop(1, "rgba(0,0,0,0.65)");
    ctx.fillStyle = over;
    ctx.fillRect(0, 0, W, H);
  } else {
    const c = BG_GRADIENTS[slideIdx % BG_GRADIENTS.length];
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, c[0]);
    grad.addColorStop(1, c[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(0,229,200,0.08)";
    ctx.beginPath();
    ctx.arc(W * 0.85, H * 0.15, W * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCaption(ctx, slide, tNorm, captionStyle);

  if (transAlpha > 0) {
    ctx.fillStyle = `rgba(0,0,0,${transAlpha})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

/* ══════════════════════════════════════════════════════════
   Video Maker 컴포넌트
   ══════════════════════════════════════════════════════════ */
export default function VideoPage() {
  const { ttsResult, pendingSlides, setPendingSlides } = useTTSVideoStore();

  const [state, setState] = useState<VideoState>({
    ratio: "9:16",
    captionStyle: "modern",
    effect: "auto",
    transition: "fade",
    slideDuration: 3.5,
    bgm: null,
    bgmDuck: true,
    narration: null,
    slides: [
      { id: uid(), title: "첫 번째 슬라이드", body: "여기에 자막이 표시됩니다.", imageUrl: null, imageFile: null },
    ],
    rendered: null,
  });

  const [previewIdx, setPreviewIdx] = useState(0);
  const [previewing, setPreviewing] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [toast, setToast] = useState("");
  const [generatingTTS, setGeneratingTTS] = useState(false);
  const [ttsEngine, setTtsEngine] = useState<"puter" | "elevenlabs">("puter");
  const [ttsVoice, setTtsVoice] = useState(PUTER_VOICES[0].id);
  const [ttsApiKey, setTtsApiKey] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const previewRafRef = useRef<number>(0);
  const previewAbortRef = useRef<boolean>(false);
  const previewStartRef = useRef<number>(0);

  /* TTS 결과 자동 연결 */
  useEffect(() => {
    if (ttsResult) {
      setState((s) => ({ ...s, narration: ttsResult }));
    }
  }, [ttsResult]);

  /* Puter SDK 동적 로드 */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("puter-sdk")) return;
    const s = document.createElement("script");
    s.id = "puter-sdk";
    s.src = "https://js.puter.com/v2/";
    document.head.appendChild(s);
  }, []);

  /* Studio → Video: pendingSlides 자동 임포트 (한 번만 소비 후 초기화) */
  useEffect(() => {
    if (pendingSlides && pendingSlides.length > 0) {
      const newSlides = pendingSlides.map((s) => ({
        id: uid(),
        title: s.title,
        body: s.body,
        imageUrl: s.imageUrl ?? null, // /remake 등에서 미리 생성된 이미지 자동 적용
        imageFile: null,
      }));
      setState((s) => ({ ...s, slides: newSlides }));
      setPendingSlides(null); // 1회만 소비
    }
  }, [pendingSlides, setPendingSlides]);

  /* 슬라이드 0번 프레임 초기 렌더 */
  useEffect(() => {
    drawFrame(0, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.slides, state.ratio, state.captionStyle, state.effect]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function loadImg(src: string): Promise<HTMLImageElement | null> {
    if (!src) return null;
    if (imgCacheRef.current.has(src)) return imgCacheRef.current.get(src)!;
    return new Promise((res) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => { imgCacheRef.current.set(src, img); res(img); };
      img.onerror = () => res(null);
      img.src = src;
    });
  }

  async function drawFrame(slideIdx: number, tNorm: number, transAlpha = 0) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = state.slides[slideIdx];
    if (!s) return;
    const img = s.imageUrl ? await loadImg(s.imageUrl) : null;
    drawSlide(ctx, s, slideIdx, tNorm, state.effect, state.captionStyle, img, transAlpha);
  }

  /* ── 프리뷰 ── */
  async function playPreview() {
    if (state.slides.length === 0) return;
    setPreviewing(true);
    previewAbortRef.current = false;

    const dur = state.slideDuration * 1000;
    const transDur = state.transition === "cut" ? 0 : 400;

    for (let i = 0; i < state.slides.length; i++) {
      if (previewAbortRef.current) break;
      setPreviewIdx(i);
      const start = performance.now();

      await new Promise<void>((res) => {
        function frame(now: number) {
          if (previewAbortRef.current) { res(); return; }
          const elapsed = now - start;
          const tNorm = Math.min(elapsed / dur, 1);
          let transAlpha = 0;
          if (state.transition === "fade") {
            if (elapsed < transDur / 2) transAlpha = 1 - elapsed / (transDur / 2);
            if (elapsed > dur - transDur) transAlpha = (elapsed - (dur - transDur)) / transDur;
          }
          drawFrame(i, tNorm, transAlpha);
          if (elapsed < dur) previewRafRef.current = requestAnimationFrame(frame);
          else res();
        }
        previewRafRef.current = requestAnimationFrame(frame);
      });
    }
    setPreviewing(false);
  }

  function stopPreview() {
    previewAbortRef.current = true;
    cancelAnimationFrame(previewRafRef.current);
    setPreviewing(false);
    drawFrame(0, 0);
  }

  /* ── 슬라이드 관리 ── */
  function addSlide() {
    setState((s) => ({
      ...s,
      slides: [
        ...s.slides,
        { id: uid(), title: "", body: "", imageUrl: null, imageFile: null },
      ],
    }));
  }

  function removeSlide(id: string) {
    setState((s) => ({ ...s, slides: s.slides.filter((sl) => sl.id !== id) }));
  }

  function updateSlide(id: string, patch: Partial<Slide>) {
    setState((s) => ({
      ...s,
      slides: s.slides.map((sl) => (sl.id === id ? { ...sl, ...patch } : sl)),
    }));
  }

  function onSlideImage(id: string, file: File) {
    const url = URL.createObjectURL(file);
    imgCacheRef.current.delete(url);
    updateSlide(id, { imageFile: file, imageUrl: url });
  }

  async function generateSlideImage(id: string) {
    const sl = state.slides.find((s) => s.id === id);
    if (!sl) return;
    const baseText = (sl.title + " " + sl.body).trim();
    if (!baseText) { showToast("⚠ 제목/본문을 먼저 입력하세요"); return; }
    
    // 핵심 컨셉을 담은 프롬프트로 변환
    const prompt = `Cinematic concept art representing the core meaning of this scene: "${baseText}"`;
    
    const w = window as unknown as { puter?: { ai?: { txt2img?: (p: string, o: Record<string, unknown>) => Promise<{ src: string }> } } };
    if (!w.puter?.ai?.txt2img) { showToast("⚠ Puter SDK 미로드 — 잠시 후 다시 시도"); return; }
    showToast("🎨 이미지 생성 중...");
    try {
      const dim = RATIO_DIM[state.ratio];
      const img = await w.puter.ai.txt2img(prompt + ", high quality, detailed, masterpiece", {
        model: "flux-schnell",
        width: dim.w,
        height: dim.h,
        testMode: false,
      });
      updateSlide(id, { imageUrl: img.src, imageFile: null });
      showToast("✓ 이미지 생성 완료");
    } catch (e: unknown) {
      showToast("⚠ 이미지 생성 실패: " + ((e as Error).message || ""));
    }
  }

  function onBgmFile(file: File) {
    const url = URL.createObjectURL(file);
    setState((s) => ({
      ...s,
      bgm: { name: file.name, blob: file, url, volume: 0.25 },
    }));
  }

  function onNarrationFile(file: File) {
    const url = URL.createObjectURL(file);
    setState((s) => ({
      ...s,
      narration: { name: file.name, blob: file, url },
    }));
  }

  async function generateSlideTTS() {
    const text = state.slides.map(s => s.title + " " + s.body).join(" ... ").trim();
    if (!text || text === " ... ") {
      showToast("⚠ 슬라이드에 텍스트가 없습니다.");
      return;
    }
    setGeneratingTTS(true);
    showToast(`음성 생성 중 (${ttsEngine === "puter" ? "Puter 무료" : "ElevenLabs"})...`);
    try {
      let blob: Blob;
      if (ttsEngine === "puter") {
        const w = window as any;
        if (!w.puter?.ai?.txt2speech) throw new Error("Puter SDK가 아직 준비되지 않았습니다. 새로고침 해주세요.");
        
        const audio = await w.puter.ai.txt2speech(text, { voice: ttsVoice, engine: "neural" });
        const src = audio.src || audio.currentSrc;
        if (!src) throw new Error("오디오 소스를 받을 수 없습니다.");
        
        const resp = await fetch(src);
        blob = await resp.blob();
      } else {
        if (!ttsApiKey.trim()) throw new Error("ElevenLabs API 키가 필요합니다.");
        const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ttsVoice}`, {
          method: "POST",
          headers: {
            "xi-api-key": ttsApiKey.trim(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
          }),
        });
        if (!resp.ok) {
          const err = await resp.text();
          throw new Error("ElevenLabs 생성 실패");
        }
        blob = await resp.blob();
      }
      
      const url = URL.createObjectURL(blob);
      setState((s) => ({
        ...s,
        narration: { name: `자동생성_내레이션_${ttsEngine}.mp3`, blob, url },
      }));
      showToast("✓ 슬라이드 내레이션 자동 생성 완료!");
    } catch (e: any) {
      showToast("⚠ 음성 생성 실패: " + e.message);
    } finally {
      setGeneratingTTS(false);
    }
  }

  /* ── WebM/MP4 렌더링 ── */
  async function renderVideo(format: "webm" | "mp4") {
    if (state.slides.length === 0) { showToast("⚠ 슬라이드를 추가하세요"); return; }
    setRendering(true);
    setProgress(0);
    setProgressLabel("캔버스 준비 중...");

    try {
      const canvas = canvasRef.current!;
      const stream = canvas.captureStream(30);

      // 오디오 믹싱
      const audioCtx = new AudioContext();
      const dest = audioCtx.createMediaStreamDestination();

      if (state.narration) {
        const arrBuf = await state.narration.blob.arrayBuffer();
        const decoded = await audioCtx.decodeAudioData(arrBuf);
        const src = audioCtx.createBufferSource();
        src.buffer = decoded;
        src.connect(dest);
        src.start(0);
      }

      if (state.bgm) {
        const arrBuf = await state.bgm.blob.arrayBuffer();
        const decoded = await audioCtx.decodeAudioData(arrBuf);
        const bgmSrc = audioCtx.createBufferSource();
        bgmSrc.buffer = decoded;
        bgmSrc.loop = true;
        const gain = audioCtx.createGain();
        gain.gain.value = state.bgm.volume;
        bgmSrc.connect(gain);
        gain.connect(dest);
        bgmSrc.start(0);
      }

      // 오디오 트랙 추가
      dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));

      const mimeType = format === "webm"
        ? (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
            ? "video/webm;codecs=vp9"
            : "video/webm")
        : "video/webm";

      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.start(100);

      const totalDur = state.slides.length * state.slideDuration;
      const transDur = state.transition === "cut" ? 0 : 0.4;
      const renderStart = performance.now();

      for (let i = 0; i < state.slides.length; i++) {
        const slideStart = performance.now();
        const slideDurMs = state.slideDuration * 1000;

        await new Promise<void>((res) => {
          function frame() {
            const elapsed = (performance.now() - slideStart) / 1000;
            const tNorm = Math.min(elapsed / state.slideDuration, 1);
            let transAlpha = 0;
            if (state.transition === "fade") {
              if (elapsed < transDur / 2) transAlpha = 1 - elapsed / (transDur / 2);
              if (elapsed > state.slideDuration - transDur) {
                transAlpha = (elapsed - (state.slideDuration - transDur)) / transDur;
              }
            }
            const sl = state.slides[i];
            const img = sl.imageUrl ? imgCacheRef.current.get(sl.imageUrl) ?? null : null;
            const ctx2 = canvas.getContext("2d")!;
            drawSlide(ctx2, sl, i, tNorm, state.effect, state.captionStyle, img, transAlpha);

            const totalElapsed = (performance.now() - renderStart) / 1000;
            setProgress(Math.round((totalElapsed / totalDur) * 100));
            setProgressLabel(`렌더링 중... ${i + 1}/${state.slides.length} 슬라이드`);

            if (elapsed * 1000 < slideDurMs) requestAnimationFrame(frame);
            else res();
          }
          requestAnimationFrame(frame);
        });
      }

      recorder.stop();
      await new Promise<void>((res) => { recorder.onstop = () => res(); });

      const webmBlob = new Blob(chunks, { type: "video/webm" });

      if (format === "mp4") {
        setProgressLabel("MP4 변환 중 (ffmpeg.wasm)...");
        setProgress(90);
        try {
          const mp4Blob = await convertToMp4(webmBlob, setProgressLabel);
          finalizeRender(mp4Blob, "mp4");
        } catch {
          showToast("⚠ MP4 변환 실패 — WebM으로 저장됩니다");
          finalizeRender(webmBlob, "webm");
        }
      } else {
        finalizeRender(webmBlob, "webm");
      }
    } catch (e: unknown) {
      showToast("⚠ 렌더링 실패: " + ((e as Error).message || ""));
    } finally {
      setRendering(false);
      setProgress(0);
      setProgressLabel("");
    }
  }

  function finalizeRender(blob: Blob, ext: string) {
    if (state.rendered?.url) URL.revokeObjectURL(state.rendered.url);
    const url = URL.createObjectURL(blob);
    setState((s) => ({ ...s, rendered: { blob, url, ext } }));
    showToast(`✓ ${ext.toUpperCase()} 렌더링 완료`);
    setProgress(100);
  }

  function downloadRendered() {
    if (!state.rendered) return;
    const a = document.createElement("a");
    a.href = state.rendered.url;
    a.download = `marketing-brain-video-${Date.now()}.${state.rendered.ext}`;
    a.click();
  }

  const totalDuration = state.slides.length * state.slideDuration;

  /* ── 렌더 ── */
  return (
    <div className="mx-auto max-w-5xl py-4">
      {/* 헤더 */}
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 ring-1 ring-[var(--color-primary)]/30">
          <Film className="h-6 w-6 text-[var(--color-primary)]" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            Layer 2 · Generation
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            숏폼 영상 메이커
          </h1>
          <p className="text-sm text-slate-400">
            슬라이드 + Ken Burns + 자막 + 내레이션 → MP4 / WebM
          </p>
        </div>
      </div>

      {toast && (
        <div className="mb-4 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200">
          {toast}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* 좌측: 설정 */}
        <div className="flex flex-col gap-4">
          {/* 비율 / 자막 스타일 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">기본 설정</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>영상 비율</Label>
                  <div className="flex gap-1.5">
                    {(["9:16", "1:1", "16:9"] as Ratio[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          const dim = RATIO_DIM[r];
                          const canvas = canvasRef.current;
                          if (canvas) { canvas.width = dim.w; canvas.height = dim.h; }
                          setState((s) => ({ ...s, ratio: r }));
                        }}
                        className={cn(
                          "flex-1 rounded border px-2 py-1.5 text-[11px] font-medium transition-colors",
                          state.ratio === r
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                            : "border-slate-700 text-slate-400 hover:border-slate-600"
                        )}
                      >
                        {r === "9:16" ? "▮ 9:16" : r === "1:1" ? "■ 1:1" : "▬ 16:9"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>자막 스타일</Label>
                  <select
                    value={state.captionStyle}
                    onChange={(e) => setState((s) => ({ ...s, captionStyle: e.target.value as CaptionStyle }))}
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                  >
                    {CAPTION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>이미지 효과</Label>
                  <select
                    value={state.effect}
                    onChange={(e) => setState((s) => ({ ...s, effect: e.target.value as Effect }))}
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                  >
                    {EFFECT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>트랜지션</Label>
                  <select
                    value={state.transition}
                    onChange={(e) => setState((s) => ({ ...s, transition: e.target.value as Transition }))}
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                  >
                    {TRANSITION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>슬라이드 길이 (초)</Label>
                  <Input
                    type="number"
                    min={1.5}
                    max={10}
                    step={0.5}
                    value={state.slideDuration}
                    onChange={(e) =>
                      setState((s) => ({ ...s, slideDuration: parseFloat(e.target.value) || 3.5 }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 오디오 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">오디오</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* BGM */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5">
                    <Music className="h-3.5 w-3.5" /> 배경 음악 (BGM)
                  </Label>
                  <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-slate-400">
                    <input
                      type="checkbox"
                      checked={state.bgmDuck}
                      onChange={(e) => setState((s) => ({ ...s, bgmDuck: e.target.checked }))}
                      className="accent-[var(--color-primary)]"
                    />
                    내레이션 시 자동 감쇠
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => { if (e.target.files?.[0]) onBgmFile(e.target.files[0]); }}
                    />
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-600 cursor-pointer">
                      <Upload className="h-3.5 w-3.5" /> 파일 선택
                    </span>
                  </label>
                  <span className="flex-1 truncate text-xs text-slate-500">
                    {state.bgm ? state.bgm.name : "선택된 파일 없음"}
                  </span>
                  {state.bgm && (
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      볼륨
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={state.bgm.volume}
                        onChange={(e) =>
                          setState((s) => ({
                            ...s,
                            bgm: s.bgm ? { ...s.bgm, volume: parseFloat(e.target.value) } : null,
                          }))
                        }
                        className="w-20 accent-[var(--color-primary)]"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* 내레이션 */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Mic className="h-3.5 w-3.5" /> 내레이션 (TTS 음성)
                </Label>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => { if (e.target.files?.[0]) onNarrationFile(e.target.files[0]); }}
                      />
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-600 cursor-pointer">
                        <Upload className="h-3.5 w-3.5" /> 파일 업로드
                      </span>
                    </label>
                    <span className="flex-1 truncate text-xs text-slate-500 min-w-[120px]">
                      {state.narration
                        ? state.narration.name
                        : ttsResult
                        ? "TTS 페이지 음성 연결됨 ✓"
                        : "없음"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-800 bg-slate-900/50 p-2">
                    <select
                      value={ttsEngine}
                      onChange={(e) => {
                        const eng = e.target.value as any;
                        setTtsEngine(eng);
                        setTtsVoice(eng === "puter" ? PUTER_VOICES[0].id : ELEVENLABS_VOICES[0].id);
                      }}
                      className="h-7 rounded border border-slate-700 bg-slate-800 px-2 text-[11px] text-slate-200 outline-none focus:border-slate-500"
                    >
                      <option value="puter">Puter (무료)</option>
                      <option value="elevenlabs">ElevenLabs</option>
                    </select>
                    
                    <select
                      value={ttsVoice}
                      onChange={(e) => setTtsVoice(e.target.value)}
                      className="h-7 max-w-[140px] truncate rounded border border-slate-700 bg-slate-800 px-2 text-[11px] text-slate-200 outline-none focus:border-slate-500"
                    >
                      {(ttsEngine === "puter" ? PUTER_VOICES : ELEVENLABS_VOICES).map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>

                    {ttsEngine === "elevenlabs" && (
                      <input
                        type="password"
                        placeholder="API Key"
                        value={ttsApiKey}
                        onChange={(e) => setTtsApiKey(e.target.value)}
                        className="h-7 w-20 rounded border border-slate-700 bg-slate-800 px-2 text-[11px] text-slate-200 outline-none focus:border-slate-500"
                      />
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 hover:text-amber-300 text-amber-400 ml-auto"
                      onClick={generateSlideTTS}
                      disabled={generatingTTS}
                    >
                      <Mic className="h-3 w-3 mr-1" />
                      {generatingTTS ? "생성 중..." : "자동 생성"}
                    </Button>
                  </div>
                </div>
                {!ttsResult && !state.narration && (
                  <p className="text-[11px] text-slate-600">
                    💡 다른 엔진(ElevenLabs 등)이 필요하면 <b>AI 음성 합성(TTS)</b> 메뉴에서 만들 수 있습니다.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 슬라이드 편집 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  슬라이드{" "}
                  <span className="text-slate-500 font-normal">
                    {state.slides.length}장 · 약 {totalDuration.toFixed(1)}초
                  </span>
                </CardTitle>
                <Button variant="secondary" size="sm" onClick={addSlide}>
                  <Plus className="h-4 w-4" /> 슬라이드 추가
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {state.slides.map((sl, idx) => (
                  <SlideEditor
                    key={sl.id}
                    slide={sl}
                    index={idx}
                    onUpdate={(patch) => updateSlide(sl.id, patch)}
                    onRemove={() => removeSlide(sl.id)}
                    onImageFile={(f) => onSlideImage(sl.id, f)}
                    onGenerateImage={() => generateSlideImage(sl.id)}
                    isPreview={previewIdx === idx && previewing}
                  />
                ))}
                {state.slides.length === 0 && (
                  <p className="py-4 text-center text-sm text-slate-500">
                    슬라이드가 없습니다. 추가 버튼을 눌러 시작하세요.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 렌더 버튼 */}
          <div className="flex gap-3">
            <Button
              onClick={() => renderVideo("webm")}
              disabled={rendering || state.slides.length === 0}
              size="lg"
              className="flex-1 font-semibold"
            >
              {rendering ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  렌더링 중...
                </span>
              ) : (
                "🎬 WebM 렌더 (빠름)"
              )}
            </Button>
            <Button
              onClick={() => renderVideo("mp4")}
              disabled={rendering || state.slides.length === 0}
              size="lg"
              variant="secondary"
              className="flex-1 font-semibold border-[var(--color-purple)]/40 bg-[var(--color-purple)]/10 hover:bg-[var(--color-purple)]/20 text-[var(--color-purple)]"
            >
              🎞 MP4 렌더 (호환성)
            </Button>
          </div>

          {/* 진행 */}
          {rendering && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400">{progressLabel}</p>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* 완성 영상 */}
          {state.rendered && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">완성된 영상</CardTitle>
                  <Button variant="default" size="sm" onClick={downloadRendered}>
                    <Download className="h-4 w-4" /> 다운로드
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <video
                  controls
                  src={state.rendered.url}
                  className="w-full rounded-lg bg-black"
                  style={{ maxHeight: 480 }}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* 우측: 캔버스 미리보기 */}
        <div className="flex flex-col gap-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-3">
                <div className="w-full overflow-hidden rounded-lg border border-slate-800 bg-black">
                  <canvas
                    ref={canvasRef}
                    width={RATIO_DIM[state.ratio].w}
                    height={RATIO_DIM[state.ratio].h}
                    className="w-full"
                    style={{ aspectRatio: `${RATIO_DIM[state.ratio].w} / ${RATIO_DIM[state.ratio].h}` }}
                  />
                </div>
                <div className="flex gap-2 w-full">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={previewing ? stopPreview : playPreview}
                    disabled={state.slides.length === 0}
                  >
                    {previewing ? (
                      <><Square className="h-3.5 w-3.5" /> 정지</>
                    ) : (
                      <><Play className="h-3.5 w-3.5" /> 미리보기 재생</>
                    )}
                  </Button>
                </div>
                {previewing && (
                  <p className="text-[11px] text-slate-500">
                    슬라이드 {previewIdx + 1} / {state.slides.length}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 슬라이드 썸네일 목록 */}
          <div className="flex flex-col gap-2">
            {state.slides.map((sl, idx) => (
              <button
                key={sl.id}
                onClick={() => { setPreviewIdx(idx); drawFrame(idx, 0); }}
                className={cn(
                  "flex items-center gap-2 rounded-lg border p-2 text-left transition-colors",
                  previewIdx === idx && !previewing
                    ? "border-[var(--color-primary)]/50 bg-[var(--color-primary)]/5"
                    : "border-slate-800 hover:border-slate-700"
                )}
              >
                <div
                  className="h-12 w-9 shrink-0 rounded overflow-hidden border border-slate-700"
                  style={sl.imageUrl ? { backgroundImage: `url(${sl.imageUrl})`, backgroundSize: "cover" } : { background: BG_GRADIENTS[idx % BG_GRADIENTS.length].join(", ") }}
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-200">
                    {sl.title || `슬라이드 ${idx + 1}`}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">{sl.body}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 슬라이드 에디터 서브컴포넌트 ── */
interface SlideEditorProps {
  slide: Slide;
  index: number;
  onUpdate: (patch: Partial<Slide>) => void;
  onRemove: () => void;
  onImageFile: (f: File) => void;
  onGenerateImage: () => void;
  isPreview: boolean;
}

function SlideEditor({
  slide,
  index,
  onUpdate,
  onRemove,
  onImageFile,
  onGenerateImage,
  isPreview,
}: SlideEditorProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border p-3 transition-colors",
        isPreview ? "border-[var(--color-primary)]/50 bg-[var(--color-primary)]/5" : "border-slate-800 bg-slate-900/50"
      )}
    >
      {/* 썸네일 */}
      <label className="relative h-20 w-16 shrink-0 cursor-pointer overflow-hidden rounded-md border border-slate-700">
        <div
          className="h-full w-full"
          style={
            slide.imageUrl
              ? { backgroundImage: `url(${slide.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : { background: `linear-gradient(135deg, ${BG_GRADIENTS[index % BG_GRADIENTS.length].join(", ")})` }
          }
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity text-[9px] text-white font-medium">
          이미지 변경
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) onImageFile(e.target.files[0]); }}
        />
      </label>

      {/* 필드 */}
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="shrink-0 text-[11px] text-slate-600">#{index + 1}</span>
          <Input
            value={slide.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="제목 (헤드라인)"
            className="h-7 text-xs"
          />
        </div>
        <Textarea
          value={slide.body}
          onChange={(e) => onUpdate({ body: e.target.value })}
          placeholder="본문 (자막에 사용)"
          rows={2}
          className="resize-none text-xs"
        />
      </div>

      {/* 액션 */}
      <div className="flex flex-col justify-between">
        <button
          onClick={onGenerateImage}
          className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-[var(--color-primary)] hover:border-[var(--color-primary)]/50 transition-colors"
          title="Puter AI 이미지 생성"
        >
          🎨 AI
        </button>
        <button
          onClick={onRemove}
          className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-500 hover:text-red-400 transition-colors"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

/* ── ffmpeg.wasm MP4 변환 (동적 로드) ── */
async function convertToMp4(
  webmBlob: Blob,
  onProgress: (msg: string) => void
): Promise<Blob> {
  onProgress("ffmpeg.wasm 로드 중...");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (!w.FFmpeg) {
    await new Promise<void>((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js";
      s.onload = () => res();
      s.onerror = () => rej(new Error("ffmpeg.wasm 로드 실패"));
      document.head.appendChild(s);
    });
  }

  const { FFmpeg } = w;
  const ffmpeg = new FFmpeg();
  await ffmpeg.load({
    coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
  });

  onProgress("WebM → MP4 인코딩 중...");
  const inArr = new Uint8Array(await webmBlob.arrayBuffer());
  await ffmpeg.writeFile("input.webm", inArr);
  await ffmpeg.exec(["-i", "input.webm", "-c:v", "libx264", "-c:a", "aac", "-movflags", "+faststart", "output.mp4"]);
  const outArr = await ffmpeg.readFile("output.mp4") as Uint8Array;
  return new Blob([outArr.buffer as ArrayBuffer], { type: "video/mp4" });
}

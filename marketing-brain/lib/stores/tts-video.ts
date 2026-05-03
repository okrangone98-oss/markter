// 페이지 간 핸드오프 상태 (TTS↔Video, Studio→Video)
// 영속 저장 X — 메모리에만 유지 (페이지 새로고침 시 초기화).
import { create } from "zustand";

import type { ParsedSlide } from "@/lib/video/parse-script";

interface TTSResult {
  blob: Blob;
  url: string;
  name: string;
}

interface TTSVideoStore {
  // TTS → Video 자동 연결
  ttsResult: TTSResult | null;
  setTTSResult: (result: TTSResult | null) => void;

  // Studio → Video 슬라이드 자동 채우기
  pendingSlides: ParsedSlide[] | null;
  setPendingSlides: (slides: ParsedSlide[] | null) => void;

  // Studio → TTS 텍스트 자동 채우기
  pendingTtsText: string | null;
  setPendingTtsText: (text: string | null) => void;
}

export const useTTSVideoStore = create<TTSVideoStore>((set) => ({
  ttsResult: null,
  setTTSResult: (result) => set({ ttsResult: result }),

  pendingSlides: null,
  setPendingSlides: (slides) => set({ pendingSlides: slides }),

  pendingTtsText: null,
  setPendingTtsText: (text) => set({ pendingTtsText: text }),
}));

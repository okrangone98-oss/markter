import { create } from "zustand";

interface TTSResult {
  blob: Blob;
  url: string;
  name: string;
}

interface TTSVideoStore {
  ttsResult: TTSResult | null;
  setTTSResult: (result: TTSResult | null) => void;
}

export const useTTSVideoStore = create<TTSVideoStore>((set) => ({
  ttsResult: null,
  setTTSResult: (result) => set({ ttsResult: result }),
}));

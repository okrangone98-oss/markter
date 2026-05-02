// 바이럴 후킹 공식 5가지 — Studio 의 주제 입력에 [HOOK:이름] 태그로 삽입
// buildPrompt 가 자동으로 system 프롬프트에 후킹 적용 지침 추가.

export type HookId = "paradox" | "number" | "confession" | "question" | "contrast";

export interface ViralHook {
  id: HookId;
  name: string;
  desc: string;
  examples: string[];
}

export const VIRAL_HOOKS: ViralHook[] = [
  {
    id: "paradox",
    name: "역설형",
    desc: "A인데 B다 — 모순으로 호기심 유발",
    examples: [
      "양양에 6년 살았는데 아직도 길 잃는다.",
      "AI를 매일 쓰는데 책은 종이로 본다.",
    ],
  },
  {
    id: "number",
    name: "숫자형",
    desc: "구체 숫자가 시선 멈춤",
    examples: [
      "60일 동안 매일 쓴 글 중 살아남은 건 7개.",
      "서핑 3시간, 글 10분. 비율이 인생을 정한다.",
    ],
  },
  {
    id: "confession",
    name: "고백형",
    desc: "약점·실패 노출 — 진정성",
    examples: [
      "솔직히 말하면, 어제 또 미뤘다.",
      "이 글은 아직 결론이 없다.",
    ],
  },
  {
    id: "question",
    name: "질문형",
    desc: "답이 안 나오는 질문 — 댓글 유도",
    examples: [
      "당신은 마지막으로 언제 멈춰봤나요?",
      "느림이 게으름과 다른 건 뭘까.",
    ],
  },
  {
    id: "contrast",
    name: "대비형",
    desc: "기대 vs 현실 / 과거 vs 현재",
    examples: [
      "도시에선 1시간이 짧고, 양양에선 1시간이 길다.",
      "10년 전엔 빠른 게 좋았다. 지금은 느린 게 좋다.",
    ],
  },
];

// 이름 → 설명 빠른 조회 (buildPrompt 에서 사용)
export const HOOK_DESC_BY_NAME: Record<string, string> = Object.fromEntries(
  VIRAL_HOOKS.map((h) => [h.name, h.desc])
);

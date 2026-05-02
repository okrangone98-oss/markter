// 콘텐츠 스튜디오 — Layer 2: Generation (스텁)
import { WandSparkles } from "lucide-react";

import { PageStub } from "@/components/layout/page-stub";

export default function StudioPage() {
  return (
    <PageStub
      title="콘텐츠 스튜디오 (준비 중)"
      description="텍스트·이미지·영상 콘텐츠를 통합 캠페인으로 한 번에 생성"
      layerLabel="Layer 2 · Generation"
      icon={WandSparkles}
      upcoming={[
        "20+ 콘텐츠 유형 (블로그·이메일·SNS·광고 카피)",
        "위키/페르소나/경쟁사 자동 컨텍스트 주입 토글",
        "다중 변형 생성 (A/B/C 동시 출력)",
        "자동 개선 루프 — LLM 판정자가 5축 평가·재생성",
        "이전 성공 패턴 few-shot 자동 첨부",
      ]}
    />
  );
}

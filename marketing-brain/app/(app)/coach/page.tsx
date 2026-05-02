// 마케터 코치 (스텁) — Layer 3: Intelligence
import { Sparkles } from "lucide-react";

import { PageStub } from "@/components/layout/page-stub";

export default function CoachPage() {
  return (
    <PageStub
      title="마케터 코치 (준비 중)"
      description="당신의 마케팅 약점을 진단하고 매주 도전 과제를 제안"
      layerLabel="Layer 3 · Intelligence"
      icon={Sparkles}
      upcoming={[
        "주간 콘텐츠 작성 패턴 분석",
        "약점 진단 (도입부 후킹·CTA 명확성·데이터 근거 등)",
        "주간 도전 과제 자동 제안",
        "5축 점수 성장 그래프 시각화",
        "마케팅 학습 자료 큐레이션",
      ]}
    />
  );
}

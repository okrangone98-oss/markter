// 인사이트 — 성과 분석 (스텁)
import { TrendingUp } from "lucide-react";

import { PageStub } from "@/components/layout/page-stub";

export default function InsightsPage() {
  return (
    <PageStub
      title="인사이트 (준비 중)"
      description="실제 발행 콘텐츠의 성과를 추적하고 성공 패턴을 추출"
      layerLabel="Layer 3 · Intelligence"
      icon={TrendingUp}
      upcoming={[
        "발행 콘텐츠 URL 입력 → 자동/수동 메트릭 수집",
        "잘 먹힌 패턴 추출 → Winning Patterns 위키 자동 업데이트",
        "콘텐츠 유형별 성과 비교 차트",
        "다음 콘텐츠 추천 (성공 사례 few-shot 기반)",
      ]}
    />
  );
}

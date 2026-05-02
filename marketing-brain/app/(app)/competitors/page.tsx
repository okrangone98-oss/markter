// 경쟁사 분석 (스텁)
import { Swords } from "lucide-react";

import { PageStub } from "@/components/layout/page-stub";

export default function CompetitorsPage() {
  return (
    <PageStub
      title="경쟁사 분석 (준비 중)"
      description="경쟁 브랜드 콘텐츠를 자동 수집·요약하고 차별화 전략 제안"
      layerLabel="Layer 1 · Knowledge"
      icon={Swords}
      upcoming={[
        "경쟁사 URL 등록 → 주기적 콘텐츠 자동 수집",
        "최근 콘텐츠·톤·전략 요약 대시보드",
        "우리 브랜드와의 차별화 포인트 자동 제안",
      ]}
    />
  );
}

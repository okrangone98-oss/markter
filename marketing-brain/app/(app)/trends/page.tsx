// 트렌드 레이더 (스텁)
import { Radar } from "lucide-react";

import { PageStub } from "@/components/layout/page-stub";

export default function TrendsPage() {
  return (
    <PageStub
      title="트렌드 레이더 (준비 중)"
      description="네이버 데이터랩 · X · 인스타그램 해시태그를 통합 모니터링"
      layerLabel="Layer 1 · Knowledge"
      icon={Radar}
      upcoming={[
        "일일 자동 트렌드 수집 (다중 소스)",
        "우리 브랜드 키워드 매칭 알림",
        "골든 타임 콘텐츠 제안 — 트렌드 + 브랜드 결합 아이디어",
      ]}
    />
  );
}

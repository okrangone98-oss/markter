// 페르소나 관리 (스텁)
import { Users } from "lucide-react";

import { PageStub } from "@/components/layout/page-stub";

export default function PersonasPage() {
  return (
    <PageStub
      title="페르소나 (준비 중)"
      description="타겟 고객 프로필을 카드로 관리 — 콘텐츠 생성 시 자동 반영"
      layerLabel="Layer 1 · Knowledge"
      icon={Users}
      upcoming={[
        "페르소나 카드 CRUD (이름·페인포인트·채널·톤)",
        "콘텐츠 생성 시 페르소나 선택 → 시스템 프롬프트에 주입",
        "AI 기반 페르소나 자동 제안 (기존 콘텐츠 분석)",
      ]}
    />
  );
}

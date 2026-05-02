// 대시보드 — 메인 진입 화면 (스텁)
import { LayoutDashboard } from "lucide-react";

import { PageStub } from "@/components/layout/page-stub";

export default function DashboardPage() {
  return (
    <PageStub
      title="대시보드 (준비 중)"
      description="브랜드의 모든 활동을 한눈에 — 위키 누적·콘텐츠 생성량·성장 지표"
      icon={LayoutDashboard}
      upcoming={[
        "이번 주 생성한 콘텐츠 요약",
        "주간 5축 점수 추이 차트",
        "최근 위키 업데이트 / 새 트렌드 알림",
        "다음 액션 추천 (Marketer Coach 연동)",
      ]}
    />
  );
}

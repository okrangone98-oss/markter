// 마케팅 지식 위키 — Layer 1: Knowledge (스텁)
import { BookOpen } from "lucide-react";

import { PageStub } from "@/components/layout/page-stub";

export default function WikiPage() {
  return (
    <PageStub
      title="마케팅 지식 위키 (준비 중)"
      description="브랜드 정체성·페르소나·경쟁사·트렌드·성공 패턴을 누적 관리"
      layerLabel="Layer 1 · Knowledge"
      icon={BookOpen}
      upcoming={[
        "Markdown 기반 위키 페이지 CRUD (TipTap 에디터)",
        "Ingest — 자료 입력 → 자동 카테고리 분류·페이지 생성",
        "Query — 자연어 질문 → pgvector 의미 검색 → 답변",
        "Lint — 모순/고아/오래된 정보 자동 검사",
        "콘텐츠 생성 시 관련 페이지 자동 컨텍스트 주입",
      ]}
    />
  );
}

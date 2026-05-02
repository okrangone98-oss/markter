// 준비 중 페이지를 위한 공통 자리표시자 컴포넌트
// 각 라우트 스텁에서 재사용해 일관된 룩앤필 유지
import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PageStubProps {
  // 페이지 제목 (한국어)
  title: string;
  // 한 줄 설명
  description: string;
  // 좌상단 라벨 (예: "Layer 1 · Knowledge")
  layerLabel?: string;
  // Lucide 아이콘 컴포넌트
  icon: React.ComponentType<{ className?: string }>;
  // 추가로 보여줄 "예정 기능" 목록
  upcoming?: string[];
}

export function PageStub({
  title,
  description,
  layerLabel,
  icon: Icon,
  upcoming = [],
}: PageStubProps) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-4">
      {/* 페이지 헤더 */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 ring-1 ring-[var(--color-primary)]/30">
          <Icon className="h-6 w-6 text-[var(--color-primary)]" />
        </div>
        <div className="flex flex-col gap-1">
          {layerLabel ? (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">
              {layerLabel}
            </p>
          ) : null}
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            {title}
          </h1>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>

      {/* 준비 중 안내 카드 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="purple">준비 중</Badge>
            <Badge variant="secondary">곧 공개</Badge>
          </div>
          <CardTitle className="mt-3">이 화면은 곧 채워집니다</CardTitle>
          <CardDescription>
            아래 기능들이 순차적으로 들어올 예정입니다. 빈 페이지지만 라우팅과
            네비게이션은 정상 작동합니다.
          </CardDescription>
        </CardHeader>
        {upcoming.length > 0 ? (
          <CardContent>
            <ul className="flex flex-col gap-2">
              {upcoming.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-slate-300"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
}

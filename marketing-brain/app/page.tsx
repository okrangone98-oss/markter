// 랜딩 페이지 — 비로그인 사용자가 처음 보는 화면
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  WandSparkles,
  Brain,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// 3-Layer 아키텍처 소개 카드
const FEATURES = [
  {
    icon: BookOpen,
    title: "Knowledge",
    subtitle: "Layer 1 · 지식",
    desc: "브랜드 위키, 페르소나, 경쟁사, 트렌드를 누적 관리. pgvector 기반 의미 검색으로 모든 콘텐츠 생성에 자동 컨텍스트 주입.",
  },
  {
    icon: WandSparkles,
    title: "Generation",
    subtitle: "Layer 2 · 생성",
    desc: "20+ 콘텐츠 유형, 다중 변형 출력, 자동 개선 루프. 우리 브랜드 톤으로 일관된 캠페인을 한 번에 기획.",
  },
  {
    icon: Sparkles,
    title: "Intelligence",
    subtitle: "Layer 3 · 학습",
    desc: "성과 측정 → 성공 패턴 추출 → 위키 자동 업데이트. 사용자의 마케팅 약점을 진단하고 주간 도전 과제를 제안.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-slate-100">
      {/* 네비게이션 바 */}
      <header className="border-b border-slate-800/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/15 ring-1 ring-[var(--color-primary)]/40">
              <Brain className="h-4 w-4 text-[var(--color-primary)]" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Marketing Brain
            </span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">대시보드 열기</Link>
          </Button>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden">
        {/* 배경 글로우 */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[var(--color-primary)]/10 blur-[120px]" />
          <div className="absolute right-0 top-32 h-[300px] w-[400px] rounded-full bg-[var(--color-purple)]/10 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
          <Badge variant="default" className="mb-6">
            v0.2 · 3-Layer Brain Architecture
          </Badge>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-50 sm:text-5xl md:text-6xl">
            Marketing Brain
            <span className="mt-3 block bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-purple)] bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl md:text-4xl">
              사용할수록 똑똑해지는 마케팅 동반자
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            매번 처음부터 생성하는 도구가 아닙니다.
            <br className="hidden sm:block" />
            우리 브랜드를 시간이 갈수록 더 깊이 이해하는 AI 마케팅 두뇌입니다.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/dashboard">
                시작하기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/wiki">위키 둘러보기</Link>
            </Button>
          </div>

          <p className="mt-6 text-xs text-slate-500">
            Next.js 16 · Supabase · OpenRouter · Tailwind 4
          </p>
        </div>
      </section>

      {/* 3-Layer 소개 */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
            3-Layer Brain Architecture
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            지식 → 생성 → 학습. 모든 작업이 다음 작업을 더 똑똑하게 만듭니다.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="transition-colors hover:border-[var(--color-primary)]/50"
              >
                <CardHeader>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/15 ring-1 ring-[var(--color-primary)]/30">
                    <Icon className="h-5 w-5 text-[var(--color-primary)]" />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {feature.subtitle}
                  </p>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {feature.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-slate-800/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-slate-500">
          <span>© 2026 Marketing Brain</span>
          <span>Built with care · 양양에서</span>
        </div>
      </footer>
    </div>
  );
}

// 루트 레이아웃 — 모든 페이지를 감싼다.
// 다크 테마를 기본으로, 한국어 lang 설정.
// TooltipProvider 를 최상단에 마운트해 어디서든 <Tooltip> 사용 가능하게 함.
import type { Metadata } from "next";

import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

export const metadata: Metadata = {
  title: "Marketing Brain — 사용할수록 똑똑해지는 마케팅 동반자",
  description:
    "AI 마케팅 자동화 플랫폼. 지식 누적 · 콘텐츠 생성 · 성장 코칭을 한 곳에서.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-[var(--color-background)] text-slate-100">
        <TooltipProvider delayDuration={250} skipDelayDuration={100}>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}

// Tooltip — Radix UI 기반 접근성 호환 툴팁
// 기본 사용:
//   <Tooltip content="설명 텍스트"><Button>Hover me</Button></Tooltip>
"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

// 전역 Provider — 루트 레이아웃에 한 번만 마운트
export const TooltipProvider = TooltipPrimitive.Provider;

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
  asChild?: boolean;
}

export function Tooltip({
  content,
  children,
  side = "bottom",
  align = "center",
  delayDuration = 250,
  asChild = true,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild={asChild}>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={6}
          className={cn(
            "z-50 max-w-[260px] rounded-md border border-slate-700 bg-slate-900",
            "px-2.5 py-1.5 text-xs leading-relaxed text-slate-100",
            "shadow-lg shadow-black/40",
            "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-slate-700" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

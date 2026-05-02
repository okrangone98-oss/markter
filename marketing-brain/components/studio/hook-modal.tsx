// 바이럴 훅 모달 — Studio 의 주제 입력에 [HOOK:이름] 자동 삽입
"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { VIRAL_HOOKS, type ViralHook } from "@/lib/viral-hooks";

interface HookModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (hook: ViralHook) => void;
}

export function HookModal({ open, onClose, onSelect }: HookModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-100">
            🎯 바이럴 훅 공식 5가지
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="px-5 pt-3 text-xs text-slate-400 leading-relaxed">
          하나를 클릭하면 주제 입력 앞에 <code className="text-[var(--color-primary)]">[HOOK:이름]</code> 태그가 자동 삽입되어,
          LLM 이 첫 1-2문장에 해당 후킹 공식을 적용합니다.
        </p>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
          {VIRAL_HOOKS.map((hook) => (
            <button
              key={hook.id}
              onClick={() => { onSelect(hook); onClose(); }}
              className="w-full text-left rounded-lg border border-slate-800 bg-slate-900/40 p-3 hover:border-[var(--color-primary)]/40 hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-semibold text-[var(--color-primary)]">
                  {hook.name}
                </span>
                <span className="text-[11px] text-slate-400">{hook.desc}</span>
              </div>
              <div className="text-[11px] text-slate-500 italic leading-relaxed">
                {hook.examples.map((ex, i) => (
                  <div key={i}>예: &ldquo;{ex}&rdquo;</div>
                ))}
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end px-5 py-3 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}

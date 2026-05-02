// Tailwind 클래스 병합 유틸 — clsx로 조건부 클래스 만들고 tailwind-merge로 충돌 해결
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 클래스명을 안전하게 합치는 헬퍼.
 * 예) cn("p-2", isActive && "bg-primary", "p-4") => "bg-primary p-4"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

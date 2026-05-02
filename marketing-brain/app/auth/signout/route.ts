// 로그아웃 — POST로 호출 후 /login 으로 리다이렉트
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.nextUrl.origin), {
    status: 303, // POST → GET 리다이렉트
  });
}

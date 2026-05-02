// 사용 가이드 — Marketing Brain 핵심 사용법 한 페이지 요약
import Link from "next/link";
import {
  HelpCircle,
  BookOpen,
  WandSparkles,
  Mic2,
  Film,
  ExternalLink,
  Upload,
  ArrowRight,
  Lightbulb,
} from "lucide-react";

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-4">
      {/* 인트로 */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 ring-1 ring-[var(--color-primary)]/30">
          <HelpCircle className="h-6 w-6 text-[var(--color-primary)]" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            Quick Start
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            사용 가이드
          </h1>
          <p className="text-sm text-slate-400">
            5분이면 Marketing Brain의 핵심 흐름을 익힐 수 있습니다.
          </p>
        </div>
      </div>

      {/* 시작하기 — 3단계 */}
      <section>
        <h2 className="text-sm font-bold text-[var(--color-primary)] mb-3">
          🚀 처음 시작하는 분 — 3단계
        </h2>
        <div className="space-y-2">
          <Step number={1} title="브랜드 자료부터 위키에 넣기">
            <Link href="/wiki" className="text-[var(--color-primary)] hover:underline">위키</Link>로 이동 → 사이드바 하단{" "}
            <code className="px-1 py-0.5 rounded bg-slate-800 text-xs">📂 Excel · PDF · CSV · Sheets</code> 클릭 →
            기존 자료(브랜드 가이드라인, 페르소나 시트, 경쟁사 리포트) 업로드. 위키에 자동으로 페이지가 생성됩니다.
          </Step>
          <Step number={2} title="첫 콘텐츠 생성하기">
            <Link href="/studio" className="text-[var(--color-primary)] hover:underline">콘텐츠 스튜디오</Link>로 이동 →
            브랜드 프로필 선택 → 콘텐츠 타입 선택 (예: 인스타그램 피드) → 주제 입력 → <b>생성하기</b>.
            결과는 실시간으로 스트리밍되며 복사·다운로드·재생성 가능합니다.
          </Step>
          <Step number={3} title="필요한 외부 도구 빠르게 찾기">
            <Link href="/links" className="text-[var(--color-primary)] hover:underline">링크 모음</Link>에 50+ 큐레이션 도구
            (NotebookLM, AI Studio, 네이버 블로그, Canva 등)가 카테고리별로 정리되어 있습니다.
          </Step>
        </div>
      </section>

      {/* 주요 페이지별 사용법 */}
      <section>
        <h2 className="text-sm font-bold text-[var(--color-primary)] mb-3">
          📖 주요 페이지 가이드
        </h2>
        <div className="grid gap-3">
          <PageCard
            href="/wiki"
            icon={BookOpen}
            title="마케팅 지식 위키"
            badge="Layer 1 · 누적 지식"
            tips={[
              "사이드바 + 검색 + AI 작업 + 데이터 + 파일 업로드 5개 영역",
              "[[페이지 제목]] 위키링크 → 자동 백링크 생성",
              "대시보드: 카테고리 빈틈 진단, 14일 활동 히트맵, 인기 태그",
              "Excel·PDF·CSV·Google Sheets URL 모두 업로드 가능",
              "에디터는 자동 저장 (입력 후 800ms)",
            ]}
          />
          <PageCard
            href="/studio"
            icon={WandSparkles}
            title="콘텐츠 스튜디오"
            badge="Layer 2 · 생성"
            tips={[
              "22개 콘텐츠 타입 (블로그·SNS·이메일·광고·영상 대본 등)",
              "6개 톤 (전문적/친근/감성/재치/긴박/스토리텔링)",
              "4개 브랜드 프로필 (파책남·양양군 센터·비즈니스·직접 입력)",
              "OpenRouter LLM 실시간 스트리밍",
              "복사·다운로드·재생성 버튼",
            ]}
          />
          <PageCard
            href="/tts"
            icon={Mic2}
            title="AI 음성 (TTS)"
            badge="음성 합성"
            tips={[
              "4 엔진: Microsoft Neural (무료) · Puter Polly (무료) · OpenAI TTS-HD · ElevenLabs",
              "한국어 자연 음성 — Microsoft Edge 권장",
              "SSML <break/> 태그로 휴지 삽입 가능",
              "MP3 다운로드 또는 영상 메이커로 바로 보내기",
            ]}
          />
          <PageCard
            href="/video"
            icon={Film}
            title="숏폼 영상 메이커"
            badge="Ken Burns + 자막"
            tips={[
              "9:16 · 1:1 · 16:9 비율 (쇼츠/카드/유튜브)",
              "슬라이드 추가 → 이미지 업로드 또는 AI 생성",
              "자동 줌·팬 (Ken Burns) + 4 자막 스타일",
              "BGM + TTS 음성 자동 연결 (자동 감쇠 ducking)",
              "WebM (빠름) 또는 MP4 (호환성) 출력",
            ]}
          />
          <PageCard
            href="/links"
            icon={ExternalLink}
            title="마케터 링크함"
            badge="50+ 큐레이션"
            tips={[
              "AI 생성·디자인·영상·마케팅 플랫폼·분석·학습·유틸 7 카테고리",
              "검색으로 빠르게 찾기 (예: \"네이버\", \"무료\")",
              "모든 링크는 새 탭에서 열림",
              "팀에서 자주 쓰는 도구를 한 곳에 모은 북마크 대안",
            ]}
          />
        </div>
      </section>

      {/* Karpathy 패턴 */}
      <section>
        <h2 className="text-sm font-bold text-[var(--color-primary)] mb-3">
          🧠 Marketing Brain의 차별점 — 사용할수록 똑똑해지는 구조
        </h2>
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">
              📚 LLM Wiki 패턴 (Andrej Karpathy)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              모든 마케팅 작업을 위키에 누적. 콘텐츠 생성 시 관련 위키 페이지를{" "}
              <b className="text-[var(--color-primary)]">자동으로 컨텍스트에 주입</b>해
              시간이 갈수록 결과 품질이 복리로 올라갑니다. (위키 RAG는 다음 마일스톤에 활성화)
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">
              🔁 자동 개선 루프 (autoresearch)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              LLM 판정자가 5축(후킹·명확성·톤·CTA·한국어)으로 1-10점 평가 → 비평 → 재생성을 N회 반복.
              v0.1 단일 HTML에서 이미 작동, v1.0에는 곧 포팅 예정.
            </p>
          </div>
        </div>
      </section>

      {/* 단축키 / 팁 */}
      <section>
        <h2 className="text-sm font-bold text-[var(--color-primary)] mb-3">
          ⌨️ 단축키 · 팁
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TipCard icon={Lightbulb} title="위키 자동 저장">
            제목·본문·카테고리 변경 후 0.8초가 지나면 자동 저장됩니다. 별도 저장 버튼 불필요.
          </TipCard>
          <TipCard icon={Lightbulb} title="위키링크 생성">
            본문에 <code className="px-1 rounded bg-slate-800 text-[10px]">[[페이지 제목]]</code> 입력 → 다른 페이지로 점프 + 백링크 자동 생성.
          </TipCard>
          <TipCard icon={Lightbulb} title="Studio 재생성">
            결과 영역 우상단 <code className="px-1 rounded bg-slate-800 text-[10px]">재생성</code> 버튼으로 같은 입력으로 새 시도.
          </TipCard>
          <TipCard icon={Lightbulb} title="대시보드 빈틈 진단">
            위키 메인의 <b>지식 공백</b> 카드를 클릭하면 비어있는 카테고리에 새 페이지를 즉시 만들 수 있습니다.
          </TipCard>
        </div>
      </section>

      {/* FAQ 미니 */}
      <section>
        <h2 className="text-sm font-bold text-[var(--color-primary)] mb-3">
          ❓ 자주 묻는 질문
        </h2>
        <div className="space-y-2">
          <FaqItem q="데이터는 어디에 저장되나요?">
            Supabase PostgreSQL DB에 본인 계정 단위로 영속 저장됩니다.
            로그아웃 후 다른 PC에서 다시 로그인해도 동일하게 보입니다. (RLS로 본인 데이터만 접근 가능)
          </FaqItem>
          <FaqItem q="OpenRouter API 키가 필요한가요?">
            <code>/studio</code>의 콘텐츠 생성과 일부 LLM 기능은 OpenRouter API를 사용합니다.
            서버 환경변수로 이미 설정되어 있어 별도 입력 불필요합니다 (관리자가 운영).
          </FaqItem>
          <FaqItem q="단일 HTML(FlowAI) 버전은 뭐가 다른가요?">
            FlowAI(v0.1)는 GitHub Pages에 호스팅된 단일 HTML 데모로, 데이터가 브라우저에만 저장됩니다.
            Marketing Brain(v1.0, 이 사이트)이 멀티 디바이스·팀 협업·결제 가능한 프로덕션 버전입니다.
          </FaqItem>
          <FaqItem q="위키에 어떤 자료를 넣어야 하나요?">
            브랜드 가이드라인, 페르소나 시트, 경쟁사 리포트, 캠페인 결과, 트렌드 메모 등.
            많을수록 콘텐츠 생성 결과가 더 정확해집니다 (RAG 활성화 시).
          </FaqItem>
          <FaqItem q="에러가 나면 어떻게 하나요?">
            화면 상단 우측의 본인 아바타 → 로그아웃 후 재로그인.
            그래도 안 되면 GitHub 이슈 또는 운영자에게 알려주세요.
          </FaqItem>
        </div>
      </section>

      <p className="text-center text-xs text-slate-600 pt-6 border-t border-slate-800">
        v1.0 · 사용할수록 똑똑해지는 마케팅 동반자
      </p>
    </div>
  );
}

/* ── 작은 컴포넌트 ── */

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-xs font-bold text-[var(--color-primary)]">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-slate-100 mb-1">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function PageCard({
  href,
  icon: Icon,
  title,
  badge,
  tips,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  badge: string;
  tips: string[];
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:border-[var(--color-primary)]/40 hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/15">
          <Icon className="h-4 w-4 text-[var(--color-primary)]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">
              {badge}
            </span>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-600" />
      </div>
      <ul className="space-y-1 ml-12">
        {tips.map((tip) => (
          <li key={tip} className="text-xs text-slate-400 leading-relaxed flex gap-1.5">
            <span className="text-[var(--color-primary)] mt-1">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </Link>
  );
}

function TipCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="h-3.5 w-3.5 text-amber-400" />
        <h4 className="text-xs font-semibold text-slate-100">{title}</h4>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">{children}</p>
    </div>
  );
}

function FaqItem({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3">
      <summary className="cursor-pointer text-sm font-medium text-slate-200 list-none flex items-center justify-between">
        <span>{q}</span>
        <span className="text-slate-500 text-xs group-open:rotate-180 transition-transform">▾</span>
      </summary>
      <p className="mt-2 text-xs text-slate-400 leading-relaxed">
        {children}
      </p>
    </details>
  );
}

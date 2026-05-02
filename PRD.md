# Marketing Brain — Product Requirements Document (PRD)

> 세계 최고의 마케터를 만드는 AI 마케팅 자동화 플랫폼

---

## 0. 메타 정보

- **프로젝트명**: Marketing Brain (working title)
- **현재 코드명**: FlowAI / markter
- **저장소**: https://github.com/okrangone98-oss/markter
- **현재 배포**: https://okrangone98-oss.github.io/markter/
- **로컬 경로**: `G:\01_프로젝트\개인프로젝트\marketer`
- **작성자**: 오대훈 (양양군농촌활성화지원센터 사무국장, 파책남 @slowbukbunri)
- **버전**: v0.1 (2026-05-02)

---

## 1. 비전 & 미션

### 비전
**"AI가 마케터를 대체하는 게 아니라, 마케터를 성장시키는 플랫폼"**

### 미션
- 콘텐츠 생성 도구 → **마케터 두뇌의 디지털 복제 시스템**으로 진화
- 사용할수록 똑똑해지는 누적형 지식 시스템 구축
- 사용자 본인의 마케팅 역량을 함께 성장시키는 코칭 동반자

### 차별화 한 줄
> 마케케·Jasper·Copy.ai는 매번 처음부터 생성한다.
> Marketing Brain은 시간이 갈수록 우리 브랜드를 더 깊이 이해한다.

---

## 2. 현재 상태 (v0.1 완료 기능)

### 작동 중인 기능
- 단일 `index.html` 파일 (~1,800 lines)
- OpenRouter API 텍스트 생성 (스트리밍, fallback 모델 5종)
- Puter.js 이미지 생성 (Flux/DALL-E/SDXL/Flux Kontext)
- TipTap 리치 에디터 + Marked.js 마크다운 뷰
- Sortable.js 카드뉴스 드래그앤드롭
- Chart.js 생성 통계
- 프로필별 문체 저장 (파책남/센터/비즈니스)
- 생성 히스토리 (localStorage 50개)
- GitHub Pages 자동 배포

### 한계 (이번 PRD로 해결할 문제)
1. 매번 처음부터 생성 — 누적된 지식 활용 불가
2. 결과 평가·개선 자동화 없음
3. 콘텐츠 단일 채널 — 통합 캠페인 불가
4. 트렌드 수동 입력 — 실시간 대응 불가
5. 사용자 성장 측정·코칭 없음
6. 단일 HTML 파일 한계 — 5,000줄 넘으면 관리 불가

---

## 3. 타겟 사용자

### 1차 타겟 — 본인 (Dogfooding)
- 양양군농촌활성화지원센터 사무국장 오대훈
- 파책남 개인 브랜드 운영자
- 두레동아리·시군역량강화 사업 콘텐츠 제작 필요

### 2차 타겟 (베타)
- 지역 소상공인·로컬 브랜드 운영자
- 1인 콘텐츠 크리에이터
- 비영리/공공기관 마케팅 담당자

### 3차 타겟 (SaaS 확장)
- 스타트업 마케팅 팀
- 마케팅 대행사
- 인디 메이커

---

## 4. 핵심 아키텍처 — 3-Layer Brain

```
┌─────────────────────────────────────────┐
│  Layer 1: KNOWLEDGE (지식 누적)         │
├─────────────────────────────────────────┤
│  • Brand Wiki     - 우리 브랜드 정체성   │
│  • Persona DB     - 타겟 고객 프로필    │
│  • Competitor Lab - 경쟁사 추적·분석    │
│  • Trend Radar    - 트렌드 자동 수집    │
│  • Winning Patterns - 성공 사례 라이브러리│
└─────────────────────────────────────────┘
            ↓ 자동 컨텍스트 주입
┌─────────────────────────────────────────┐
│  Layer 2: GENERATION (콘텐츠 생성)      │
├─────────────────────────────────────────┤
│  • Content Studio - 텍스트·이미지·영상   │
│  • Brand Voice    - 문체 학습·재현      │
│  • Campaign Orchestra - 통합 캠페인 기획 │
└─────────────────────────────────────────┘
            ↓ 결과 측정·학습
┌─────────────────────────────────────────┐
│  Layer 3: INTELLIGENCE (학습·코칭)      │
├─────────────────────────────────────────┤
│  • Auto-refine    - 자동 개선 루프      │
│  • Performance    - 실제 성과 추적      │
│  • Learning Loop  - 성공 패턴 추출·저장 │
│  • Marketer Coach - 사용자 성장 코칭    │
└─────────────────────────────────────────┘
```

---

## 5. 기술 스택

### Stack 결정
| 영역 | 선택 | 이유 |
|------|------|------|
| Framework | **Next.js 14 (App Router)** | 풀스택 가능, Vercel 최적화, 사용자 익숙 |
| 언어 | **TypeScript** | 코드 안정성, AI 코딩 효율 향상 |
| 스타일 | **Tailwind CSS** | 빠른 개발, 컴포넌트 재사용 |
| UI Lib | **shadcn/ui** | 커스터마이징 자유, 트렌드 |
| DB | **Supabase (PostgreSQL)** | 무료 티어, pgvector 지원, Auth 내장 |
| 인증 | **Supabase Auth** | Google 로그인, 무료 |
| 벡터 검색 | **Supabase pgvector** | 별도 인프라 불필요 |
| 파일 저장 | **Supabase Storage** | 이미지·영상 저장 |
| LLM (텍스트) | **OpenRouter** | 다중 모델 fallback, 무료 모델 다수 |
| LLM (이미지) | **Puter.js** | API 키 불필요, 무료 |
| TTS (한국어) | **MeloTTS via HF Space** | 무료, 한국어 자연스러움 |
| 자막 | **Whisper.cpp WASM** | 브라우저 내, 오프라인 |
| 배포 | **Vercel** | Next.js 최적화, 무료 |
| 도메인 | **marketingbrain.kr** (예정) | - |
| 결제 | **Stripe** (3단계 이후) | SaaS 표준 |

### 폴더 구조
```
marketing-brain/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (app)/                    # 인증 필요 영역
│   │   ├── layout.tsx            # 사이드바 + 탑바
│   │   ├── dashboard/page.tsx    # 메인 대시보드
│   │   ├── wiki/                 # 1-Layer: Knowledge
│   │   │   ├── page.tsx
│   │   │   ├── [pageId]/page.tsx
│   │   │   └── new/page.tsx
│   │   ├── personas/page.tsx
│   │   ├── competitors/page.tsx
│   │   ├── trends/page.tsx
│   │   ├── studio/               # 2-Layer: Generation
│   │   │   ├── content/page.tsx
│   │   │   ├── image/page.tsx
│   │   │   └── campaign/page.tsx
│   │   ├── coach/page.tsx        # 3-Layer: Coaching
│   │   └── insights/page.tsx
│   ├── api/                      # API Routes
│   │   ├── generate/route.ts     # OpenRouter 프록시
│   │   ├── wiki/
│   │   │   ├── ingest/route.ts
│   │   │   ├── query/route.ts
│   │   │   └── lint/route.ts
│   │   ├── refine/route.ts       # 자동 개선
│   │   ├── tts/route.ts
│   │   └── trends/route.ts
│   ├── layout.tsx
│   └── page.tsx                  # 랜딩 페이지
├── components/
│   ├── ui/                       # shadcn/ui
│   ├── editor/
│   │   ├── TipTapEditor.tsx
│   │   └── MarkdownView.tsx
│   ├── wiki/
│   │   ├── WikiPageCard.tsx
│   │   ├── WikiGraph.tsx
│   │   └── WikiSearch.tsx
│   ├── studio/
│   │   ├── ContentGenerator.tsx
│   │   ├── ImageGenerator.tsx
│   │   ├── AutoRefine.tsx
│   │   └── ContextInjector.tsx
│   └── coach/
│       ├── GrowthChart.tsx
│       └── WeeklyChallenge.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── llm/
│   │   ├── openrouter.ts
│   │   ├── puter.ts
│   │   └── prompts.ts
│   ├── wiki/
│   │   ├── ingest.ts
│   │   ├── retrieve.ts
│   │   └── embeddings.ts
│   └── utils.ts
├── prisma/                       # 또는 supabase/migrations/
│   └── schema.prisma
├── public/
└── package.json
```

---

## 6. 데이터베이스 스키마 (Supabase)

```sql
-- 사용자 (Supabase Auth가 자동 생성하는 auth.users 확장)
create table profiles (
  id uuid references auth.users primary key,
  display_name text,
  brand_name text,
  created_at timestamp default now()
);

-- 1-Layer: Knowledge

create table wiki_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  title text not null,
  content text not null,
  category text,                  -- brand / persona / competitor / trend / pattern
  tags text[],
  embedding vector(1536),         -- pgvector for semantic search
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table personas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  name text,                      -- e.g., "30대 귀촌 관심 직장인"
  description text,
  pain_points text[],
  channels text[],
  voice_preference text,
  created_at timestamp default now()
);

create table competitors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  name text,
  url text,
  notes text,
  last_checked timestamp,
  created_at timestamp default now()
);

create table trends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  keyword text,
  source text,                    -- naver_datalab / x / instagram_hashtag
  score numeric,
  matched_brand boolean,
  detected_at timestamp default now()
);

-- 2-Layer: Generation

create table contents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  type text,                      -- blog / instagram / thread / etc
  topic text,
  body text,
  meta jsonb,                     -- tone, audience, keywords...
  context_pages uuid[],           -- 주입된 wiki_pages.id 배열
  refined_versions jsonb,         -- 자동 개선 시도들
  best_score numeric,
  status text,                    -- draft / published / archived
  published_at timestamp,
  created_at timestamp default now()
);

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  title text,
  brief text,
  content_ids uuid[],             -- 묶인 contents.id 배열
  schedule jsonb,                 -- 발행 캘린더
  status text,
  created_at timestamp default now()
);

-- 3-Layer: Intelligence

create table experiments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  content_id uuid references contents(id),
  prompt_version text,
  model text,
  output text,
  judge_score jsonb,              -- {hooking: 8, clarity: 7, tone: 9, cta: 6, seo: 8}
  judge_critique text,
  iteration int,
  created_at timestamp default now()
);

create table performance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  content_id uuid references contents(id),
  url text,
  metrics jsonb,                  -- {views, likes, comments, shares}
  measured_at timestamp default now()
);

create table coaching_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  weak_points text[],
  suggested_challenge text,
  completed boolean,
  created_at timestamp default now()
);
```

---

## 7. 핵심 모듈 상세 스펙

### 7.1 Brand Wiki (Layer 1)

**Inspired by**: Karpathy LLM Wiki gist

**기능**:
- Markdown 기반 위키 페이지 (브랜드 정체성, 페르소나, 경쟁사, 트렌드, 성공 패턴)
- 3가지 AI 액션:
  - **Ingest**: 텍스트·URL 입력 → LLM이 카테고리 자동 분류 + 페이지 자동 생성·업데이트
  - **Query**: 자연어 질문 → 의미 검색(pgvector) → 답변 → 옵션으로 새 페이지 저장
  - **Lint**: 모순/고아/오래된 정보 자동 검사
- 페이지 간 관계 그래프 시각화 (D3.js or React Flow)

**핵심 차별점**: 콘텐츠 생성 시 **관련 페이지 자동 컨텍스트 주입** 토글

**API 엔드포인트**:
- `POST /api/wiki/ingest` — 자료 추가
- `POST /api/wiki/query` — 자연어 검색
- `POST /api/wiki/lint` — 무결성 검사
- `GET /api/wiki/relevant?topic=...` — 컨텍스트 주입용 관련 페이지 검색

### 7.2 Persona Database

**기능**:
- 페르소나 카드 형태로 관리 (이름, 설명, 페인포인트, 사용 채널, 선호 톤)
- 콘텐츠 생성 시 페르소나 선택 → 시스템 프롬프트에 자동 반영
- AI가 기존 콘텐츠를 분석해 페르소나 자동 제안

### 7.3 Competitor Lab

**기능**:
- 경쟁사 URL 등록 → 주기적으로 콘텐츠 자동 수집 (RSS/스크래핑)
- "이 경쟁사가 최근 어떤 콘텐츠를 내는가" 요약 대시보드
- 경쟁사 톤·전략 분석 → 우리 브랜드 차별화 제안

### 7.4 Trend Radar

**기능**:
- 일일 자동 트렌드 수집:
  - 네이버 데이터랩 (검색 트렌드)
  - X (실시간 트렌딩)
  - 인스타그램 해시태그
- 우리 브랜드 키워드와 매칭 → 알림
- "골든 타임 콘텐츠 제안" — 트렌드 + 브랜드 결합 아이디어 자동 생성

### 7.5 Content Studio (기존 기능 + 강화)

**기존 유지**:
- 20+ 콘텐츠 유형 (블로그/이메일/SNS/마케팅/영상/비즈니스)
- 톤 & 스타일, 대상 독자, 키워드 입력
- 프로필별 문체 학습

**추가**:
- **컨텍스트 주입 토글** — Wiki/Persona/Competitor 자동 첨부
- **자동 개선 루프** — 생성 후 LLM 판정자가 평가·재생성
- **다중 변형 생성** — A/B/C 버전 동시 출력
- **이전 성공 패턴 few-shot** — 과거 잘 된 콘텐츠를 예시로 자동 첨부

### 7.6 Auto-refine (Layer 3 핵심)

**Inspired by**: autoresearch agent loop pattern

**플로우**:
```
1. 사용자 콘텐츠 생성
2. "✨ 자동 개선 ×N" 버튼 클릭 (N=3, 5, 10)
3. LLM 판정자가 5축 평가:
   - Hooking (도입부 매력)
   - Clarity (명확성)
   - Tone (브랜드 일치도)
   - CTA (행동 유도력)
   - SEO (검색 최적화)
4. 비평 생성 → 재생성 → 점수 비교
5. 모든 시도를 experiments 테이블 저장
6. 최고점 버전 자동 표시
7. 향후 few-shot 예시로 재활용
```

**판정 프롬프트 예시**:
```
당신은 마케팅 콘텐츠 평가 전문가입니다.
다음 콘텐츠를 5개 축으로 1-10점 평가하고 개선 비평을 작성하세요.

[콘텐츠]
{output}

[브랜드 컨텍스트]
{brand_voice}

[페르소나]
{persona}

JSON 형식으로 응답:
{
  "hooking": 7,
  "clarity": 8,
  "tone": 6,
  "cta": 5,
  "seo": 7,
  "critique": "도입부는 좋지만 CTA가 약합니다...",
  "suggestions": ["...", "..."]
}
```

### 7.7 Performance Brain

**기능**:
- 발행한 콘텐츠 URL 입력
- AI가 (가능하면 자동, 아니면 수동) 메트릭 수집
- "이 패턴이 잘 먹힌다" 인사이트 추출
- Winning Patterns 위키 자동 업데이트

### 7.8 Marketer Coach

**기능 (이게 진짜 차별점)**:
- 매주 대훈님의 콘텐츠 작성 패턴 분석
- 약점 진단:
  - "도입부 후킹이 약합니다"
  - "CTA가 자주 흐릿합니다"
  - "감성 표현은 강하지만 데이터 근거가 부족합니다"
- 주간 도전 과제 자동 제안:
  - "이번 주: 모든 콘텐츠에 통계 1개씩 포함하기"
- 성장 그래프 시각화 (5축 점수 추이)
- 마케팅 학습 자료 큐레이션 (관련 글·영상)

### 7.9 Campaign Orchestra

**기능**:
```
입력: "양양 서핑 캠프 5월 모집"
출력 (한 번에):
  ├─ 블로그 1편 (1,500자, SEO 최적화)
  ├─ 인스타그램 피드 5장 (캡션 + 이미지 프롬프트)
  ├─ 스레드 5부작
  ├─ 유튜브 쇼츠 대본 (60초)
  ├─ 광고 카피 3종 (A/B/C)
  ├─ 이메일 뉴스레터
  └─ 발행 캘린더 (D-7 ~ D-Day)
```

모든 콘텐츠가 **일관된 톤·메시지·CTA**로 자동 정렬됨.

---

## 8. 마이그레이션 전략

### 8.1 기존 자산 (보존)
현재 `index.html`의 다음 자산은 새 프로젝트에 이전:
- 콘텐츠 유형 20+개 정의
- 톤 옵션 6종
- 프로필 3종 (파책남/센터/비즈니스)
- 프롬프트 템플릿 (`buildPrompt` 함수)
- OpenRouter fallback 모델 리스트
- Puter.js 이미지 생성 로직

### 8.2 마이그레이션 단계

**Phase 1 — 기초 셋업 (3~5일)**
- [ ] Next.js 14 + TypeScript + Tailwind + shadcn/ui 초기화
- [ ] Supabase 프로젝트 생성, 스키마 적용
- [ ] Supabase Auth 연동 (Google 로그인)
- [ ] 기본 레이아웃 (사이드바 + 탑바) 구현
- [ ] OpenRouter API Route 프록시 (보안)
- [ ] Puter.js 이미지 생성 컴포넌트 이전
- [ ] Vercel 배포, 도메인 연결

**Phase 2 — Layer 1: Knowledge (1주)**
- [ ] Brand Wiki CRUD + Markdown 에디터 (TipTap)
- [ ] pgvector 임베딩 + 의미 검색
- [ ] Wiki Ingest / Query / Lint API
- [ ] Persona 관리 UI
- [ ] Competitor 등록 UI

**Phase 3 — Layer 2: Generation (1주)**
- [ ] Content Studio 이전 + 컨텍스트 주입 토글
- [ ] 이미지 생성 페이지 이전
- [ ] 다중 변형 생성 (A/B/C)
- [ ] 생성 히스토리 (Supabase 저장)

**Phase 4 — Layer 3: Intelligence (1~2주)**
- [ ] Auto-refine 루프 (judge → critique → regenerate)
- [ ] Experiments 저장·재활용
- [ ] Marketer Coach 주간 분석
- [ ] Performance 메트릭 입력·분석

**Phase 5 — Trend & Campaign (2주)**
- [ ] Trend Radar (네이버 데이터랩 API 등)
- [ ] Campaign Orchestra (멀티 콘텐츠 동시 생성)
- [ ] 발행 캘린더 시각화

**Phase 6 — 베타 & 수익화 (이후)**
- [ ] 베타 테스터 모집 (대훈님 네트워크)
- [ ] 피드백 루프 구축
- [ ] Stripe 결제 연동
- [ ] 무료/유료 티어 구분 (Wiki 페이지 수, 자동개선 횟수 등)

---

## 9. 보안 & 비용

### API 키 관리 원칙
- **절대 클라이언트에 노출 금지**: OpenRouter, Anthropic 등 모든 LLM 키는 서버 사이드(API Routes)에서만 호출
- 사용자 OpenRouter 키 입력 옵션은 유지(BYO Key) → DB에 암호화 저장
- `.env.local` 절대 커밋 금지 (`.gitignore` 강제)
- GitHub Secret Scanning 활성화

### 예상 인프라 비용 (월)
| 항목 | 단계 1 (개인) | 단계 2 (베타 100명) | 단계 3 (유료 1,000명) |
|------|--------------|----------------------|------------------------|
| Vercel | $0 | $0 | $20 |
| Supabase | $0 | $0 | $25 |
| OpenRouter | $0~5 | $20~50 | $200~500 |
| Domain | ₩15,000/년 | ₩15,000/년 | ₩15,000/년 |
| **합계** | **약 ₩7,000** | **약 ₩70,000** | **약 ₩700,000** |

수익 모델 (단계 3):
- Free: 월 10회 자동개선, Wiki 30페이지
- Pro ₩19,900/월: 무제한 + 트렌드 레이더 + 캠페인 오케스트라
- Team ₩49,900/월: 다중 사용자 + 공유 워크스페이스

---

## 10. 성공 지표 (KPI)

### Phase 1~3 (개인 사용)
- 본인이 매일 사용하는가? (Daily Active)
- 1주 내 콘텐츠 생성 시간 50% 단축
- 위키 페이지 50개 이상 누적

### Phase 4~5 (베타)
- 베타 테스터 30명 확보
- 주간 활성 사용자 60% 이상
- 자동개선 평균 점수 +2.0점 향상

### Phase 6 (수익화)
- 유료 전환율 5% 이상
- 월 매출 ₩1,000,000 이상
- NPS 50 이상

---

## 11. Claude Code 작업 지침

### 코딩 원칙
1. **단계적 마이그레이션**: 기존 `index.html` 한 번에 폐기 X. 페이지별로 점진적 이전.
2. **타입 안정성**: 모든 함수에 TypeScript 타입 명시. `any` 금지.
3. **컴포넌트 분리**: 200줄 넘으면 분리. 한 파일에 하나의 책임.
4. **API Route 우선**: LLM 호출은 무조건 서버 사이드. 클라이언트 직접 호출 금지.
5. **에러 핸들링**: 모든 외부 API 호출은 try-catch + fallback.
6. **주석**: 한국어 주석. 비개발자(대훈님)가 이해할 수 있게.
7. **점진적 커밋**: 기능 단위로 작은 커밋. 메시지는 한국어.

### 작업 시작 순서
```bash
# 1. 새 폴더에 Next.js 프로젝트 초기화
cd G:\01_프로젝트\개인프로젝트
npx create-next-app@latest marketing-brain --typescript --tailwind --app

# 2. 기존 markter 레포 분리 결정
# Option A: 새 레포 (marketing-brain) 생성 — 추천
# Option B: 기존 markter 레포에 v2/ 폴더로 추가

# 3. shadcn/ui 설치
cd marketing-brain
npx shadcn-ui@latest init

# 4. Supabase 클라이언트 설치
npm install @supabase/supabase-js @supabase/ssr

# 5. 추가 라이브러리
npm install @tiptap/react @tiptap/starter-kit
npm install marked
npm install react-flow-renderer  # 위키 그래프
npm install zustand              # 상태 관리
```

### Phase 1 첫 작업 (Claude Code에 그대로 전달)
```
Marketing Brain 프로젝트의 Phase 1을 시작합니다.

목표: Next.js 14 + Supabase 기반 골격 구축

작업 순서:
1. 새 Next.js 프로젝트 초기화 (TypeScript + Tailwind + App Router)
2. shadcn/ui 설치 + 기본 컴포넌트 (Button, Input, Card, Dialog) 추가
3. Supabase 클라이언트 셋업 (lib/supabase/client.ts, server.ts)
4. .env.local 템플릿 생성 (.env.example로)
5. 기본 레이아웃: 사이드바(좌) + 탑바(상) + 메인 영역
6. 사이드바에 다음 메뉴 추가 (모두 빈 페이지로):
   - Dashboard
   - Wiki
   - Personas
   - Competitors
   - Trends
   - Studio (Content / Image / Campaign)
   - Coach
   - Insights
7. /api/generate/route.ts 작성 (OpenRouter 프록시, 스트리밍)
8. 환경변수: OPENROUTER_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

PRD 문서는 docs/PRD.md에 저장하고 참고하세요.

기존 markter 레포의 index.html에서 다음을 추출해 보존:
- buildPrompt() 함수 → lib/llm/prompts.ts
- FREE_MODELS 배열 → lib/llm/openrouter.ts
- profiles 객체 (파책남/센터/비즈니스) → 초기 시드 데이터로

각 단계마다 git commit (한국어 메시지).
```

---

## 12. 참고 문서 (개발 시 참조)

- Next.js App Router: https://nextjs.org/docs/app
- Supabase Docs: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com
- OpenRouter API: https://openrouter.ai/docs
- Karpathy LLM Wiki gist: https://gist.github.com/karpathy
- pgvector: https://github.com/pgvector/pgvector

---

## 13. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| v0.1 | 2026-05-02 | 초안 작성, 3-Layer 아키텍처 확정, Phase 1~6 정의 |

---

**END OF PRD**

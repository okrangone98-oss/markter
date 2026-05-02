# 📊 Marketing Brain — 개발현황

> **자동 갱신 문서.** 사용자가 "개발현황" 이라고 말하면 Claude가 이 문서를 최신 상태로 다시 써서 GitHub에 푸시합니다. 다른 플랫폼/세션에서도 이 문서만 읽으면 어디까지 만들었는지 즉시 파악할 수 있도록 작성합니다.

**최종 갱신**: 2026-05-02 (4회차) · **현재 브랜치**: `claude/add-tts-video-features-UEAy7`

> 🆕 **이번 갱신 요점**: v1.0 **위키 풀 구현** (Supabase CRUD + 사이드바 + 대시보드 + 에디터 + 자동 저장). **Karpathy 코딩 원칙** 통합 (`.claude/skills/`). **마케터 링크함** 신규 페이지 (v0.1+v1.0, 50+ 큐레이션 링크: NotebookLM·AI Studio·Stitch·네이버·Canva·Suno 등).

---

## 1. 프로젝트 개요

**제품명**: Marketing Brain (마케팅 두뇌) — *사용할수록 똑똑해지는 마케팅 동반자*

**비전**: 마케케 같은 풍부한 기능 + Karpathy LLM Wiki 패턴(누적 지식) + autoresearch 패턴(자동 개선 루프)으로, 시간이 갈수록 우리 브랜드를 더 깊이 이해하는 복리형 AI 마케팅 플랫폼.

**3-Layer Brain 아키텍처**:
1. **Knowledge** (지식) — Wiki, Personas, Competitors, Trends
2. **Generation** (생성) — Studio, TTS, Video Maker
3. **Intelligence** (지능) — Coach, Insights, Auto-refine loop

**저장소**: `okrangone98-oss/markter`
- GitHub Pages 배포: https://okrangone98-oss.github.io/markter/ (v0.1 단일 HTML)
- Vercel 배포 (진행 중): marketing-brain Next.js 앱

---

## 2. 두 가지 코드베이스 (의도된 마이그레이션 상태)

> **왜 두 개인가?** v0.1은 이미 풍부한 MVP로 살아있고, v1.0은 프로덕션 SaaS로 다시 짓는 중입니다. v1.0이 feature parity에 도달하면 v0.1을 대체합니다. 그 전까지 둘 다 활성 — 개발 단계의 정상 상태입니다.

### 2.1 v0.1 — `index.html` (단일 HTML)
- **위치**: 저장소 루트 `index.html` (4,400+ 라인)
- **배포**: ✅ **GitHub Pages** — https://okrangone98-oss.github.io/markter/
- **상태**: 운영 중, 데모/즉시 사용 가능
- **저장**: `localStorage` (서버리스, 단일 디바이스, 다중 사용자 ✗)
- **목적**: MVP — 풍부한 기능을 가장 빨리 사용자에게 노출

### 2.2 v1.0 — `marketing-brain/` (Next.js 풀스택)
- **위치**: `marketing-brain/` 서브폴더
- **배포**: 🚧 **Vercel** — markter.vercel.app (Root Directory = `marketing-brain`)
- **상태**: Phase 1 골격 + TTS/Video 페이지 완료. Vercel env vars 마무리 중
- **스택**: Next.js 16.2.4 + React 19 + TypeScript + Tailwind 4 + Supabase
- **저장**: PostgreSQL (Supabase) + pgvector (의미 검색), 다중 사용자 ✓
- **인증**: Supabase Auth (Google OAuth 예정)
- **목적**: 프로덕션 SaaS — 영속 저장, 멀티 디바이스, 결제·권한·관제

### 2.3 마이그레이션 로드맵
```
[현재] v0.1 (GitHub Pages) ──┬── 둘 다 활성
                              │
        v1.0 (Vercel) ─🚧─────┘
                              │
[Phase 2-5 완료 시] ─────────►  v1.0이 v0.1 대체, GitHub Pages → Vercel 리다이렉트
```

---

## 3. v0.1 (index.html) — 완료 기능

| 기능 | 상태 | 비고 |
|---|---|---|
| 콘텐츠 생성 (22개 타입) | ✅ | OpenRouter FREE_MODELS fallback |
| 브랜드 프로필 (3종) | ✅ | 파책남 / 양양군 센터 / 비즈니스 |
| 카드뉴스 생성 | ✅ | Puter Flux 이미지 + 텍스트 |
| 영상 대본 생성 | ✅ | 씬 단위 자동 분할 |
| **TTS — 4 엔진** | ✅ | Microsoft Neural / Puter Polly / OpenAI TTS-HD / ElevenLabs |
| **숏폼 영상 메이커** | ✅ | Ken Burns + 4 자막 스타일 + BGM ducking + WebM/MP4 |
| **마케팅 지식 위키** | ✅ | Karpathy LLM Wiki, [[wikilinks]], 백링크 |
| Wiki Ingest/Query/Lint | ✅ | LLM 기반 |
| AI 자동 개선 루프 | ✅ | autoresearch (5축 평가 + 재생성 N회) |
| 위키 컨텍스트 자동 주입 | ✅ | buildPrompt 래퍼 |
| **위키 파일 업로드** | ✅ | Excel · PDF · CSV · Google Sheets (다중 엔드포인트 폴백) |
| **위키 지식 대시보드** | ✅ | 4 stat cards + 카테고리 분포 + 최근/공백/태그/출처 + 14일 히트맵 |
| **마케터 링크함** | ✅ | **NEW** 50+ 큐레이션 도구 (NotebookLM·AI Studio·Stitch·네이버·Canva·Suno 등) |
| 차트 분석 | ✅ | Chart.js |
| 위키 JSON 백업/복원 | ✅ | |
| experiments 로그 | ✅ | LocalStorage `flowai_experiments` |

### 3.1 위키 파일 업로드 상세 (방금 추가)
- **Excel (.xlsx/.xls)**: SheetJS 0.18.5, 시트당 1 페이지 → 마크다운 표
- **PDF**: PDF.js 3.11.174 UMD, 페이지별 텍스트 추출, 200쪽 안전 제한
- **CSV/TSV**: 따옴표 인용 셀 파싱, 100행 미리보기 제한
- **Google Sheets**: `export?format=csv&gid=...` URL 자동 호출 (공개 시트만)
- **TXT/MD**: 그대로 임포트
- **워크플로**: 파일 선택 → 분석 → 미리보기 모달 (제목·카테고리 편집 가능) → 선택적 저장

---

## 4. v1.0 (marketing-brain Next.js) — Phase 1 상태

### 4.1 인프라 (완료)
- ✅ Next.js 16.2.4 풀스택 골격
- ✅ Tailwind 4 + DM Sans + Noto Sans KR + 다크 테마 (시안 #00e5c8)
- ✅ shadcn/ui 스타일 수동 구현 (Button/Input/Card/Dialog/Label/Textarea/Badge)
- ✅ Supabase 클라이언트 3종 (browser / server / proxy)
- ✅ `proxy.ts` 세션 자동 갱신 (Next.js 16의 middleware)
- ✅ Supabase 마이그레이션 0001: 10 테이블 + RLS + pgvector (1536-dim)
  - profiles · wiki_pages · personas · competitors · trends · contents · campaigns · experiments · performance · coaching_logs

### 4.2 LLM 코어 (완료)
- ✅ `lib/llm/types.ts` — 22 ContentType, 6 ToneStyle, BrandProfile
- ✅ `lib/llm/prompts.ts` — TONE_MAP + TYPE_INSTRUCTIONS (v0.1 수동 이식)
- ✅ `lib/llm/profiles.ts` — INITIAL_PROFILES 3종
- ✅ `lib/llm/openrouter.ts` — FREE_MODELS 폴백 + 스트리밍 (async generator)
- ✅ `lib/llm/client.ts` — generate() / streamGenerate() (브라우저용)
- ✅ `app/api/generate/route.ts` — Node 런타임 SSE `data: {"delta":"..."}\n\n`

### 4.3 페이지 (현재 상태)
| 라우트 | 상태 | 설명 |
|---|---|---|
| `/dashboard` | 🔲 스텁 | KPI 카드 + 위크 인디케이터 예정 |
| `/insights` | 🔲 스텁 | 트렌드/패턴 시각화 예정 |
| `/wiki` | 🔲 스텁 | TipTap + pgvector 의미 검색 예정 |
| `/personas` | 🔲 스텁 | CRUD + AI 페르소나 생성 예정 |
| `/competitors` | 🔲 스텁 | 경쟁사 추적 + 분석 예정 |
| `/trends` | 🔲 스텁 | 시즌/이슈 트렌드 카드 예정 |
| `/studio` | 🔲 스텁 | 콘텐츠 스튜디오 (포팅 필요) |
| **`/tts`** | ✅ **완료** | 4 엔진 + Zustand store |
| **`/video`** | ✅ **완료** | Ken Burns + canvas + ffmpeg.wasm |
| `/coach` | 🔲 스텁 | 주간 패턴 분석 예정 |

### 4.4 Phase 1 완료 후 추가 작업 (방금 끝남)
- ✅ `/tts` — 풀 구현 (4 엔진 카드, SSML, 스피드/피치, 다운로드)
- ✅ `/video` — 풀 구현 (슬라이드 편집, Ken Burns, MediaRecorder, MP4)
- ✅ Zustand 스토어 `lib/stores/tts-video.ts` (TTS↔Video 크로스페이지 상태)
- ✅ 사이드바 업데이트: 생성 그룹에 Studio / TTS / Video 추가

---

## 5. 배포 상태

### 5.1 GitHub Pages (v0.1 — 활성)
- URL: https://okrangone98-oss.github.io/markter/
- 빌드: 자동 (main 브랜치 push 시)

### 5.2 Vercel (v1.0 — Redeploy 클릭만 남음)
- ✅ Step A: 프로젝트 import (Root Directory = `marketing-brain`)
- ✅ Step B: Supabase Integration 연결 (자동 주입된 변수 다수)
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (Sensitive)
  - `SUPABASE_JWT_SECRET` (Sensitive)
  - `POSTGRES_URL` (Sensitive)
- ✅ **Step C**: 수동 추가 완료 (Production + Preview, Sensitive)
  - `OPENROUTER_API_KEY` ✓
  - `NEXT_PUBLIC_APP_NAME` = `Marketing Brain` ✓
- 🚧 **Step D**: Redeploy 진행 중 — Deployments → ⋯ → Redeploy (Build Cache 해제)
- ❌ Step E (예정): markter.vercel.app 접속 → 사이드바·TTS·Video 페이지 동작 검증

> ℹ️ **Sensitive 토글 정책**: Vercel은 한 번 Sensitive로 켠 변수는 끌 수 없음. 우리 케이스에서는 문제 없음 — Production/Preview만 체크되어 있어도 markter.vercel.app(운영)은 정상 빌드됨. Development(로컬 vercel dev)는 사용 안 함.

### 5.3 Supabase
- 프로젝트 URL: `https://bsrmdvtyubjaekkreavs.supabase.co`
- ✅ 마이그레이션 0001 적용 완료 (10 테이블 보임)
- ❌ Auth providers (Google OAuth) 미설정
- ❌ Storage 버킷 (이미지/오디오) 미생성

---

## 6. 다음 단계 (Phase 2 로드맵)

### 6.1 즉시 처리 (배포 마무리)
1. Vercel Step C: env vars 2개 추가
2. Vercel Step D: Redeploy + 검증
3. Supabase Auth Google OAuth 설정 + 콜백 라우트 (`app/auth/callback`)

### 6.2 Phase 2: Brand Wiki 풀 구현
- TipTap 서버 사이드 에디터 (이미 dep 추가됨)
- pgvector 임베딩 자동 생성 (insert/update 트리거)
- `/api/wiki/ingest` · `/api/wiki/query` · `/api/wiki/lint` 라우트
- 위키 파일 업로드 (index.html에서 포팅: Excel/PDF/CSV/Sheets)

### 6.3 Phase 3: 페르소나/경쟁사
- CRUD UI + AI 페르소나 자동 생성 (인터뷰 텍스트 → 페르소나 카드)
- 경쟁사 SNS/뉴스 RSS 모니터링

### 6.4 Phase 4: 콘텐츠 스튜디오 포팅
- v0.1 생성 UI를 Next.js로 (서버 측 SSE)
- 자동 개선 루프 + 변형 A/B/C
- 위키/페르소나 컨텍스트 자동 주입 토글

### 6.5 Phase 5: 코치 + Insights
- 주간 패턴 분석 (좋은/나쁜 콘텐츠 클러스터링)
- 약점 진단 + 다음 콘텐츠 제안

### 6.6 추가 검토 중 (TTS/영상 강화)
- MeloTTS-Korean (HF Space Gradio 클라이언트, 무료)
- MMS-TTS (Transformers.js 오프라인)
- Whisper.cpp WASM (음성 파일 → 자동 자막)
- Pixabay BGM 프리셋

### 6.7 저장 한도 도달 시 외부 통합 (사용자 합의 — 보류)
- 현재: Supabase Free 500MB DB 로 충분 (텍스트만 저장)
- 향후 영상·고해상도 이미지 원본 보관 필요 시:
  - **Notion** workspace 무료 (대용량 문서·자료 보관)
  - **Cloudinary** 25GB 무료 (브랜드 자산 DAM)
- 위키 페이지 `source` 필드에 외부 URL 링크하는 방식

---

## 7. 기술 스택 요약

| 영역 | 도구 |
|---|---|
| 프론트엔드 | Next.js 16, React 19, Tailwind 4, shadcn/ui 스타일 |
| 백엔드 | Next.js API routes (nodejs runtime) |
| DB / Auth / Storage | Supabase (PostgreSQL + pgvector + Auth + Storage) |
| LLM | OpenRouter FREE_MODELS 폴백 (Gemini Flash, Llama 3.3, DeepSeek R1...) |
| 이미지/TTS (무료) | Puter.js (Flux/DALL-E/SDXL · Polly Neural) |
| TTS (유료) | OpenAI tts-1-hd · ElevenLabs eleven_multilingual_v2 |
| 영상 | Canvas API, MediaRecorder, ffmpeg.wasm (MP4) |
| 파일 파싱 | SheetJS (Excel) · PDF.js · 자체 CSV 파서 |
| 상태 관리 | Zustand |
| 배포 | GitHub Pages (v0.1) + Vercel (v1.0) |

---

## 8. 브랜치 전략

| 브랜치 | 상태 | 용도 |
|---|---|---|
| `main` | 안정 | GitHub Pages 배포 + Vercel main 환경 |
| `claude/marketing-brain-v1-phase1` | 머지됨 (#1) | Next.js 풀스택 골격 |
| `claude/add-tts-video-features-UEAy7` | **현재** | TTS+Video+Wiki 업로드 |

---

## 9. 자동 갱신 프로토콜

사용자가 **"개발현황"** 이라고 말하면 Claude는:

1. 현재 git 상태/최근 커밋/변경 파일 확인
2. 이 문서(`DEVELOPMENT_STATUS.md`)의 다음 섹션을 갱신:
   - "최종 갱신" 일자/브랜치
   - §3 v0.1 기능 표 (새 항목 추가/✅ 마킹)
   - §4 v1.0 페이지 표 (스텁 → ✅ 전환)
   - §5 배포 상태 (Step 진행도)
   - §6 다음 단계 (완료 항목 제거 + 새 항목 추가)
3. 커밋 메시지: `docs: 개발현황 갱신 (YYYY-MM-DD)`
4. 현재 브랜치에 푸시
5. 사용자에게 변경 요약 보고 (3-5줄)

이 문서만 보면 다른 세션/다른 플랫폼/다른 개발자도 즉시 컨텍스트를 회복할 수 있어야 합니다.

---

## 10. 빠른 시작 (다른 플랫폼에서 이어받을 때)

```bash
# 저장소 클론
git clone https://github.com/okrangone98-oss/markter.git
cd markter

# v0.1 (단일 HTML) — 즉시 사용
open index.html  # 또는 GitHub Pages 사용

# v1.0 (Next.js) — 로컬 개발
cd marketing-brain
npm install
cp .env.example .env.local  # Supabase + OpenRouter 키 입력
npm run dev

# 현재 작업 브랜치
git checkout claude/add-tts-video-features-UEAy7
```

**Supabase 키 발급**: 프로젝트 대시보드 → Settings → API
**OpenRouter 키 발급**: https://openrouter.ai/keys (무료, 신용카드 불필요)

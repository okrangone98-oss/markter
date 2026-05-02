# Marketing Brain — 작업 가이드 (Claude용)

## 프로젝트 컨텍스트

**저장소**: `okrangone98-oss/markter` · **로컬 경로 (Windows)**: `G:\01_프로젝트\개인프로젝트\marketer`

이 저장소는 **두 코드베이스가 병행** 운영됩니다 (의도된 마이그레이션 상태):

1. **`index.html`** (v0.1, 루트) — 단일 HTML, localStorage 기반 MVP
   - 배포: **GitHub Pages** (https://okrangone98-oss.github.io/markter/)
   - 즉시 사용 가능, 데모용

2. **`marketing-brain/`** (v1.0, 서브폴더) — Next.js 16 풀스택 + Supabase
   - 배포: **Vercel** (markter.vercel.app, Root Directory = `marketing-brain`)
   - 다중 사용자, 영속 저장, 프로덕션 타깃

v1.0이 feature parity에 도달하면 v0.1을 대체합니다. 그 전까지 둘 다 활성.

## 자동 갱신 트리거

### 🔄 "개발현황"

사용자가 **"개발현황"**(또는 "개발 현황", "상태 업데이트", "progress update") 이라고 말하면:

1. `git status`, `git log -10 --oneline`, 최근 변경 파일 확인
2. `DEVELOPMENT_STATUS.md`의 다음 섹션 갱신:
   - 헤더의 "최종 갱신" 일자 + 현재 브랜치
   - §3 v0.1 기능 표
   - §4 v1.0 페이지 표 (스텁 → ✅ 전환)
   - §5 배포 상태 (Step 진행도, 환경변수)
   - §6 다음 단계 (완료 항목 제거, 새 항목 추가)
3. 커밋 메시지: `docs: 개발현황 갱신 (YYYY-MM-DD)`
4. 현재 작업 브랜치에 푸시 (절대 main에 직접 푸시 금지)
5. 사용자에게 변경 요약 3-5줄 보고

목적: 다른 세션/다른 플랫폼/다른 개발자도 이 문서만 보고 즉시 컨텍스트를 회복할 수 있어야 함.

## 작업 원칙

- **품질 우선**: "부끄럽지 않게끔 퀄리티가 매력적이어야해" — 사용자 원칙
- **무료 우선**: 깃헙 트렌드/오픈소스 활용. OpenRouter FREE_MODELS, Puter.js, SheetJS, PDF.js 등
- **병렬 작업**: 독립적인 작업은 Agent 도구로 병렬 실행
- **Karpathy 패턴 준수**: LLM Wiki (gist) + autoresearch (자동 개선 루프)
- **브랜치 보호**: `main` 직접 푸시 금지. 항상 `claude/...` 브랜치 사용 후 PR

## 빠른 참조

- **PRD**: `PRD.md` (656 줄, 전체 비전)
- **현재 상태**: `DEVELOPMENT_STATUS.md`
- **Next.js 가이드**: `marketing-brain/AGENTS.md` (Next.js 16 = `proxy.ts` not `middleware.ts`)
- **DB 스키마**: `marketing-brain/supabase/migrations/0001_initial_schema.sql`
- **코딩 원칙 상세**: `.claude/skills/karpathy-guidelines/SKILL.md`
- **Before/After 패턴**: `docs/coding-examples.md`

---

## 🧠 코딩 원칙 (Andrej Karpathy Guidelines 통합)

> 출처: https://github.com/forrestchang/andrej-karpathy-skills · 사소한 작업에는 판단 사용
> **트레이드오프**: 이 원칙들은 속도보다 신중함을 우선시합니다.

### 1. Think Before Coding — 가정하지 말고 표면화

구현 전에:
- 가정을 명시적으로 진술. 불확실하면 질문.
- 여러 해석 가능성 있으면 모두 제시 (말없이 하나만 고르지 말 것).
- 더 단순한 접근이 있으면 말할 것. 정당하면 밀어내기.
- 불명확하면 멈춤. 무엇이 헷갈리는지 명명. 질문.

### 2. Simplicity First — 최소한의 코드

요청된 것만 해결하는 최소 코드:
- 요청되지 않은 기능 추가 금지
- 1회용 코드를 위한 추상화 금지
- 요청되지 않은 "유연성"·"설정 가능성" 금지
- 일어날 수 없는 시나리오에 대한 에러 핸들링 금지
- 200줄을 50줄로 줄일 수 있다면 다시 쓸 것

자문: "시니어 엔지니어가 과복잡하다고 할까?" 그렇다면 단순화.

### 3. Surgical Changes — 외과적 변경

기존 코드 편집 시:
- 인접 코드/주석/포매팅 "개선" 금지
- 망가지지 않은 것 리팩터 금지
- 기존 스타일 매칭 (네 취향과 달라도)
- 무관한 죽은 코드 발견 시 언급만, 삭제는 하지 말 것

테스트: 변경된 모든 줄은 사용자 요청에 직접 추적 가능해야 함.

### 4. Goal-Driven Execution — 검증 가능한 목표

작업을 검증 가능한 목표로 변환:
- "validation 추가" → "잘못된 입력 테스트 작성 후 통과시키기"
- "버그 수정" → "재현 테스트 작성 후 통과시키기"
- "X 리팩터" → "테스트가 전후 모두 통과하는지 확인"

다단계 작업은 간단한 계획 명시:
```
1. [단계] → 검증: [체크]
2. [단계] → 검증: [체크]
```

강한 성공 기준은 독립 루프를 가능하게 하고, 약한 기준은 끊임없는 명확화를 요구합니다.

---

**이 원칙이 작동하는 신호**: diff에서 불필요 변경 감소, 과복잡으로 인한 재작성 감소, 명확화 질문이 실수 후가 아닌 구현 전에 나옴.

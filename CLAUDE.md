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

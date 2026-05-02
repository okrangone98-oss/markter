-- ============================================================
-- Marketing Brain 초기 스키마 (v0.1)
-- ============================================================
-- 이 파일은 Supabase 프로젝트의 데이터베이스 구조를 만듭니다.
-- 실행 방법:
--   1) Supabase 대시보드 → SQL Editor 에 이 파일 내용을 붙여넣고 실행
--   2) 또는 Supabase CLI 사용 시: `supabase db push`
-- 모든 테이블은 사용자별 데이터 격리를 위해 RLS(Row Level Security)가
-- 활성화되어 있으며, 본인 데이터만 읽고 쓸 수 있도록 정책이 적용됩니다.
-- ============================================================

-- pgvector 확장 (의미 검색용 벡터 임베딩 저장)
create extension if not exists vector;

-- ============================================================
-- 1. profiles — 사용자 프로필 (Supabase Auth 의 auth.users 확장)
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  brand_name text,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- profiles 는 user_id 컬럼이 없고 id 가 곧 사용자 id 입니다.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- ============================================================
-- 2. wiki_pages — 브랜드 위키 (1-Layer: Knowledge)
-- ============================================================
create table if not exists public.wiki_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  category text,                  -- brand / persona / competitor / trend / pattern
  tags text[],
  embedding vector(1536),         -- pgvector 의미 검색용
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists wiki_pages_user_id_idx on public.wiki_pages(user_id);
create index if not exists wiki_pages_category_idx on public.wiki_pages(category);

alter table public.wiki_pages enable row level security;

drop policy if exists "wiki_pages_select_own" on public.wiki_pages;
create policy "wiki_pages_select_own"
  on public.wiki_pages for select
  using (auth.uid() = user_id);

drop policy if exists "wiki_pages_insert_own" on public.wiki_pages;
create policy "wiki_pages_insert_own"
  on public.wiki_pages for insert
  with check (auth.uid() = user_id);

drop policy if exists "wiki_pages_update_own" on public.wiki_pages;
create policy "wiki_pages_update_own"
  on public.wiki_pages for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "wiki_pages_delete_own" on public.wiki_pages;
create policy "wiki_pages_delete_own"
  on public.wiki_pages for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 3. personas — 타겟 페르소나
-- ============================================================
create table if not exists public.personas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text,                      -- 예: "30대 귀촌 관심 직장인"
  description text,
  pain_points text[],
  channels text[],
  voice_preference text,
  created_at timestamp with time zone default now()
);

create index if not exists personas_user_id_idx on public.personas(user_id);

alter table public.personas enable row level security;

drop policy if exists "personas_select_own" on public.personas;
create policy "personas_select_own"
  on public.personas for select
  using (auth.uid() = user_id);

drop policy if exists "personas_insert_own" on public.personas;
create policy "personas_insert_own"
  on public.personas for insert
  with check (auth.uid() = user_id);

drop policy if exists "personas_update_own" on public.personas;
create policy "personas_update_own"
  on public.personas for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "personas_delete_own" on public.personas;
create policy "personas_delete_own"
  on public.personas for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 4. competitors — 경쟁사 추적
-- ============================================================
create table if not exists public.competitors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text,
  url text,
  notes text,
  last_checked timestamp with time zone,
  created_at timestamp with time zone default now()
);

create index if not exists competitors_user_id_idx on public.competitors(user_id);

alter table public.competitors enable row level security;

drop policy if exists "competitors_select_own" on public.competitors;
create policy "competitors_select_own"
  on public.competitors for select
  using (auth.uid() = user_id);

drop policy if exists "competitors_insert_own" on public.competitors;
create policy "competitors_insert_own"
  on public.competitors for insert
  with check (auth.uid() = user_id);

drop policy if exists "competitors_update_own" on public.competitors;
create policy "competitors_update_own"
  on public.competitors for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "competitors_delete_own" on public.competitors;
create policy "competitors_delete_own"
  on public.competitors for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 5. trends — 트렌드 키워드
-- ============================================================
create table if not exists public.trends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  keyword text,
  source text,                    -- naver_datalab / x / instagram_hashtag
  score numeric,
  matched_brand boolean,
  detected_at timestamp with time zone default now()
);

create index if not exists trends_user_id_idx on public.trends(user_id);
create index if not exists trends_keyword_idx on public.trends(keyword);

alter table public.trends enable row level security;

drop policy if exists "trends_select_own" on public.trends;
create policy "trends_select_own"
  on public.trends for select
  using (auth.uid() = user_id);

drop policy if exists "trends_insert_own" on public.trends;
create policy "trends_insert_own"
  on public.trends for insert
  with check (auth.uid() = user_id);

drop policy if exists "trends_update_own" on public.trends;
create policy "trends_update_own"
  on public.trends for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "trends_delete_own" on public.trends;
create policy "trends_delete_own"
  on public.trends for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 6. contents — 생성된 콘텐츠 (2-Layer: Generation)
-- ============================================================
create table if not exists public.contents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text,                      -- blog / instagram / thread / etc
  topic text,
  body text,
  meta jsonb,                     -- tone, audience, keywords...
  context_pages uuid[],           -- 주입된 wiki_pages.id 배열
  refined_versions jsonb,         -- 자동 개선 시도들
  best_score numeric,
  status text,                    -- draft / published / archived
  published_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create index if not exists contents_user_id_idx on public.contents(user_id);
create index if not exists contents_status_idx on public.contents(status);

alter table public.contents enable row level security;

drop policy if exists "contents_select_own" on public.contents;
create policy "contents_select_own"
  on public.contents for select
  using (auth.uid() = user_id);

drop policy if exists "contents_insert_own" on public.contents;
create policy "contents_insert_own"
  on public.contents for insert
  with check (auth.uid() = user_id);

drop policy if exists "contents_update_own" on public.contents;
create policy "contents_update_own"
  on public.contents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "contents_delete_own" on public.contents;
create policy "contents_delete_own"
  on public.contents for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 7. campaigns — 통합 캠페인
-- ============================================================
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  brief text,
  content_ids uuid[],             -- 묶인 contents.id 배열
  schedule jsonb,                 -- 발행 캘린더
  status text,
  created_at timestamp with time zone default now()
);

create index if not exists campaigns_user_id_idx on public.campaigns(user_id);

alter table public.campaigns enable row level security;

drop policy if exists "campaigns_select_own" on public.campaigns;
create policy "campaigns_select_own"
  on public.campaigns for select
  using (auth.uid() = user_id);

drop policy if exists "campaigns_insert_own" on public.campaigns;
create policy "campaigns_insert_own"
  on public.campaigns for insert
  with check (auth.uid() = user_id);

drop policy if exists "campaigns_update_own" on public.campaigns;
create policy "campaigns_update_own"
  on public.campaigns for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "campaigns_delete_own" on public.campaigns;
create policy "campaigns_delete_own"
  on public.campaigns for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 8. experiments — 자동 개선 실험 (3-Layer: Intelligence)
-- ============================================================
create table if not exists public.experiments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  content_id uuid references public.contents(id) on delete cascade,
  prompt_version text,
  model text,
  output text,
  judge_score jsonb,              -- {hooking: 8, clarity: 7, tone: 9, cta: 6, seo: 8}
  judge_critique text,
  iteration int,
  created_at timestamp with time zone default now()
);

create index if not exists experiments_user_id_idx on public.experiments(user_id);
create index if not exists experiments_content_id_idx on public.experiments(content_id);

alter table public.experiments enable row level security;

drop policy if exists "experiments_select_own" on public.experiments;
create policy "experiments_select_own"
  on public.experiments for select
  using (auth.uid() = user_id);

drop policy if exists "experiments_insert_own" on public.experiments;
create policy "experiments_insert_own"
  on public.experiments for insert
  with check (auth.uid() = user_id);

drop policy if exists "experiments_update_own" on public.experiments;
create policy "experiments_update_own"
  on public.experiments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "experiments_delete_own" on public.experiments;
create policy "experiments_delete_own"
  on public.experiments for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 9. performance — 발행 성과
-- ============================================================
create table if not exists public.performance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  content_id uuid references public.contents(id) on delete cascade,
  url text,
  metrics jsonb,                  -- {views, likes, comments, shares}
  measured_at timestamp with time zone default now()
);

create index if not exists performance_user_id_idx on public.performance(user_id);
create index if not exists performance_content_id_idx on public.performance(content_id);

alter table public.performance enable row level security;

drop policy if exists "performance_select_own" on public.performance;
create policy "performance_select_own"
  on public.performance for select
  using (auth.uid() = user_id);

drop policy if exists "performance_insert_own" on public.performance;
create policy "performance_insert_own"
  on public.performance for insert
  with check (auth.uid() = user_id);

drop policy if exists "performance_update_own" on public.performance;
create policy "performance_update_own"
  on public.performance for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "performance_delete_own" on public.performance;
create policy "performance_delete_own"
  on public.performance for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 10. coaching_logs — 코칭 기록
-- ============================================================
create table if not exists public.coaching_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  weak_points text[],
  suggested_challenge text,
  completed boolean default false,
  created_at timestamp with time zone default now()
);

create index if not exists coaching_logs_user_id_idx on public.coaching_logs(user_id);

alter table public.coaching_logs enable row level security;

drop policy if exists "coaching_logs_select_own" on public.coaching_logs;
create policy "coaching_logs_select_own"
  on public.coaching_logs for select
  using (auth.uid() = user_id);

drop policy if exists "coaching_logs_insert_own" on public.coaching_logs;
create policy "coaching_logs_insert_own"
  on public.coaching_logs for insert
  with check (auth.uid() = user_id);

drop policy if exists "coaching_logs_update_own" on public.coaching_logs;
create policy "coaching_logs_update_own"
  on public.coaching_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "coaching_logs_delete_own" on public.coaching_logs;
create policy "coaching_logs_delete_own"
  on public.coaching_logs for delete
  using (auth.uid() = user_id);

-- ============================================================
-- updated_at 자동 갱신 트리거 (wiki_pages 만 사용)
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists wiki_pages_set_updated_at on public.wiki_pages;
create trigger wiki_pages_set_updated_at
  before update on public.wiki_pages
  for each row execute function public.set_updated_at();

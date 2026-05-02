-- 0003_user_api_keys.sql
-- 사용자별 외부 API 키 저장 (BYOK = Bring Your Own Key)
-- 키는 pgcrypto 의 pgp_sym_encrypt 로 저장. 복호화는 read RPC 에서만 수행.
-- 적용: Supabase SQL Editor 에서 이 파일 내용 붙여넣고 실행

create extension if not exists pgcrypto;

-- ── 테이블 ──
create table if not exists public.user_api_keys (
  user_id uuid primary key references auth.users(id) on delete cascade,
  -- 각 키는 pgp_sym_encrypt 로 bytea 저장. NULL = 미설정.
  openai bytea,
  anthropic bytea,
  replicate bytea,
  elevenlabs bytea,
  updated_at timestamptz not null default now()
);

-- ── RLS ──
alter table public.user_api_keys enable row level security;

drop policy if exists "user_api_keys_select_own" on public.user_api_keys;
create policy "user_api_keys_select_own"
  on public.user_api_keys for select
  using (auth.uid() = user_id);

drop policy if exists "user_api_keys_insert_own" on public.user_api_keys;
create policy "user_api_keys_insert_own"
  on public.user_api_keys for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_api_keys_update_own" on public.user_api_keys;
create policy "user_api_keys_update_own"
  on public.user_api_keys for update
  using (auth.uid() = user_id);

-- ── 암호화 키 (Supabase Vault 사용 권장이나 MVP 는 secret 컬럼으로) ──
-- 실제로는 Supabase 의 Vault Secrets 를 쓰는 것이 더 안전합니다.
-- 여기서는 service_role 만 접근 가능한 함수에서 환경변수를 사용합니다.

-- ── 키 마스킹된 상태 조회 (어떤 키가 설정되었는지만 보여줌, 실제 값은 노출 X) ──
create or replace function public.get_my_api_key_status()
returns table(
  has_openai boolean,
  has_anthropic boolean,
  has_replicate boolean,
  has_elevenlabs boolean,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    (openai is not null) as has_openai,
    (anthropic is not null) as has_anthropic,
    (replicate is not null) as has_replicate,
    (elevenlabs is not null) as has_elevenlabs,
    user_api_keys.updated_at
  from public.user_api_keys
  where user_id = auth.uid();
$$;

-- ── 평문 키 설정 함수 (라우트 핸들러에서만 호출) ──
-- 환경변수 SUPABASE_API_KEY_ENCRYPTION_SECRET 가 있어야 함.
create or replace function public.set_my_api_key(
  provider text,
  plain_key text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  enc_secret text := current_setting('app.api_key_encryption_secret', true);
  encrypted bytea;
begin
  if enc_secret is null or enc_secret = '' then
    raise exception 'app.api_key_encryption_secret 미설정 — Supabase 설정 필요';
  end if;

  if plain_key is null or plain_key = '' then
    -- 빈 문자열이면 삭제
    encrypted := null;
  else
    encrypted := pgp_sym_encrypt(plain_key, enc_secret);
  end if;

  insert into public.user_api_keys (user_id, openai, anthropic, replicate, elevenlabs)
  values (
    auth.uid(),
    case when provider = 'openai' then encrypted else null end,
    case when provider = 'anthropic' then encrypted else null end,
    case when provider = 'replicate' then encrypted else null end,
    case when provider = 'elevenlabs' then encrypted else null end
  )
  on conflict (user_id) do update
  set
    openai = case when provider = 'openai' then excluded.openai else user_api_keys.openai end,
    anthropic = case when provider = 'anthropic' then excluded.anthropic else user_api_keys.anthropic end,
    replicate = case when provider = 'replicate' then excluded.replicate else user_api_keys.replicate end,
    elevenlabs = case when provider = 'elevenlabs' then excluded.elevenlabs else user_api_keys.elevenlabs end,
    updated_at = now();
end;
$$;

-- ── 평문 키 가져오기 (서버 라우트 전용 — 절대 클라이언트 노출 금지) ──
create or replace function public.get_my_api_key(provider text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  enc_secret text := current_setting('app.api_key_encryption_secret', true);
  ciphertext bytea;
begin
  if enc_secret is null or enc_secret = '' then
    return null;
  end if;

  select
    case provider
      when 'openai' then openai
      when 'anthropic' then anthropic
      when 'replicate' then replicate
      when 'elevenlabs' then elevenlabs
      else null
    end
  into ciphertext
  from public.user_api_keys
  where user_id = auth.uid();

  if ciphertext is null then return null; end if;
  return pgp_sym_decrypt(ciphertext, enc_secret);
end;
$$;

-- ── updated_at 자동 갱신 ──
create or replace function public.set_user_api_keys_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists user_api_keys_set_updated_at on public.user_api_keys;
create trigger user_api_keys_set_updated_at
  before update on public.user_api_keys
  for each row execute function public.set_user_api_keys_updated_at();

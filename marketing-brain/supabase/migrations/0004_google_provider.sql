-- 0004_google_provider.sql
-- Google AI Studio (Gemini API + Gemma 모델) 키 추가
-- 0003 적용 완료 후 실행

alter table public.user_api_keys
  add column if not exists google bytea;

-- ── 마스킹 상태 RPC 갱신 (google 추가) ──
create or replace function public.get_my_api_key_status()
returns table(
  has_openai boolean,
  has_anthropic boolean,
  has_google boolean,
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
    (google is not null) as has_google,
    (replicate is not null) as has_replicate,
    (elevenlabs is not null) as has_elevenlabs,
    user_api_keys.updated_at
  from public.user_api_keys
  where user_id = auth.uid();
$$;

-- ── set_my_api_key 갱신 (google 분기 추가) ──
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
    encrypted := null;
  else
    encrypted := pgp_sym_encrypt(plain_key, enc_secret);
  end if;

  insert into public.user_api_keys (user_id, openai, anthropic, google, replicate, elevenlabs)
  values (
    auth.uid(),
    case when provider = 'openai' then encrypted else null end,
    case when provider = 'anthropic' then encrypted else null end,
    case when provider = 'google' then encrypted else null end,
    case when provider = 'replicate' then encrypted else null end,
    case when provider = 'elevenlabs' then encrypted else null end
  )
  on conflict (user_id) do update
  set
    openai = case when provider = 'openai' then excluded.openai else user_api_keys.openai end,
    anthropic = case when provider = 'anthropic' then excluded.anthropic else user_api_keys.anthropic end,
    google = case when provider = 'google' then excluded.google else user_api_keys.google end,
    replicate = case when provider = 'replicate' then excluded.replicate else user_api_keys.replicate end,
    elevenlabs = case when provider = 'elevenlabs' then excluded.elevenlabs else user_api_keys.elevenlabs end,
    updated_at = now();
end;
$$;

-- ── get_my_api_key 갱신 (google 분기 추가) ──
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
      when 'google' then google
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

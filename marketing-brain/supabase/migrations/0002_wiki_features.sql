-- 0002_wiki_features.sql
-- 위키 페이지에 source(출처 파일/URL) 컬럼 추가 + pgvector ivfflat 인덱스
-- 적용: Supabase SQL Editor 에서 이 파일 내용 붙여넣고 실행

alter table public.wiki_pages
  add column if not exists source text;

create index if not exists wiki_pages_source_idx
  on public.wiki_pages(source) where source is not null;

create index if not exists wiki_pages_updated_at_idx
  on public.wiki_pages(updated_at desc);

-- pgvector ivfflat 인덱스 (의미 검색용, lists=100은 100K 행 미만에 적절)
-- 임베딩 데이터가 없을 때는 인덱스 생성을 시도하지 않음
do $$
begin
  if exists (select 1 from public.wiki_pages where embedding is not null limit 1) then
    create index if not exists wiki_pages_embedding_idx
      on public.wiki_pages
      using ivfflat (embedding vector_cosine_ops)
      with (lists = 100);
  end if;
end $$;

-- updated_at 자동 갱신 트리거 (이미 있으면 스킵)
create or replace function public.set_wiki_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists wiki_pages_set_updated_at on public.wiki_pages;
create trigger wiki_pages_set_updated_at
  before update on public.wiki_pages
  for each row execute function public.set_wiki_updated_at();

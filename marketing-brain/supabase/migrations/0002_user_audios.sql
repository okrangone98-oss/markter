-- 0002_user_audios.sql
create table if not exists public.user_audios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  engine text,
  storage_path text not null,
  public_url text not null,
  created_at timestamp with time zone default now()
);

alter table public.user_audios enable row level security;

create policy "user_audios_select_own" on public.user_audios for select using (auth.uid() = user_id);
create policy "user_audios_insert_own" on public.user_audios for insert with check (auth.uid() = user_id);
create policy "user_audios_delete_own" on public.user_audios for delete using (auth.uid() = user_id);

-- Storage bucket for audios
insert into storage.buckets (id, name, public) values ('audios', 'audios', true) on conflict do nothing;

create policy "audios_select_own" on storage.objects for select using ( bucket_id = 'audios' and auth.uid()::text = (storage.foldername(name))[1] );
create policy "audios_insert_own" on storage.objects for insert with check ( bucket_id = 'audios' and auth.uid()::text = (storage.foldername(name))[1] );
create policy "audios_delete_own" on storage.objects for delete using ( bucket_id = 'audios' and auth.uid()::text = (storage.foldername(name))[1] );

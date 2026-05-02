# Audio CRUD & Storage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement CRUD and download features for generated TTS audios so they can be saved, managed, and reused in the Video Maker.

**Architecture:** We will create a `user_audios` table and an `audios` storage bucket in Supabase. The TTS page will allow uploading the generated `Blob` to Storage, saving metadata to the table. We will create an Audio Library sidebar/tab to view, play, and delete saved audios, and select them for the Video Maker using the existing `useTTSVideoStore`.

**Tech Stack:** Next.js 16 (App Router), Supabase Storage & Database, Zustand, Tailwind CSS, shadcn/ui.

---

### Task 1: Supabase Database Migration (Table & Bucket)

**Files:**
- Create: `supabase/migrations/0002_user_audios.sql`

- [ ] **Step 1: Write the migration script**
Create the `user_audios` table and the `audios` storage bucket with appropriate RLS policies.

```sql
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
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/0002_user_audios.sql
git commit -m "feat(db): add user_audios table and audios storage bucket"
```

### Task 2: Create Supabase Audio Client Operations

**Files:**
- Create: `lib/supabase/audios.ts`

- [ ] **Step 1: Implement upload, fetch, and delete functions**

```typescript
import { createBrowserClient } from '@/lib/supabase/client';

export interface UserAudio {
  id: string;
  user_id: string;
  title: string;
  engine: string;
  storage_path: string;
  public_url: string;
  created_at: string;
}

export async function uploadAudio(blob: Blob, title: string, engine: string, userId: string): Promise<UserAudio> {
  const supabase = createBrowserClient();
  const ext = blob.type.includes("mpeg") ? "mp3" : "wav";
  const fileName = `${userId}/${Date.now()}_${title.replace(/[^a-z0-9]/gi, '_')}.${ext}`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('audios')
    .upload(fileName, blob, { contentType: blob.type });
    
  if (uploadError) throw uploadError;
  
  const { data: publicUrlData } = supabase.storage.from('audios').getPublicUrl(fileName);
  
  const { data: record, error: dbError } = await supabase
    .from('user_audios')
    .insert({
      user_id: userId,
      title,
      engine,
      storage_path: fileName,
      public_url: publicUrlData.publicUrl
    })
    .select()
    .single();
    
  if (dbError) throw dbError;
  return record as UserAudio;
}

export async function fetchUserAudios(): Promise<UserAudio[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.from('user_audios').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as UserAudio[];
}

export async function deleteUserAudio(id: string, storagePath: string): Promise<void> {
  const supabase = createBrowserClient();
  await supabase.storage.from('audios').remove([storagePath]);
  const { error } = await supabase.from('user_audios').delete().eq('id', id);
  if (error) throw error;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/supabase/audios.ts
git commit -m "feat(db): add supabase audio CRUD operations"
```

### Task 3: Update TTS Page & Add Audio Library UI

**Files:**
- Modify: `app/(app)/tts/page.tsx`

- [ ] **Step 1: Add Library UI and Save functionality**
Integrate the `uploadAudio`, `fetchUserAudios`, and `deleteUserAudio` functions. Add a "Save to Library" button in the result actions, and a sidebar or section to list existing audios. (Due to length, I will use `replace_file_content` or `multi_replace_file_content` to inject these components into the existing page).

- [ ] **Step 2: Test the UI**
Verify that the `Save to Library` button uploads the blob and updates the list.
Verify that clicking an item in the list sets it as the active audio in `useTTSVideoStore` so it can be used in the Video Maker.

- [ ] **Step 3: Commit**

```bash
git add app/(app)/tts/page.tsx
git commit -m "feat(ui): add audio library CRUD and save features"
```

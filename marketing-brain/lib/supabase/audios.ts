import { createClient } from '@/lib/supabase/client';

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
  const supabase = createClient();
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
  const supabase = createClient();
  const { data, error } = await supabase.from('user_audios').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as UserAudio[];
}

export async function deleteUserAudio(id: string, storagePath: string): Promise<void> {
  const supabase = createClient();
  await supabase.storage.from('audios').remove([storagePath]);
  const { error } = await supabase.from('user_audios').delete().eq('id', id);
  if (error) throw error;
}

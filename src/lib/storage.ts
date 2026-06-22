import { supabase } from '@/lib/supabase';

/**
 * Upload an avatar image to Supabase Storage and return the public URL.
 * Always resolves or rejects — no infinite hangs.
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `avatar-${Date.now()}.${ext}`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`Avatar upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

  if (!urlData?.publicUrl) {
    throw new Error('Failed to retrieve avatar public URL');
  }

  return urlData.publicUrl;
}

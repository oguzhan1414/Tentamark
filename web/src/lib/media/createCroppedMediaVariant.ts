import { createClient } from "@/lib/supabase/client";
import { cropImageToRatio } from "./cropToRatio";

type SupabaseBrowserClient = ReturnType<typeof createClient>;

/*
  Uploads a center-cropped variant of an existing media row (see
  cropImageToRatio) and returns its new media.id — or null when no crop was
  needed (source already close enough to targetRatio) or the crop failed for
  any reason. Callers fall back to the original media in either case; a
  format-adaptation step is never worth blocking the whole submit over.
*/
export async function createCroppedMediaVariant(opts: {
  supabase: SupabaseBrowserClient;
  brandId: string;
  sourceMediaId: string;
  sourceUrl: string;
  targetRatio: number;
}): Promise<string | null> {
  const blob = await cropImageToRatio(opts.sourceUrl, opts.targetRatio);
  if (!blob) return null;

  const path = `${opts.brandId}/${crypto.randomUUID()}-crop.jpg`;
  const { error: uploadError } = await opts.supabase.storage
    .from("media")
    .upload(path, blob, { contentType: "image/jpeg" });
  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrl } = opts.supabase.storage.from("media").getPublicUrl(path);
  const { data: mediaRow, error: mediaError } = await opts.supabase
    .from("media")
    .insert({
      brand_id: opts.brandId,
      file_name: "platform-crop.jpg",
      file_url: publicUrl.publicUrl,
      file_type: "image/jpeg",
      file_size: blob.size,
      derived_from_media_id: opts.sourceMediaId,
    })
    .select("id")
    .single();
  if (mediaError || !mediaRow) throw new Error(mediaError?.message ?? "Kırpılmış medya kaydedilemedi.");
  return mediaRow.id;
}

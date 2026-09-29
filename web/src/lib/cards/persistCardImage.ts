import type { createClient } from "@/lib/supabase/server";
import type { ImageDimensions } from "./renderHtmlToImage";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// The one place every card type's render output gets turned into a real
// Medya Kütüphanesi row — same bucket/path convention as everywhere else
// in the app (${brandId}/${uuid}-name.png), so a generated card is
// indistinguishable from a manually uploaded image to every other feature
// (Calendar, Compose, Posts) that reads from `media`.
export async function persistCardImage(
  supabase: SupabaseServerClient,
  brandId: string,
  buffer: Buffer,
  dimensions: ImageDimensions,
  fileNamePrefix: string
): Promise<{ mediaId: string; fileUrl: string }> {
  const path = `${brandId}/${crypto.randomUUID()}-${fileNamePrefix}.png`;

  const { error: uploadError } = await supabase.storage.from("media").upload(path, buffer, { contentType: "image/png" });
  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(path);

  const { data: mediaRow, error: mediaError } = await supabase
    .from("media")
    .insert({
      brand_id: brandId,
      file_name: `${fileNamePrefix}.png`,
      file_url: publicUrl.publicUrl,
      file_type: "image/png",
      file_size: buffer.byteLength,
      dimensions,
    })
    .select("id, file_url")
    .single();
  if (mediaError || !mediaRow) throw new Error(mediaError?.message ?? "Görsel medya kütüphanesine eklenemedi.");

  return { mediaId: mediaRow.id, fileUrl: mediaRow.file_url };
}

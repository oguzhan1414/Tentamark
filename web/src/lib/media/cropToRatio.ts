"use client";

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Supabase Storage's public "media" bucket sends CORS headers, needed
    // here so drawing it onto a canvas doesn't taint it — a tainted canvas
    // refuses toBlob() with a SecurityError instead of failing loudly at
    // the crossOrigin assignment itself.
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Görsel yüklenemedi (kırpma için)."));
    img.src = url;
  });
}

/*
  Center-crops a source image to the given width/height ratio and returns
  the result as a JPEG Blob. Returns null when the source is already close
  enough to the target ratio (within `tolerance`) that cropping would just
  be a lossy no-op — callers treat null as "use the original as-is".
*/
export async function cropImageToRatio(
  sourceUrl: string,
  targetRatio: number,
  tolerance = 0.08
): Promise<Blob | null> {
  const img = await loadImage(sourceUrl);
  const sourceRatio = img.naturalWidth / img.naturalHeight;
  if (Math.abs(sourceRatio - targetRatio) / targetRatio < tolerance) return null;

  let cropWidth = img.naturalWidth;
  let cropHeight = img.naturalHeight;
  if (sourceRatio > targetRatio) {
    // Source is wider than the target — crop the left/right edges.
    cropWidth = Math.round(img.naturalHeight * targetRatio);
  } else {
    // Source is taller than the target — crop the top/bottom edges.
    cropHeight = Math.round(img.naturalWidth / targetRatio);
  }
  const sx = Math.round((img.naturalWidth - cropWidth) / 2);
  const sy = Math.round((img.naturalHeight - cropHeight) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, sx, sy, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Kırpma canvas'tan görsele çevrilemedi."))),
      "image/jpeg",
      0.92
    );
  });
}

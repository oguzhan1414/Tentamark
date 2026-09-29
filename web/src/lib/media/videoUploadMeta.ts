// Runs entirely in the browser, right when a user picks a video file to
// upload — the file is already local at this point, so there's no reason to
// round-trip through a server (ffmpeg, mediabunny, anything) just to read a
// duration or grab a thumbnail frame. Mirrors the existing
// compressImageFile() pattern in dashboard/image/page.tsx (FileReader→Image→
// Canvas), just for video (off-DOM <video>→seek→Canvas).
const POSTER_TIMEOUT_MS = 8000;

export type VideoUploadMeta = {
  width: number;
  height: number;
  durationSeconds: number;
  posterBlob: Blob | null;
};

export async function extractVideoMetadataAndPoster(file: File): Promise<VideoUploadMeta> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.src = url;

  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Video metadata timeout")), POSTER_TIMEOUT_MS);
      video.onloadedmetadata = () => {
        clearTimeout(timer);
        resolve();
      };
      video.onerror = () => {
        clearTimeout(timer);
        reject(new Error("Video okunamadı"));
      };
    });

    const width = video.videoWidth;
    const height = video.videoHeight;
    const durationSeconds = Number.isFinite(video.duration) ? video.duration : 0;

    let posterBlob: Blob | null = null;
    try {
      const seekTime = Math.min(1, durationSeconds / 2 || 0);
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Poster seek timeout")), POSTER_TIMEOUT_MS);
        video.onseeked = () => {
          clearTimeout(timer);
          resolve();
        };
        video.currentTime = seekTime;
      });

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx && width > 0 && height > 0) {
        ctx.drawImage(video, 0, 0, width, height);
        posterBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
      }
    } catch (err) {
      // Poster is a nice-to-have thumbnail, not required for the upload to
      // succeed — a seek/draw failure on an unusual codec just means no
      // poster_url gets set, same as today's behavior.
      console.warn("Video poster üretilemedi:", err);
    }

    return { width, height, durationSeconds, posterBlob };
  } finally {
    URL.revokeObjectURL(url);
  }
}

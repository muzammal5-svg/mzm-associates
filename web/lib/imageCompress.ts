/**
 * Client-side image compression using Canvas API.
 * Falls back to original file if browser doesn't support Canvas.
 */
export interface CompressOptions {
  maxWidthPx?:  number;   // default 1920
  maxHeightPx?: number;   // default 1920
  qualityJpeg?: number;   // 0–1, default 0.82
  maxSizeBytes?: number;  // default 2 MB
}

export async function compressImage(
  file: File,
  opts: CompressOptions = {}
): Promise<File> {
  const {
    maxWidthPx  = 1920,
    maxHeightPx = 1920,
    qualityJpeg = 0.82,
    maxSizeBytes = 2 * 1024 * 1024,
  } = opts;

  // Only compress images; skip PDFs, docs, etc.
  if (!file.type.startsWith("image/")) return file;
  // Skip if already small enough
  if (file.size <= maxSizeBytes) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const ratio = Math.min(maxWidthPx / width, maxHeightPx / height, 1);
      width  = Math.round(width  * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
            type: "image/jpeg",
            lastModified: Date.now(),
          }));
        },
        "image/jpeg",
        qualityJpeg
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg", "image/png", "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const ALLOWED_MIME_ACCEPT = ALLOWED_MIME_TYPES.join(",");
export const MAX_FILE_SIZE       = 50 * 1024 * 1024; // 50 MB

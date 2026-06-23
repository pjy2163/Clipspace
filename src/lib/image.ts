import type { ClipboardEvent as ReactClipboardEvent } from "react";
import type { ClipImage } from "@/types/clip";

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

export function isAllowedImageType(type: string) {
  return ALLOWED_IMAGE_TYPES.has(type);
}

export function readImageBlob(blob: Blob, fileName?: string) {
  return new Promise<ClipImage>((resolve, reject) => {
    if (!isAllowedImageType(blob.type)) {
      reject(new Error(`Unsupported image type: ${blob.type || "unknown"}`));
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Unable to read image"));
        return;
      }
      resolve({
        dataUrl: reader.result,
        mimeType: blob.type || "image/png",
        fileName,
        size: blob.size,
      });
    });
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(blob);
  });
}

export function getPastedImageFiles(event: ClipboardEvent | ReactClipboardEvent) {
  const items = Array.from(event.clipboardData?.items ?? []);
  return items
    .filter((item) => item.kind === "file" && isAllowedImageType(item.type))
    .map((item) => item.getAsFile())
    .filter((file): file is File => Boolean(file));
}

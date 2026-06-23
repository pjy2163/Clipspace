import type { Clip } from "@/types/clip";

export async function copyClipToClipboard(clip: Clip) {
  await navigator.clipboard.writeText(clip.content || clip.title);
  return "copied";
}

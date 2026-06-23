import type { Clip } from "@/types/clip";

export function clipToMarkdown(clip: Clip) {
  const lines = [`## ${clip.title}`, "", `- Type: ${clip.type}`, `- Category: ${clip.category}`];

  if (clip.type === "image") {
    lines.push("- Content: Image clip");
    if (clip.image?.mimeType) lines.push(`- Image type: ${clip.image.mimeType}`);
  } else {
    lines.push("", "```", clip.content, "```");
  }

  const notes = clip.notes ?? [];
  if (notes.length > 0) {
    lines.push("", "### Memos");
    notes.forEach((note) => {
      const suffix = note.image ? " [image]" : "";
      lines.push(`- ${note.text || "Image memo"}${suffix}`);
    });
  }

  return lines.join("\n");
}

export async function shareClip(clip: Clip) {
  const markdown = clipToMarkdown(clip);
  if (navigator.share) {
    await navigator.share({
      title: clip.title,
      text: markdown,
    });
    return "shared";
  }

  await navigator.clipboard.writeText(markdown);
  return "copied";
}

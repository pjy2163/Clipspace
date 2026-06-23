import type { Clip, ClipImage, ClipSource, ClipType, WorkspaceCopy, WorkspaceMode } from "@/types/clip";

export const workspaceCopy: Record<WorkspaceMode, WorkspaceCopy> = {
  personal: {
    label: "개인",
    title: "Personal clipboard",
    description: "내가 복사한 메모, 코드, 링크를 혼자 쓰는 작업 로그로 정리합니다.",
    empty: "개인 클립보드가 비어 있어요",
    status: "개인 보드에 저장했어요.",
  },
  team: {
    label: "팀",
    title: "Team research board",
    description: "팀 프로젝트에서 같이 볼 자료, 레퍼런스, 코드 조각을 모으는 공간입니다.",
    empty: "팀 자료 보드가 비어 있어요",
    status: "팀 자료 보드에 저장했어요.",
  },
};

export const typeLabels: Record<ClipType, string> = {
  text: "텍스트",
  link: "링크",
  code: "코드",
  contact: "연락처",
  sensitive: "민감",
  image: "이미지",
};

export const typeTone: Record<ClipType, string> = {
  text: "border-slate-200 bg-slate-50 text-slate-700",
  link: "border-blue-200 bg-blue-50 text-blue-700",
  code: "border-violet-200 bg-violet-50 text-violet-700",
  contact: "border-emerald-200 bg-emerald-50 text-emerald-700",
  sensitive: "border-amber-200 bg-amber-50 text-amber-800",
  image: "border-rose-200 bg-rose-50 text-rose-700",
};

export function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function normalizeContent(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function extractFirstUrl(content: string) {
  const match = content.match(/https?:\/\/[^\s)]+|www\.[^\s)]+/i);
  if (!match) return null;
  return match[0].replace(/[.,;!?]+$/, "");
}

function titleCaseFromSlug(value: string) {
  let decodedValue = value;
  try {
    decodedValue = decodeURIComponent(value);
  } catch {
    decodedValue = value;
  }

  const decoded = decodedValue
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .replace(/[-_+]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!decoded) return "";
  return decoded
    .split(" ")
    .map((word) => (word.length > 2 ? `${word[0].toUpperCase()}${word.slice(1)}` : word))
    .join(" ");
}

export function inferLinkTitle(content: string) {
  const extracted = extractFirstUrl(content);
  if (!extracted) return "Saved link";

  try {
    const url = new URL(extracted.startsWith("www.") ? `https://${extracted}` : extracted);
    const host = url.hostname.replace(/^www\./, "");
    const pathParts = url.pathname
      .split("/")
      .map((part) => titleCaseFromSlug(part))
      .filter((part) => part && !/^\d+$/.test(part));
    const topic = pathParts.at(-1);
    return topic ? `${topic} · ${host}` : host;
  } catch {
    return "Saved link";
  }
}

export function detectType(content: string): ClipType {
  const trimmed = content.trim();
  if (
    /\b\d{3,4}[- ]?\d{3,4}[- ]?\d{4}\b/.test(trimmed) ||
    /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/.test(trimmed) ||
    /(api[_-]?key|secret|token|password|passwd|bearer\s+[a-z0-9._-]+)/i.test(trimmed)
  ) {
    return "sensitive";
  }
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(trimmed)) return "contact";
  if (isLikelyCode(trimmed)) return "code";
  if (extractFirstUrl(trimmed)) return "link";
  return "text";
}

function isLikelyCode(content: string) {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const sample = content.slice(0, 6000);
  const codeSignals = [
    /^\s*(import|export|from|const|let|var|function|class|interface|type)\b/m,
    /^\s*(def|class|from|import|if __name__|async def)\b/m,
    /^\s*(public|private|protected|static|final|void|class|package)\b/m,
    /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|WITH)\b/im,
    /^\s*(git|npm|pnpm|yarn|node|python|pip|docker|kubectl)\s+/m,
    /<\/?[a-z][\s\S]*>/i,
    /[{;}]\s*$/,
    /=>|===|!==|::|&&|\|\||console\.|print\(|fmt\.|std::/,
    /^\s*[-\w.]+:\s*["'{\[]/m,
    /^\s*(@\w+|#include|use\s+\w+|func\s+\w+|package\s+\w+)/m,
  ];
  const signalCount = codeSignals.filter((pattern) => pattern.test(sample)).length;
  const indentedLines = lines.filter((line) => /^\s{2,}\S/.test(line)).length;
  const bracketLines = lines.filter((line) => /[{}();<>[\]]/.test(line)).length;
  const codeDensity =
    lines.length > 0 ? (indentedLines + bracketLines) / Math.max(lines.length, 1) : 0;

  return signalCount >= 2 || (lines.length >= 3 && signalCount >= 1 && codeDensity > 0.35);
}

export function makeCategory(type: ClipType, content: string) {
  if (type === "image") return "Images";
  if (type === "link") return "Reference";
  if (type === "code") return "Code";
  if (type === "contact") return "People";
  if (type === "sensitive") return "Review";
  if (/회의|일정|meeting|calendar|schedule/i.test(content)) return "Work";
  if (/아이디어|idea|todo|해야|할일/i.test(content)) return "Ideas";
  return "Notes";
}

export function makeTitle(content: string, type: ClipType) {
  const firstLine = content.trim().split(/\r?\n/).find(Boolean) ?? "Untitled";
  const cleaned = firstLine.replace(/^[-*#>\s]+/, "").trim();
  if (type === "image") return cleaned || "Pasted image";
  if (type === "link") return inferLinkTitle(cleaned);
  if (type === "code") {
    const namedLine = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) =>
        /^(function|class|interface|type|const|let|def|public|private|SELECT|CREATE)\b/i.test(
          line,
        ),
      );
    if (namedLine) return namedLine.length > 58 ? `${namedLine.slice(0, 58)}...` : namedLine;
  }
  return cleaned.length > 58 ? `${cleaned.slice(0, 58)}...` : cleaned;
}

export function createClip(content: string, source: ClipSource): Clip | null {
  const trimmed = content.trim();
  if (!trimmed) return null;
  const type = detectType(trimmed);
  return {
    id: makeId(),
    content: trimmed,
    title: makeTitle(trimmed, type),
    type,
    category: makeCategory(type, trimmed),
    createdAt: new Date().toISOString(),
    source,
    favorite: false,
    flagged: type === "sensitive",
    notes: [],
  };
}

export function createImageClip(image: ClipImage, source: ClipSource): Clip {
  const content = image.fileName || `Image ${new Date().toLocaleString("ko-KR")}`;
  return {
    id: makeId(),
    content,
    title: image.fileName || "Pasted image",
    type: "image",
    category: "Images",
    createdAt: new Date().toISOString(),
    source,
    favorite: false,
    flagged: false,
    notes: [],
    image,
  };
}

export function refreshClipClassification(clip: Clip): Clip {
  const type = clip.image ? "image" : detectType(clip.content);
  const legacyNote = clip.note?.trim();
  const notes =
    clip.notes ??
    (legacyNote
      ? [
          {
            id: makeId(),
            text: legacyNote,
            createdAt: clip.createdAt,
          },
        ]
      : []);

  return {
    ...clip,
    title: makeTitle(clip.content, type),
    type,
    category: makeCategory(type, clip.content),
    flagged: type === "sensitive",
    note: undefined,
    notes,
  };
}

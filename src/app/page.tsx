"use client";

import { useEffect, useMemo, useState } from "react";

type ClipType = "text" | "link" | "code" | "contact" | "sensitive";

type Clip = {
  id: string;
  content: string;
  title: string;
  type: ClipType;
  category: string;
  createdAt: string;
  source: "paste" | "clipboard" | "manual";
  favorite: boolean;
  flagged: boolean;
};

const STORAGE_KEY = "cliplog.clips.v1";

const typeLabels: Record<ClipType, string> = {
  text: "텍스트",
  link: "링크",
  code: "코드",
  contact: "연락처",
  sensitive: "민감",
};

const typeTone: Record<ClipType, string> = {
  text: "border-slate-200 bg-slate-50 text-slate-700",
  link: "border-blue-200 bg-blue-50 text-blue-700",
  code: "border-violet-200 bg-violet-50 text-violet-700",
  contact: "border-emerald-200 bg-emerald-50 text-emerald-700",
  sensitive: "border-amber-200 bg-amber-50 text-amber-800",
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeContent(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function detectType(content: string): ClipType {
  const trimmed = content.trim();
  if (
    /\b\d{3,4}[- ]?\d{3,4}[- ]?\d{4}\b/.test(trimmed) ||
    /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/.test(trimmed) ||
    /(api[_-]?key|secret|token|password|passwd|bearer\s+[a-z0-9._-]+)/i.test(
      trimmed,
    )
  ) {
    return "sensitive";
  }
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(trimmed)) {
    return "contact";
  }
  if (isLikelyCode(trimmed)) return "code";
  if (/https?:\/\/|www\./i.test(trimmed)) return "link";
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

function makeCategory(type: ClipType, content: string) {
  if (type === "link") return "Reference";
  if (type === "code") return "Code";
  if (type === "contact") return "People";
  if (type === "sensitive") return "Review";
  if (/회의|일정|meeting|calendar|schedule/i.test(content)) return "Work";
  if (/아이디어|idea|todo|해야|할일/i.test(content)) return "Ideas";
  return "Notes";
}

function makeTitle(content: string, type: ClipType) {
  const firstLine = content.trim().split(/\r?\n/).find(Boolean) ?? "Untitled";
  const cleaned = firstLine.replace(/^[-*#>\s]+/, "").trim();
  if (type === "link") {
    try {
      const url = new URL(cleaned.startsWith("www.") ? `https://${cleaned}` : cleaned);
      return url.hostname.replace(/^www\./, "");
    } catch {
      return "Saved link";
    }
  }
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

function createClip(content: string, source: Clip["source"]): Clip | null {
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
  };
}

function refreshClipClassification(clip: Clip): Clip {
  const type = detectType(clip.content);
  return {
    ...clip,
    title: makeTitle(clip.content, type),
    type,
    category: makeCategory(type, clip.content),
    flagged: type === "sensitive",
  };
}

function loadStoredClips() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as Clip[]).map(refreshClipClassification);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === "textarea" || tagName === "input" || target.isContentEditable;
}

function formatDay(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(date));
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function clipPreviewMeta(content: string) {
  return {
    characters: new Intl.NumberFormat("ko-KR").format(content.length),
    lines: new Intl.NumberFormat("ko-KR").format(content.split(/\r?\n/).length),
  };
}

export default function Home() {
  const [clips, setClips] = useState<Clip[]>(loadStoredClips);
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<ClipType | "all">("all");
  const [status, setStatus] = useState("복사한 뒤 이 화면을 클릭하거나 Cmd/Ctrl + V를 누르세요.");
  const [manualInput, setManualInput] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clips));
  }, [clips]);

  const addClip = (content: string, source: Clip["source"]) => {
    const clip = createClip(content, source);
    if (!clip) return;

    const normalized = normalizeContent(clip.content);
    const duplicate = clips.some((item) => normalizeContent(item.content) === normalized);
    if (duplicate) {
      setStatus("이미 저장된 클립이에요.");
      return;
    }

    setClips((current) => [clip, ...current]);
    setStatus(
      clip.flagged
        ? "민감할 수 있는 내용이라 Review로 분류했어요."
        : "Cliplog에 저장했어요.",
    );
  };

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (isEditableTarget(event.target)) return;
      const text = event.clipboardData?.getData("text/plain");
      if (!text) return;
      event.preventDefault();
      addClip(text, "paste");
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  });

  const importFromClipboard = async () => {
    if (!navigator.clipboard?.readText) {
      setStatus("이 브라우저에서는 버튼 가져오기가 제한돼요. Cmd/Ctrl + V를 사용해 주세요.");
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      addClip(text, "clipboard");
    } catch {
      setStatus("클립보드 권한이 필요해요. Cmd/Ctrl + V로 저장할 수 있어요.");
    }
  };

  const addManualClip = () => {
    addClip(manualInput, "manual");
    setManualInput("");
  };

  const filteredClips = useMemo(() => {
    const lowered = query.toLowerCase();
    return clips.filter((clip) => {
      const matchesQuery =
        !lowered ||
        clip.content.toLowerCase().includes(lowered) ||
        clip.title.toLowerCase().includes(lowered) ||
        clip.category.toLowerCase().includes(lowered);
      const matchesType = activeType === "all" || clip.type === activeType;
      return matchesQuery && matchesType;
    });
  }, [clips, query, activeType]);

  const groupedClips = useMemo(() => {
    return filteredClips.reduce<Record<string, Clip[]>>((groups, clip) => {
      const key = formatDay(clip.createdAt);
      groups[key] = groups[key] ? [...groups[key], clip] : [clip];
      return groups;
    }, {});
  }, [filteredClips]);

  const stats = useMemo(() => {
    return {
      total: clips.length,
      today: clips.filter(
        (clip) => new Date(clip.createdAt).toDateString() === new Date().toDateString(),
      ).length,
      flagged: clips.filter((clip) => clip.flagged).length,
    };
  }, [clips]);

  const toggleFavorite = (id: string) => {
    setClips((current) =>
      current.map((clip) =>
        clip.id === id ? { ...clip, favorite: !clip.favorite } : clip,
      ),
    );
  };

  const removeClip = (id: string) => {
    setClips((current) => current.filter((clip) => clip.id !== id));
  };

  return (
    <main className="min-h-screen bg-[#f4f6f5] text-[#18211d]">
      <section className="border-b border-[#d8dfda] bg-white">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 py-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-md bg-[#18211d] text-xs font-bold text-white">
                CL
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64756d]">
                  Cliplog
                </p>
                <h1 className="text-2xl font-semibold tracking-normal text-[#18211d] sm:text-3xl">
                  Clipboard workspace
                </h1>
              </div>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-[#64756d]">
              복사한 뒤 Cliplog에서 붙여넣거나 가져오기 버튼을 누르면 날짜별 기록으로 정리됩니다.
              긴 텍스트와 코드는 카드 안에서 접혀 화면을 밀어내지 않습니다.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-lg border border-[#d8dfda] bg-[#f8faf9] p-2">
            <Stat label="전체" value={stats.total} />
            <Stat label="오늘" value={stats.today} />
            <Stat label="검토" value={stats.flagged} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1600px] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
        <aside className="space-y-3">
          <button
            className="w-full rounded-lg border border-[#18211d] bg-[#18211d] px-4 py-4 text-left text-white shadow-sm transition hover:bg-[#27342e]"
            onClick={importFromClipboard}
          >
            <span className="block text-sm font-semibold">현재 클립보드 저장</span>
            <span className="mt-1 block text-xs leading-5 text-[#d5e3dc]">
              브라우저 권한이 막히면 Cmd/Ctrl + V로 저장됩니다.
            </span>
          </button>

          <div className="rounded-lg border border-[#d8dfda] bg-white p-4 shadow-sm">
            <label className="text-sm font-semibold text-[#18211d]" htmlFor="manual">
              직접 추가
            </label>
            <textarea
              id="manual"
              className="mt-3 min-h-32 w-full resize-y rounded-md border border-[#cbd5cf] bg-[#fbfcfb] p-3 text-sm leading-6 outline-none transition focus:border-[#2f7d5b] focus:ring-2 focus:ring-[#d9eadf]"
              placeholder="여기에 붙여넣거나 메모를 입력하세요."
              value={manualInput}
              onChange={(event) => setManualInput(event.target.value)}
            />
            <button
              className="mt-3 w-full rounded-md bg-[#2f7d5b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#27684c]"
              onClick={addManualClip}
            >
              저장
            </button>
          </div>

          <div className="rounded-lg border border-[#d8dfda] bg-white p-4 shadow-sm">
            <label className="text-sm font-semibold text-[#18211d]" htmlFor="search">
              검색
            </label>
            <input
              id="search"
              className="mt-3 h-11 w-full rounded-md border border-[#cbd5cf] bg-[#fbfcfb] px-3 text-sm outline-none transition focus:border-[#2f7d5b] focus:ring-2 focus:ring-[#d9eadf]"
              placeholder="내용, 제목, 카테고리"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="rounded-lg border border-[#d8dfda] bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-[#18211d]">분류</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <FilterButton active={activeType === "all"} onClick={() => setActiveType("all")}>
                전체
              </FilterButton>
              {(Object.keys(typeLabels) as ClipType[]).map((type) => (
                <FilterButton
                  active={activeType === type}
                  key={type}
                  onClick={() => setActiveType(type)}
                >
                  {typeLabels[type]}
                </FilterButton>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#d8dfda] bg-[#eef5f1] p-4 text-sm leading-6 text-[#3f5a4e]">
            {status}
          </div>
        </aside>

        <section
          className="min-h-[640px] min-w-0 rounded-lg border border-[#d8dfda] bg-white shadow-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) void importFromClipboard();
          }}
        >
          <div className="flex flex-col gap-3 border-b border-[#d8dfda] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#18211d]">Timeline</h2>
              <p className="mt-1 text-sm text-[#64756d]">
                Cmd/Ctrl + V 저장, 검색과 분류는 즉시 반영됩니다.
              </p>
            </div>
            {clips.length > 0 ? (
              <button
                className="rounded-md border border-[#d5ded8] px-3 py-2 text-sm font-medium text-[#64756d] transition hover:border-[#b4c0b8] hover:text-[#18211d]"
                onClick={() => setClips([])}
              >
                전체 비우기
              </button>
            ) : null}
          </div>

          {filteredClips.length === 0 ? (
            <div className="grid min-h-[520px] place-items-center p-8 text-center">
              <div className="max-w-md">
                <div className="mx-auto grid size-14 place-items-center rounded-lg bg-[#eef5f1] text-base font-bold text-[#2f7d5b]">
                  CL
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-[#18211d]">
                  아직 저장된 클립이 없어요
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#64756d]">
                  다른 곳에서 텍스트나 링크를 복사한 뒤 이 화면에서 Cmd/Ctrl + V를 누르세요.
                  버튼으로 가져오기도 사용할 수 있습니다.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 p-3 sm:p-5">
              {Object.entries(groupedClips).map(([day, dayClips]) => (
                <div key={day}>
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-[#3f5a4e]">{day}</h3>
                    <div className="h-px flex-1 bg-[#e3e9e5]" />
                    <span className="text-xs text-[#788980]">{dayClips.length}개</span>
                  </div>
                  <div className="grid gap-3 2xl:grid-cols-2">
                    {dayClips.map((clip) => (
                      <ClipCard
                        clip={clip}
                        key={clip.id}
                        onRemove={removeClip}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function ClipCard({
  clip,
  onRemove,
  onToggleFavorite,
}: {
  clip: Clip;
  onRemove: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const meta = clipPreviewMeta(clip.content);
  const contentClass =
    clip.type === "code"
      ? "font-mono text-[13px] leading-6 text-[#2a332f]"
      : "text-sm leading-6 text-[#344a40]";

  return (
    <article className="min-w-0 rounded-lg border border-[#d8dfda] bg-[#fcfdfc] p-4 transition hover:border-[#b7c5bd] hover:shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md border px-2 py-1 text-xs font-semibold ${typeTone[clip.type]}`}
            >
              {typeLabels[clip.type]}
            </span>
            <span className="rounded-md border border-[#e0e6e2] bg-white px-2 py-1 text-xs font-medium text-[#5d6f66]">
              {clip.category}
            </span>
            <span className="text-xs text-[#788980]">{formatTime(clip.createdAt)}</span>
          </div>
          <h4 className="mt-3 break-words text-base font-semibold text-[#18211d]">
            {clip.title}
          </h4>
          <p className="mt-1 text-xs text-[#788980]">
            {meta.characters}자 · {meta.lines}줄
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            className="rounded-md border border-[#d5ded8] px-3 py-2 text-sm font-medium text-[#64756d] transition hover:border-[#2f7d5b] hover:text-[#2f7d5b]"
            onClick={() => onToggleFavorite(clip.id)}
          >
            {clip.favorite ? "고정됨" : "고정"}
          </button>
          <button
            className="rounded-md border border-[#ecd2d2] px-3 py-2 text-sm font-medium text-[#9a3d3d] transition hover:bg-[#fff4f4]"
            onClick={() => onRemove(clip.id)}
          >
            삭제
          </button>
        </div>
      </div>
      {clip.flagged ? (
        <p className="mt-3 rounded-md border border-[#f2ddb1] bg-[#fff8e9] px-3 py-2 text-sm text-[#76511d]">
          민감정보일 수 있어요. 서버로 보내지 않고 로컬에만 저장됩니다.
        </p>
      ) : null}
      <div className="mt-4 max-h-72 min-h-24 overflow-auto rounded-md border border-[#e2e8e4] bg-white">
        <pre className={`whitespace-pre-wrap break-words p-4 ${contentClass}`}>
          {clip.content}
        </pre>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-20 rounded-md bg-white px-3 py-2 text-center">
      <p className="text-xl font-semibold text-[#18211d]">{value}</p>
      <p className="text-xs font-medium text-[#64756d]">{label}</p>
    </div>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={
        active
          ? "rounded-md bg-[#18211d] px-3 py-2 text-sm font-semibold text-white"
          : "rounded-md border border-[#d5ded8] px-3 py-2 text-sm font-medium text-[#64756d] transition hover:border-[#b4c0b8] hover:text-[#18211d]"
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
}

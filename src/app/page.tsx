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

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeContent(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function detectType(content: string): ClipType {
  const trimmed = content.trim();
  if (/https?:\/\/|www\./i.test(trimmed)) return "link";
  if (
    /(const|let|function|class|import|export|return|=>|<\/?[a-z][\s\S]*>)/.test(
      trimmed,
    )
  ) {
    return "code";
  }
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(trimmed)) {
    return "contact";
  }
  if (
    /\b\d{3,4}[- ]?\d{3,4}[- ]?\d{4}\b/.test(trimmed) ||
    /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/.test(trimmed) ||
    /(api[_-]?key|secret|token|password|passwd|bearer\s+[a-z0-9._-]+)/i.test(
      trimmed,
    )
  ) {
    return "sensitive";
  }
  return "text";
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

export default function Home() {
  const [clips, setClips] = useState<Clip[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Clip[];
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });
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
    <main className="min-h-screen bg-[#f8faf9] text-[#17201c]">
      <section className="border-b border-[#dce5df] bg-[#fcfffd]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg bg-[#17201c] text-sm font-bold text-white">
                CL
              </div>
              <div>
                <p className="text-sm font-medium text-[#587064]">Cliplog</p>
                <h1 className="text-3xl font-semibold tracking-normal text-[#17201c] sm:text-4xl">
                  복사한 자료를 바로 정리하세요
                </h1>
              </div>
            </div>
            <p className="max-w-2xl text-base leading-7 text-[#587064]">
              복사 후 이 화면을 클릭하거나 붙여넣기만 하면 날짜별 로그로 저장됩니다.
              AI 요약과 확장 프로그램을 붙이기 전, 가장 빠른 웹 MVP입니다.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-lg border border-[#dce5df] bg-white p-2 shadow-sm">
            <Stat label="전체" value={stats.total} />
            <Stat label="오늘" value={stats.today} />
            <Stat label="검토" value={stats.flagged} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-5 sm:px-8 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <button
            className="w-full rounded-lg border border-[#17201c] bg-[#17201c] px-4 py-4 text-left text-white shadow-sm transition hover:bg-[#24322b]"
            onClick={importFromClipboard}
          >
            <span className="block text-sm font-semibold">클립보드에서 가져오기</span>
            <span className="mt-1 block text-sm text-[#cfe1d6]">
              복사한 뒤 버튼을 누르면 현재 클립보드를 저장합니다.
            </span>
          </button>

          <div className="rounded-lg border border-[#dce5df] bg-white p-4 shadow-sm">
            <label className="text-sm font-semibold text-[#17201c]" htmlFor="manual">
              직접 추가
            </label>
            <textarea
              id="manual"
              className="mt-3 min-h-32 w-full resize-none rounded-md border border-[#cbd8d1] bg-[#fbfdfc] p-3 text-sm leading-6 outline-none transition focus:border-[#2f7d5b] focus:ring-2 focus:ring-[#cfe9dc]"
              placeholder="여기에 붙여넣거나 메모를 입력하세요."
              value={manualInput}
              onChange={(event) => setManualInput(event.target.value)}
            />
            <button
              className="mt-3 w-full rounded-md bg-[#2f7d5b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#25664a]"
              onClick={addManualClip}
            >
              저장
            </button>
          </div>

          <div className="rounded-lg border border-[#dce5df] bg-white p-4 shadow-sm">
            <label className="text-sm font-semibold text-[#17201c]" htmlFor="search">
              검색
            </label>
            <input
              id="search"
              className="mt-3 h-11 w-full rounded-md border border-[#cbd8d1] bg-[#fbfdfc] px-3 text-sm outline-none transition focus:border-[#2f7d5b] focus:ring-2 focus:ring-[#cfe9dc]"
              placeholder="내용, 제목, 카테고리"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="rounded-lg border border-[#dce5df] bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-[#17201c]">분류</p>
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

          <div className="rounded-lg border border-[#dce5df] bg-[#eef7f2] p-4 text-sm leading-6 text-[#385349]">
            {status}
          </div>
        </aside>

        <section
          className="min-h-[620px] rounded-lg border border-[#dce5df] bg-white shadow-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) void importFromClipboard();
          }}
        >
          <div className="flex flex-col gap-3 border-b border-[#dce5df] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#17201c]">Timeline</h2>
              <p className="mt-1 text-sm text-[#6c8176]">
                Cmd/Ctrl + V로도 바로 저장됩니다.
              </p>
            </div>
            {clips.length > 0 ? (
              <button
                className="rounded-md border border-[#d7e2db] px-3 py-2 text-sm font-medium text-[#587064] transition hover:border-[#aebfb5] hover:text-[#17201c]"
                onClick={() => setClips([])}
              >
                전체 비우기
              </button>
            ) : null}
          </div>

          {filteredClips.length === 0 ? (
            <div className="grid min-h-[520px] place-items-center p-8 text-center">
              <div className="max-w-md">
                <div className="mx-auto grid size-16 place-items-center rounded-lg bg-[#eef7f2] text-lg font-bold text-[#2f7d5b]">
                  CL
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-[#17201c]">
                  아직 저장된 클립이 없어요
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#6c8176]">
                  다른 곳에서 텍스트나 링크를 복사한 뒤 이 화면에서 Cmd/Ctrl + V를 누르세요.
                  버튼으로 가져오기도 사용할 수 있습니다.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 p-4 sm:p-5">
              {Object.entries(groupedClips).map(([day, dayClips]) => (
                <div key={day}>
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-[#385349]">{day}</h3>
                    <div className="h-px flex-1 bg-[#e5ece8]" />
                    <span className="text-xs text-[#789084]">{dayClips.length}개</span>
                  </div>
                  <div className="grid gap-3">
                    {dayClips.map((clip) => (
                      <article
                        className="rounded-lg border border-[#dce5df] bg-[#fcfffd] p-4 transition hover:border-[#aec8ba] hover:shadow-sm"
                        key={clip.id}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-md bg-[#e7f2ec] px-2 py-1 text-xs font-semibold text-[#2f7d5b]">
                                {typeLabels[clip.type]}
                              </span>
                              <span className="rounded-md bg-[#f2f5f3] px-2 py-1 text-xs font-medium text-[#587064]">
                                {clip.category}
                              </span>
                              <span className="text-xs text-[#789084]">
                                {formatTime(clip.createdAt)}
                              </span>
                            </div>
                            <h4 className="mt-3 break-words text-lg font-semibold text-[#17201c]">
                              {clip.title}
                            </h4>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <button
                              className="rounded-md border border-[#d7e2db] px-3 py-2 text-sm font-medium text-[#587064] transition hover:border-[#2f7d5b] hover:text-[#2f7d5b]"
                              onClick={() => toggleFavorite(clip.id)}
                            >
                              {clip.favorite ? "고정됨" : "고정"}
                            </button>
                            <button
                              className="rounded-md border border-[#efd2d2] px-3 py-2 text-sm font-medium text-[#9a3d3d] transition hover:bg-[#fff4f4]"
                              onClick={() => removeClip(clip.id)}
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                        {clip.flagged ? (
                          <p className="mt-3 rounded-md bg-[#fff7e8] px-3 py-2 text-sm text-[#78501d]">
                            민감정보일 수 있어요. 다음 버전에서는 자동 저장 제외 옵션을 붙이면 좋습니다.
                          </p>
                        ) : null}
                        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-[#385349]">
                          {clip.content}
                        </p>
                      </article>
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-20 rounded-md bg-[#f3f8f5] px-3 py-2 text-center">
      <p className="text-xl font-semibold text-[#17201c]">{value}</p>
      <p className="text-xs font-medium text-[#6c8176]">{label}</p>
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
          ? "rounded-md bg-[#17201c] px-3 py-2 text-sm font-semibold text-white"
          : "rounded-md border border-[#d7e2db] px-3 py-2 text-sm font-medium text-[#587064] transition hover:border-[#aebfb5] hover:text-[#17201c]"
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
}

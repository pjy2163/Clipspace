"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClip, typeLabelsByLocale } from "@/lib/clipboard/clip";
import { copyClipToClipboard } from "@/lib/clipboard/share";
import { loadStoredClips, saveWorkspaceState, type StoredState } from "@/lib/storage/workspace-storage";
import type { AppLocale, Clip, ClipType } from "@/types/clip";
import { BrandIcon } from "@/components/common";

const miniCopy = {
  ko: {
    title: "ClipSpace 미니 클립보드",
    description: "최근 클립을 옆에 띄워두고 빠르게 다시 복사하세요.",
    importClipboard: "클립보드 가져오기",
    pasteLabel: "붙여넣기 입력",
    pastePlaceholder: "Ctrl+V",
    saveManual: "저장",
    searchLabel: "검색",
    openSearch: "검색 열기",
    closeSearch: "검색 닫기",
    searchPlaceholder: "내용, 제목, 카테고리",
    recent: "최근 클립",
    empty: "아직 저장된 개인 클립이 없어요.",
    copy: "복사",
    close: "닫기",
    detail: "클립 상세",
    notes: "메모",
    openFull: "전체 앱 열기",
    copied: "클립을 복사했어요.",
    copyFailed: "복사하지 못했어요. 브라우저 권한을 확인해 주세요.",
    saved: "개인 클립보드에 저장했어요.",
    duplicate: "이미 저장된 클립이에요.",
    emptyInput: "저장할 클립보드 내용이 없어요.",
    importBlocked: "클립보드 권한이 막혔어요. 전체 앱에서 직접 추가를 사용해 주세요.",
    loadFailed: "저장소를 불러오지 못했어요.",
    saveFailed: "저장소에 기록하지 못했어요.",
    fullAppHref: "/",
  },
  en: {
    title: "ClipSpace mini clipboard",
    description: "Keep recent clips nearby and copy them again quickly.",
    importClipboard: "Import clipboard",
    pasteLabel: "Paste input",
    pastePlaceholder: "Ctrl+V",
    saveManual: "Save",
    searchLabel: "Search",
    openSearch: "Open search",
    closeSearch: "Close search",
    searchPlaceholder: "Content, title, category",
    recent: "Recent clips",
    empty: "No personal clips saved yet.",
    copy: "Copy",
    close: "Close",
    detail: "Clip detail",
    notes: "Notes",
    openFull: "Open full app",
    copied: "Copied this clip.",
    copyFailed: "Could not copy. Check your browser permission.",
    saved: "Saved to your personal clipboard.",
    duplicate: "This clip is already saved.",
    emptyInput: "There is no clipboard text to save.",
    importBlocked: "Clipboard permission is blocked. Use manual add in the full app.",
    loadFailed: "Could not load storage.",
    saveFailed: "Could not write to storage.",
    fullAppHref: "/en/app",
  },
};

function sortClips(clips: Clip[]) {
  return [...clips].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function normalizeClipKey(clip: Clip) {
  return `${clip.type}:${clip.content}:${clip.image?.dataUrl ?? ""}`.replace(/\s+/g, " ").trim();
}

export function MiniClipboard({ locale = "ko" }: { locale?: AppLocale }) {
  const copy = miniCopy[locale];
  const typeLabels = typeLabelsByLocale[locale];
  const [state, setState] = useState<StoredState>({ personal: [], teams: {} });
  const [manualInput, setManualInput] = useState("");
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [isReady, setIsReady] = useState(false);

  const loadState = async () => {
    try {
      const stored = await loadStoredClips();
      setState(stored);
      setIsReady(true);
    } catch {
      setStatus(copy.loadFailed);
      setIsReady(true);
    }
  };

  useEffect(() => {
    void loadState();

    const handleFocus = () => void loadState();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clips = useMemo(() => sortClips(state.personal), [state.personal]);
  const selectedClip = useMemo(
    () => clips.find((clip) => clip.id === selectedClipId) ?? null,
    [clips, selectedClipId],
  );
  const filteredClips = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    if (!lowered) return clips.slice(0, 12);
    return clips
      .filter((clip) =>
        [clip.title, clip.content, clip.category, typeLabels[clip.type as ClipType]]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(lowered)),
      )
      .slice(0, 12);
  }, [clips, query, typeLabels]);

  const saveClip = async (content: string) => {
    const clip = createClip(content, "manual");
    if (!clip) {
      setStatus(copy.emptyInput);
      return;
    }

    const nextState = await loadStoredClips();
    const duplicate = nextState.personal.some((item) => normalizeClipKey(item) === normalizeClipKey(clip));
    if (duplicate) {
      setState(nextState);
      setStatus(copy.duplicate);
      return;
    }

    const updatedState = {
      ...nextState,
      personal: [clip, ...nextState.personal],
    };
    try {
      await saveWorkspaceState("personal", updatedState);
      setState(updatedState);
      setManualInput("");
      setStatus(copy.saved);
    } catch {
      setStatus(copy.saveFailed);
    }
  };

  const importClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      await saveClip(text);
    } catch {
      setStatus(copy.importBlocked);
    }
  };

  const saveManualInput = async () => {
    await saveClip(manualInput);
  };

  const handleManualKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    void saveManualInput();
  };

  const copyClip = async (clip: Clip) => {
    try {
      await copyClipToClipboard(clip);
      setStatus(copy.copied);
    } catch {
      setStatus(copy.copyFailed);
    }
  };

  return (
    <main className="h-screen overflow-hidden bg-[#f6f7f9] text-[#202124]">
      <section className="mx-auto flex h-screen w-full max-w-xl flex-col gap-3 p-3">
        <header className="shrink-0 rounded-lg border border-[#e2e5ea] bg-white p-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <BrandIcon className="size-8 rounded-lg" />
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold">{copy.title}</h1>
                <p className="mt-0.5 text-[11px] leading-4 text-[#5f6673]">{copy.description}</p>
              </div>
            </div>
            <a
              className="shrink-0 rounded-md border border-[#d7dce5] px-2 py-1 text-[11px] font-semibold text-[#354052] transition hover:bg-[#f7f9fc]"
              href={copy.fullAppHref}
              target="_blank"
            >
              {copy.openFull}
            </a>
          </div>
        </header>

        <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-[#e2e5ea] bg-white p-3">
          <div className="shrink-0">
            <div className="grid gap-2">
            <label className="sr-only" htmlFor="mini-manual-input">
              {copy.pasteLabel}
            </label>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-2">
              <textarea
                className="h-11 max-h-24 min-h-11 resize-none rounded-md border border-[#d7dce5] bg-[#fbfcff] px-3 py-2.5 text-sm leading-5 outline-none transition placeholder:text-[#9aa1ad] focus:border-[#315fbd] focus:ring-2 focus:ring-[#dbe6ff]"
                id="mini-manual-input"
                onChange={(event) => setManualInput(event.target.value)}
                onKeyDown={handleManualKeyDown}
                placeholder={copy.pastePlaceholder}
                value={manualInput}
              />
              <button
                className="h-11 rounded-md bg-[#202124] px-3 text-sm font-semibold text-white transition hover:bg-[#303134]"
                onClick={() => void saveManualInput()}
                type="button"
              >
                {copy.saveManual}
              </button>
              <button
                className="h-11 rounded-md border border-[#d7dce5] px-3 text-sm font-semibold text-[#354052] transition hover:bg-[#f7f9fc]"
                onClick={() => void importClipboard()}
                title={copy.importClipboard}
                type="button"
              >
                +
              </button>
              <button
                aria-label={isSearchOpen ? copy.closeSearch : copy.openSearch}
                className={`grid h-11 w-11 place-items-center rounded-md border text-[#354052] transition ${
                  isSearchOpen
                    ? "border-[#315fbd] bg-[#edf3ff]"
                    : "border-[#d7dce5] hover:bg-[#f7f9fc]"
                }`}
                onClick={() => setIsSearchOpen((current) => !current)}
                title={isSearchOpen ? copy.closeSearch : copy.openSearch}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
            </div>
            {isSearchOpen ? (
              <>
                <label className="sr-only" htmlFor="mini-search">
                  {copy.searchLabel}
                </label>
                <input
                  className="h-10 w-full rounded-md border border-[#d7dce5] bg-[#fbfcff] px-3 text-sm outline-none transition placeholder:text-[#9aa1ad] focus:border-[#315fbd] focus:ring-2 focus:ring-[#dbe6ff]"
                  id="mini-search"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={copy.searchPlaceholder}
                  value={query}
                />
              </>
            ) : null}
            </div>
            {status ? <p className="mt-2 text-xs leading-5 text-[#5f6673]">{status}</p> : null}
            <h2 className="mt-4 text-sm font-semibold">{copy.recent}</h2>
          </div>
          <div className="mt-2 min-h-0 flex-1 space-y-2 overflow-auto pr-1">
            {!isReady || filteredClips.length === 0 ? (
              <p className="rounded-md border border-[#e8ecf2] bg-[#fbfcff] px-3 py-4 text-sm leading-6 text-[#5f6673]">
                {isReady ? copy.empty : copy.loadFailed}
              </p>
            ) : (
              filteredClips.map((clip) => (
                <article
                  className="w-full cursor-pointer rounded-md border border-[#e2e5ea] bg-white p-3 text-left transition hover:border-[#c9d0dc] hover:bg-[#fbfcff] focus:outline-none focus:ring-2 focus:ring-[#dbe6ff]"
                  key={clip.id}
                  onClick={() => setSelectedClipId(clip.id)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    setSelectedClipId(clip.id);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{clip.title}</p>
                      <p className="mt-1 text-xs text-[#7a828e]">
                        {typeLabels[clip.type]} · {clip.category}
                      </p>
                    </div>
                    <button
                      className="shrink-0 rounded-md border border-[#d7dce5] px-2 py-1 text-xs font-semibold text-[#354052] transition hover:bg-[#f7f9fc]"
                      onClick={(event) => {
                        event.stopPropagation();
                        void copyClip(clip);
                      }}
                      type="button"
                    >
                      {copy.copy}
                    </button>
                  </div>
                  <p className="mt-2 line-clamp-3 whitespace-pre-wrap break-words text-xs leading-5 text-[#5f6673]">
                    {clip.content || clip.image?.mimeType}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>
      </section>

      {selectedClip ? (
        <section
          aria-label={copy.detail}
          className="fixed inset-0 z-10 bg-[#f6f7f9] p-3 text-[#202124]"
        >
          <div className="mx-auto flex h-full max-w-xl flex-col rounded-lg border border-[#e2e5ea] bg-white">
            <header className="flex items-start justify-between gap-3 border-b border-[#eef1f5] p-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#7a828e]">
                  {typeLabels[selectedClip.type]} · {selectedClip.category}
                </p>
                <h2 className="mt-1 break-words text-base font-semibold">{selectedClip.title}</h2>
              </div>
              <button
                className="shrink-0 rounded-md border border-[#d7dce5] px-2 py-1.5 text-xs font-semibold text-[#354052] transition hover:bg-[#f7f9fc]"
                onClick={() => setSelectedClipId(null)}
                type="button"
              >
                {copy.close}
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-auto p-3">
              {selectedClip.type === "image" && selectedClip.image ? (
                <div className="overflow-hidden rounded-md border border-[#e2e5ea] bg-[#fbfcff]">
                  {/* Data URL previews come from the local clipboard and cannot be optimized by Next Image. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={selectedClip.title}
                    className="max-h-[55vh] w-full object-contain"
                    src={selectedClip.image.dataUrl}
                  />
                </div>
              ) : (
                <pre className="whitespace-pre-wrap break-words rounded-md border border-[#e2e5ea] bg-[#fbfcff] p-3 text-sm leading-6 text-[#344a40]">
                  {selectedClip.content}
                </pre>
              )}
              {selectedClip.notes?.length ? (
                <section className="mt-3">
                  <h3 className="text-sm font-semibold">{copy.notes}</h3>
                  <div className="mt-2 space-y-2">
                    {selectedClip.notes.map((note) => (
                      <div
                        className="rounded-md border border-[#e2e5ea] bg-[#fbfcff] p-3"
                        key={note.id}
                      >
                        <p className="whitespace-pre-wrap break-words text-sm leading-5 text-[#3f4754]">
                          {note.text}
                        </p>
                        {note.image ? (
                          <div className="mt-2 overflow-hidden rounded-md border border-[#e2e5ea] bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              alt={note.text || copy.notes}
                              className="max-h-64 w-full object-contain"
                              src={note.image.dataUrl}
                            />
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
            <footer className="border-t border-[#eef1f5] p-3">
              <button
                className="h-10 w-full rounded-md bg-[#202124] text-sm font-semibold text-white transition hover:bg-[#303134]"
                onClick={() => void copyClip(selectedClip)}
                type="button"
              >
                {copy.copy}
              </button>
            </footer>
          </div>
        </section>
      ) : null}
    </main>
  );
}

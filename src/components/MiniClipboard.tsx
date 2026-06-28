"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClip, typeLabelsByLocale } from "@/lib/clip";
import { copyClipToClipboard } from "@/lib/share";
import { loadStoredClips, saveWorkspaceState, type StoredState } from "@/lib/storage";
import type { AppLocale, Clip, ClipType } from "@/types/clip";
import { BrandIcon } from "./common";

const miniCopy = {
  ko: {
    title: "ClipSpace 미니 클립보드",
    description: "최근 클립을 옆에 띄워두고 빠르게 다시 복사하세요.",
    importClipboard: "클립보드 가져오기",
    searchLabel: "검색",
    searchPlaceholder: "내용, 제목, 카테고리",
    recent: "최근 클립",
    empty: "아직 저장된 개인 클립이 없어요.",
    copy: "복사",
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
    searchLabel: "Search",
    searchPlaceholder: "Content, title, category",
    recent: "Recent clips",
    empty: "No personal clips saved yet.",
    copy: "Copy",
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
  const [query, setQuery] = useState("");
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

  const copyClip = async (clip: Clip) => {
    try {
      await copyClipToClipboard(clip);
      setStatus(copy.copied);
    } catch {
      setStatus(copy.copyFailed);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#202124]">
      <section className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-3 p-3">
        <header className="rounded-lg border border-[#e2e5ea] bg-white p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <BrandIcon className="size-9 rounded-lg" />
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold">{copy.title}</h1>
                <p className="mt-1 text-xs leading-5 text-[#5f6673]">{copy.description}</p>
              </div>
            </div>
            <a
              className="shrink-0 rounded-md border border-[#d7dce5] px-2 py-1.5 text-xs font-semibold text-[#354052] transition hover:bg-[#f7f9fc]"
              href={copy.fullAppHref}
              target="_blank"
            >
              {copy.openFull}
            </a>
          </div>
        </header>

        <section className="min-h-0 flex-1 rounded-lg border border-[#e2e5ea] bg-white p-3">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
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
            <button
              className="rounded-md bg-[#202124] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#303134]"
              onClick={() => void importClipboard()}
              type="button"
            >
              {copy.importClipboard}
            </button>
          </div>
          {status ? <p className="mt-2 text-xs leading-5 text-[#5f6673]">{status}</p> : null}

          <h2 className="mt-4 text-sm font-semibold">{copy.recent}</h2>
          <div className="mt-2 max-h-[calc(100vh-220px)] space-y-2 overflow-auto pr-1">
            {!isReady || filteredClips.length === 0 ? (
              <p className="rounded-md border border-[#e8ecf2] bg-[#fbfcff] px-3 py-4 text-sm leading-6 text-[#5f6673]">
                {isReady ? copy.empty : copy.loadFailed}
              </p>
            ) : (
              filteredClips.map((clip) => (
                <article
                  className="rounded-md border border-[#e2e5ea] bg-white p-3 transition hover:border-[#c9d0dc]"
                  key={clip.id}
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
                      onClick={() => void copyClip(clip)}
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
    </main>
  );
}

"use client";

import {
  type ClipboardEvent as ReactClipboardEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useState,
} from "react";
import { typeLabelsByLocale, typeTone } from "@/lib/clip";
import { getPastedImageFiles, readImageBlob } from "@/lib/image";
import { copyClipToClipboard } from "@/lib/share";
import { ui } from "@/styles/ui";
import type { AppLocale, Clip, ClipImage } from "@/types/clip";

const cardCopy = {
  ko: {
    imageMemoError: "이미지 메모를 읽지 못했어요.",
    copied: "클립 내용을 복사했어요.",
    copyFailed: "복사하지 못했어요. 브라우저 권한을 확인해 주세요.",
    copy: "복사",
    pinned: "고정됨",
    pin: "고정",
    delete: "삭제",
    flagged: "민감정보일 수 있어요. 서버로 보내지 않고 로컬에만 저장됩니다.",
    memo: "메모",
    imageMemo: "이미지 메모",
    deleteMemo: "메모 삭제",
    memoPlaceholder: "메모 입력 후 Enter로 추가, Shift+Enter로 줄바꿈",
    chars: "자",
    lines: "줄",
    numberLocale: "ko-KR",
    timeLocale: "ko-KR",
  },
  en: {
    imageMemoError: "Could not read the image memo.",
    copied: "Copied this clip.",
    copyFailed: "Could not copy. Check your browser permission.",
    copy: "Copy",
    pinned: "Pinned",
    pin: "Pin",
    delete: "Delete",
    flagged: "This may contain sensitive information. It stays local and is not sent to a server.",
    memo: "Memo",
    imageMemo: "Image memo",
    deleteMemo: "Delete memo",
    memoPlaceholder: "Add a memo with Enter, or use Shift+Enter for a new line",
    chars: "chars",
    lines: "lines",
    numberLocale: "en-US",
    timeLocale: "en-US",
  },
};

type ClipCardProps = {
  clip: Clip;
  locale?: AppLocale;
  onAddNote: (id: string, text: string, image?: ClipImage) => void;
  onRemove: (id: string) => void;
  onRemoveNote: (clipId: string, noteId: string) => void;
  onToggleFavorite: (id: string) => void;
};

export function ClipCard({
  clip,
  locale = "ko",
  onAddNote,
  onRemove,
  onRemoveNote,
  onToggleFavorite,
}: ClipCardProps) {
  const copy = cardCopy[locale];
  const typeLabels = typeLabelsByLocale[locale];
  const [draftNote, setDraftNote] = useState("");
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const meta = clipPreviewMeta(clip, locale);
  const notes = clip.notes ?? [];
  const contentClass =
    clip.type === "code"
      ? "font-mono text-[13px] leading-6 text-[#2a332f]"
      : "text-sm leading-6 text-[#344a40]";
  const submitNote = () => {
    if (!draftNote.trim()) return;
    onAddNote(clip.id, draftNote);
    setDraftNote("");
    setIsMemoOpen(true);
  };
  const handleNoteKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    submitNote();
  };
  const handleNotePaste = async (event: ReactClipboardEvent<HTMLTextAreaElement>) => {
    const imageFiles = getPastedImageFiles(event);
    if (imageFiles.length === 0) return;

    event.preventDefault();
    event.stopPropagation();
    try {
      const image = await readImageBlob(imageFiles[0], imageFiles[0].name || undefined);
      const caption = event.clipboardData.getData("text/plain") || draftNote;
      onAddNote(clip.id, caption, image);
      setDraftNote("");
      setIsMemoOpen(true);
    } catch {
      onAddNote(clip.id, copy.imageMemoError);
    }
  };
  const copyClip = async () => {
    try {
      await copyClipToClipboard(clip);
      setCopyStatus(copy.copied);
    } catch {
      setCopyStatus(copy.copyFailed);
    }
  };

  return (
    <article className={ui.clip.card}>
      <div className={ui.clip.header}>
        <div className="min-w-0 flex-1">
          <div className={ui.clip.metaRow}>
            <span
              className={`shrink-0 rounded-md border px-2 py-1 text-xs font-semibold ${typeTone[clip.type]}`}
            >
              {typeLabels[clip.type]}
            </span>
            <span className={ui.clip.category}>
              {clip.category}
            </span>
          </div>
          <h4 className="mt-2 break-words text-sm font-semibold leading-5 text-[#202124]">
            {clip.title}
          </h4>
          <p className="mt-1 truncate text-xs text-[#7a828e]">{meta}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="flex flex-nowrap gap-1">
            <button
              className={ui.button.neutral}
              onClick={copyClip}
            >
              {copy.copy}
            </button>
            <button
              className={ui.button.accent}
              onClick={() => onToggleFavorite(clip.id)}
            >
              {clip.favorite ? copy.pinned : copy.pin}
            </button>
            <button
              className={ui.button.danger}
              onClick={() => onRemove(clip.id)}
            >
              {copy.delete}
            </button>
          </div>
          <span className="mt-3 text-right text-xs text-[#7a828e]">
            {formatTime(clip.createdAt, copy.timeLocale)}
          </span>
        </div>
      </div>
      {copyStatus ? <p className="mt-3 text-xs text-[#5f6673]">{copyStatus}</p> : null}
      {clip.flagged ? (
        <p className="mt-2 rounded-md border border-[#f1dfb8] bg-[#fff9ed] px-3 py-2 text-sm text-[#76511d]">
          {copy.flagged}
        </p>
      ) : null}

      {clip.type === "image" && clip.image ? (
        <div className={ui.clip.imageFrame}>
          {/* Data URL previews come from the local clipboard and cannot be optimized by Next Image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={clip.title}
            className="max-h-56 w-full object-contain"
            src={clip.image.dataUrl}
          />
        </div>
      ) : (
        <div className={ui.clip.textFrame}>
          <pre className={`whitespace-pre-wrap break-words p-3 ${contentClass}`}>
            {clip.content}
          </pre>
        </div>
      )}

      <button
        className="mt-3 flex w-full items-center justify-between gap-2 border-t border-[#eef1f5] pt-2 text-left"
        onClick={() => setIsMemoOpen((current) => !current)}
      >
        <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#354052]">
          <span>{isMemoOpen ? "-" : "+"}</span>
          <span>{copy.memo}</span>
          {notes.length > 0 ? (
            <span className="rounded-full bg-[#edf2fb] px-1.5 py-0.5 text-[11px] text-[#315fbd]">
              {notes.length}
            </span>
          ) : null}
        </span>
        {notes.length > 0 && !isMemoOpen ? (
          <span className="min-w-0 flex-1 truncate text-right text-xs text-[#7a828e]">
            {notes[notes.length - 1].text || copy.imageMemo}
          </span>
        ) : null}
      </button>
      {isMemoOpen ? (
        <>
          {notes.length > 0 ? (
            <div className="mt-2 max-h-40 space-y-2 overflow-auto">
              {notes.map((note) => (
                <div
                  className={ui.clip.memoItem}
                  key={note.id}
                >
                  <div className="min-w-0 flex-1">
                    <p className="whitespace-pre-wrap break-words text-sm leading-5 text-[#3f4754]">
                      {note.text}
                    </p>
                    {note.image ? (
                      <div className="mt-2 overflow-hidden rounded-md border border-[#e2e8e4] bg-white">
                        {/* Data URL previews come from the local clipboard and cannot be optimized by Next Image. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt={note.text || "Memo image"}
                          className="max-h-64 w-full object-contain"
                          src={note.image.dataUrl}
                        />
                      </div>
                    ) : null}
                    <p className="mt-1 text-xs text-[#8a9a91]">
                      {formatTime(note.createdAt, copy.timeLocale)}
                    </p>
                  </div>
                  <button
                    aria-label={copy.deleteMemo}
                    className={ui.button.iconDanger}
                    onClick={() => onRemoveNote(clip.id, note.id)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <textarea
            className={ui.form.memo}
            placeholder={copy.memoPlaceholder}
            value={draftNote}
            onChange={(event) => setDraftNote(event.target.value)}
            onKeyDown={handleNoteKeyDown}
            onPaste={handleNotePaste}
          />
        </>
      ) : null}
    </article>
  );
}

function formatTime(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function clipPreviewMeta(clip: Clip, locale: AppLocale) {
  const copy = cardCopy[locale];
  if (clip.type === "image") {
    const size = clip.image?.size
      ? `${Math.round(clip.image.size / 1024).toLocaleString(copy.numberLocale)}KB`
      : "image";
    return `${clip.image?.mimeType ?? "image"} · ${size}`;
  }

  return `${new Intl.NumberFormat(copy.numberLocale).format(clip.content.length)}${
    locale === "ko" ? "" : " "
  }${copy.chars} · ${new Intl.NumberFormat(copy.numberLocale).format(
    clip.content.split(/\r?\n/).length,
  )}${locale === "ko" ? "" : " "}${copy.lines}`;
}

"use client";

import {
  type ClipboardEvent as ReactClipboardEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useState,
} from "react";
import { typeLabels, typeTone } from "@/lib/clip";
import { getPastedImageFiles, readImageBlob } from "@/lib/image";
import { shareClip } from "@/lib/share";
import { ui } from "@/styles/ui";
import type { Clip, ClipImage } from "@/types/clip";

type ClipCardProps = {
  clip: Clip;
  onAddNote: (id: string, text: string, image?: ClipImage) => void;
  onRemove: (id: string) => void;
  onRemoveNote: (clipId: string, noteId: string) => void;
  onToggleFavorite: (id: string) => void;
};

export function ClipCard({
  clip,
  onAddNote,
  onRemove,
  onRemoveNote,
  onToggleFavorite,
}: ClipCardProps) {
  const [draftNote, setDraftNote] = useState("");
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const meta = clipPreviewMeta(clip);
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
      onAddNote(clip.id, "이미지 메모를 읽지 못했어요.");
    }
  };
  const shareExternally = async () => {
    try {
      const result = await shareClip(clip);
      setShareStatus(
        result === "shared"
          ? "공유창을 열었어요."
          : "공유를 지원하지 않아 클립 내용을 복사했어요.",
      );
    } catch {
      setShareStatus("공유가 취소되었거나 실패했어요.");
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
              onClick={shareExternally}
            >
              공유
            </button>
            <button
              className={ui.button.accent}
              onClick={() => onToggleFavorite(clip.id)}
            >
              {clip.favorite ? "고정됨" : "고정"}
            </button>
            <button
              className={ui.button.danger}
              onClick={() => onRemove(clip.id)}
            >
              삭제
            </button>
          </div>
          <span className="mt-3 text-right text-xs text-[#7a828e]">
            {formatTime(clip.createdAt)}
          </span>
        </div>
      </div>
      {shareStatus ? <p className="mt-3 text-xs text-[#5f6673]">{shareStatus}</p> : null}
      {clip.flagged ? (
        <p className="mt-2 rounded-md border border-[#f1dfb8] bg-[#fff9ed] px-3 py-2 text-sm text-[#76511d]">
          민감정보일 수 있어요. 서버로 보내지 않고 로컬에만 저장됩니다.
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
          <span>메모</span>
          {notes.length > 0 ? (
            <span className="rounded-full bg-[#edf2fb] px-1.5 py-0.5 text-[11px] text-[#315fbd]">
              {notes.length}
            </span>
          ) : null}
        </span>
        {notes.length > 0 && !isMemoOpen ? (
          <span className="min-w-0 flex-1 truncate text-right text-xs text-[#7a828e]">
            {notes[notes.length - 1].text || "이미지 메모"}
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
                    <p className="mt-1 text-xs text-[#8a9a91]">{formatTime(note.createdAt)}</p>
                  </div>
                  <button
                    aria-label="메모 삭제"
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
            placeholder="메모 입력 후 Enter로 추가, Shift+Enter로 줄바꿈"
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

function formatTime(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function clipPreviewMeta(clip: Clip) {
  if (clip.type === "image") {
    const size = clip.image?.size ? `${Math.round(clip.image.size / 1024).toLocaleString("ko-KR")}KB` : "image";
    return `${clip.image?.mimeType ?? "image"} · ${size}`;
  }

  return `${new Intl.NumberFormat("ko-KR").format(clip.content.length)}자 · ${new Intl.NumberFormat(
    "ko-KR",
  ).format(clip.content.split(/\r?\n/).length)}줄`;
}

"use client";

import {
  type ClipboardEvent as ReactClipboardEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useState,
} from "react";
import { typeLabels, typeTone } from "@/lib/clip";
import { getPastedImageFiles, readImageBlob } from "@/lib/image";
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
    } catch {
      onAddNote(clip.id, "이미지 메모를 읽지 못했어요.");
    }
  };

  return (
    <article className={ui.clip.card}>
      <div className={ui.clip.header}>
        <div className="min-w-0">
          <div className={ui.clip.metaRow}>
            <span
              className={`rounded-md border px-2 py-1 text-xs font-semibold ${typeTone[clip.type]}`}
            >
              {typeLabels[clip.type]}
            </span>
            <span className={ui.clip.category}>
              {clip.category}
            </span>
            <span className="text-xs text-[#788980]">{formatTime(clip.createdAt)}</span>
          </div>
          <h4 className="mt-3 break-words text-base font-semibold text-[#18211d]">
            {clip.title}
          </h4>
          <p className="mt-1 text-xs text-[#788980]">{meta}</p>
        </div>
        <div className="flex shrink-0 gap-2">
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
      </div>
      {clip.flagged ? (
        <p className="mt-3 rounded-md border border-[#f2ddb1] bg-[#fff8e9] px-3 py-2 text-sm text-[#76511d]">
          민감정보일 수 있어요. 서버로 보내지 않고 로컬에만 저장됩니다.
        </p>
      ) : null}

      {clip.type === "image" && clip.image ? (
        <div className={ui.clip.imageFrame}>
          {/* Data URL previews come from the local clipboard and cannot be optimized by Next Image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={clip.title}
            className="max-h-96 w-full object-contain"
            src={clip.image.dataUrl}
          />
        </div>
      ) : (
        <div className={ui.clip.textFrame}>
          <pre className={`whitespace-pre-wrap break-words p-4 ${contentClass}`}>
            {clip.content}
          </pre>
        </div>
      )}

      <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.14em] text-[#788980]">
        Memo
      </label>
      {notes.length > 0 ? (
        <div className="mt-2 space-y-2">
          {notes.map((note) => (
            <div
              className={ui.clip.memoItem}
              key={note.id}
            >
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#344a40]">
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

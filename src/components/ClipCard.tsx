"use client";

import { type KeyboardEvent as ReactKeyboardEvent, useState } from "react";
import { typeLabels, typeTone } from "@/lib/clip";
import type { Clip } from "@/types/clip";

type ClipCardProps = {
  clip: Clip;
  onAddNote: (id: string, text: string) => void;
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
          <p className="mt-1 text-xs text-[#788980]">{meta}</p>
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

      {clip.type === "image" && clip.image ? (
        <div className="mt-4 overflow-hidden rounded-md border border-[#e2e8e4] bg-white">
          {/* Data URL previews come from the local clipboard and cannot be optimized by Next Image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={clip.title}
            className="max-h-96 w-full object-contain"
            src={clip.image.dataUrl}
          />
        </div>
      ) : (
        <div className="mt-4 max-h-72 min-h-24 overflow-auto rounded-md border border-[#e2e8e4] bg-white">
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
              className="flex items-start gap-2 rounded-md border border-[#dfe7e2] bg-white px-3 py-2"
              key={note.id}
            >
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#344a40]">
                  {note.text}
                </p>
                <p className="mt-1 text-xs text-[#8a9a91]">{formatTime(note.createdAt)}</p>
              </div>
              <button
                aria-label="메모 삭제"
                className="grid size-7 shrink-0 place-items-center rounded-md border border-[#e3cbc8] text-sm font-semibold text-[#9a3d3d] transition hover:bg-[#fff4f4]"
                onClick={() => onRemoveNote(clip.id, note.id)}
              >
                X
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <textarea
        className="mt-2 min-h-12 w-full resize-y rounded-md border border-[#d5ded8] bg-white px-3 py-2 text-sm leading-6 text-[#344a40] outline-none transition placeholder:text-[#9aaa9f] focus:border-[#2f7d5b] focus:ring-2 focus:ring-[#d9eadf]"
        placeholder="메모 입력 후 Enter로 추가, Shift+Enter로 줄바꿈"
        value={draftNote}
        onChange={(event) => setDraftNote(event.target.value)}
        onKeyDown={handleNoteKeyDown}
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

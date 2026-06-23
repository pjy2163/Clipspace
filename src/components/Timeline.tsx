import { workspaceCopy } from "@/lib/clip";
import type { Clip, WorkspaceMode } from "@/types/clip";
import { ClipCard } from "./ClipCard";

type TimelineProps = {
  clips: Clip[];
  groupedClips: Record<string, Clip[]>;
  workspace: WorkspaceMode;
  onAddNote: (id: string, text: string) => void;
  onClearWorkspace: () => void;
  onImportFromClipboard: () => void;
  onRemove: (id: string) => void;
  onRemoveNote: (clipId: string, noteId: string) => void;
  onToggleFavorite: (id: string) => void;
};

export function Timeline({
  clips,
  groupedClips,
  workspace,
  onAddNote,
  onClearWorkspace,
  onImportFromClipboard,
  onRemove,
  onRemoveNote,
  onToggleFavorite,
}: TimelineProps) {
  return (
    <section
      className="min-h-[640px] min-w-0 rounded-lg border border-[#d8dfda] bg-white shadow-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onImportFromClipboard();
      }}
    >
      <div className="flex flex-col gap-3 border-b border-[#d8dfda] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#18211d]">Timeline</h2>
          <p className="mt-1 text-sm text-[#64756d]">
            버튼을 누르면 현재 클립보드를 바로 저장합니다. 이미지 복사 후 붙여넣기도 기록됩니다.
          </p>
        </div>
        {clips.length > 0 ? (
          <button
            className="rounded-md border border-[#d5ded8] px-3 py-2 text-sm font-medium text-[#64756d] transition hover:border-[#b4c0b8] hover:text-[#18211d]"
            onClick={onClearWorkspace}
          >
            {workspaceCopy[workspace].label} 보드 비우기
          </button>
        ) : null}
      </div>

      {clips.length === 0 ? (
        <div className="grid min-h-[520px] place-items-center p-8 text-center">
          <div className="max-w-md">
            <div className="mx-auto grid size-14 place-items-center rounded-lg bg-[#eef5f1] text-base font-bold text-[#2f7d5b]">
              CL
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-[#18211d]">
              {workspaceCopy[workspace].empty}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#64756d]">
              텍스트, 링크, 코드, 이미지를 복사한 뒤 버튼을 누르거나 Ctrl/Cmd + V로 저장하세요.
              권한이 막히면 입력칸에 붙여넣고 Enter로 저장할 수 있습니다.
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
                    onAddNote={onAddNote}
                    onRemove={onRemove}
                    onRemoveNote={onRemoveNote}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

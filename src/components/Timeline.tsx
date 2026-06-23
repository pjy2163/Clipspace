import Image from "next/image";
import { getWorkspaceMode, workspaceCopy } from "@/lib/clip";
import { ui } from "@/styles/ui";
import type { Clip, ClipImage, WorkspaceKey } from "@/types/clip";
import { ClipCard } from "./ClipCard";

type TimelineProps = {
  clips: Clip[];
  groupedClips: Record<string, Clip[]>;
  workspace: WorkspaceKey;
  onAddNote: (id: string, text: string, image?: ClipImage) => void;
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
  const mode = getWorkspaceMode(workspace);

  return (
    <section
      className={ui.timeline.panel}
      onClick={(event) => {
        if (event.target === event.currentTarget) onImportFromClipboard();
      }}
    >
      <div className={ui.timeline.header}>
        <div>
          <h2 className="text-lg font-semibold text-[#18211d]">Timeline</h2>
          <p className="mt-1 text-sm text-[#5f6673]">
            복사한 텍스트, 링크, 코드, 이미지를 날짜별로 정리합니다.
          </p>
        </div>
        {clips.length > 0 ? (
          <button
            className={ui.button.quiet}
            onClick={onClearWorkspace}
          >
            {workspaceCopy[mode].label} 보드 비우기
          </button>
        ) : null}
      </div>

      {clips.length === 0 ? (
        <div className={ui.timeline.empty}>
          <div className="max-w-xl">
            <div className="mx-auto overflow-hidden rounded-lg border border-[#e2e8f3] bg-[#f7faff] shadow-sm">
              <Image
                alt=""
                aria-hidden="true"
                className="h-auto w-full object-contain"
                height={630}
                priority={false}
                src="/clipspace-preview.png"
                width={1200}
              />
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-[#18211d]">
              {workspaceCopy[mode].empty}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#5f6673]">
              복사 후 가져오기 버튼을 누르거나 Ctrl/Cmd + V로 저장하세요.
              권한이 막히면 직접 추가 입력칸을 사용할 수 있습니다.
            </p>
          </div>
        </div>
      ) : (
        <div className={ui.timeline.content}>
          {Object.entries(groupedClips).map(([day, dayClips]) => (
            <div key={day}>
              <div className={ui.timeline.dayHeader}>
                <h3 className="text-sm font-semibold text-[#354052]">{day}</h3>
                <div className={ui.timeline.divider} />
                <span className="text-xs text-[#788980]">{dayClips.length}개</span>
              </div>
              <div className={ui.timeline.grid}>
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

import { workspaceCopy } from "@/lib/clip";
import type { WorkspaceMode } from "@/types/clip";
import { ModeButton, Stat } from "./common";

type WorkspaceHeaderProps = {
  workspace: WorkspaceMode;
  stats: {
    total: number;
    today: number;
    flagged: number;
    images: number;
  };
  onSelectWorkspace: (mode: WorkspaceMode) => void;
};

export function WorkspaceHeader({
  workspace,
  stats,
  onSelectWorkspace,
}: WorkspaceHeaderProps) {
  return (
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
                {workspaceCopy[workspace].title}
              </h1>
            </div>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-[#64756d]">
            {workspaceCopy[workspace].description} 복사한 뒤 입력칸에 붙여넣고 Enter 또는
            저장을 누르면 날짜별 기록으로 정리됩니다.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="grid grid-cols-2 rounded-lg border border-[#d8dfda] bg-[#f8faf9] p-1">
            <ModeButton
              active={workspace === "personal"}
              label="개인"
              onClick={() => onSelectWorkspace("personal")}
            />
            <ModeButton
              active={workspace === "team"}
              label="팀"
              onClick={() => onSelectWorkspace("team")}
            />
          </div>
          <div className="grid grid-cols-4 gap-2 rounded-lg border border-[#d8dfda] bg-[#f8faf9] p-2">
            <Stat label="전체" value={stats.total} />
            <Stat label="오늘" value={stats.today} />
            <Stat label="이미지" value={stats.images} />
            <Stat label="검토" value={stats.flagged} />
          </div>
        </div>
      </div>
    </section>
  );
}

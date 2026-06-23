import { workspaceCopy } from "@/lib/clip";
import type { WorkspaceMode } from "@/types/clip";
import { BrandIcon, ModeButton, Stat } from "./common";

type WorkspaceHeaderProps = {
  workspace: WorkspaceMode;
  stats: {
    total: number;
    today: number;
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
    <section className="border-b border-[#e2e5ea] bg-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-3 sm:px-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <BrandIcon className="size-12 rounded-2xl" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a828e]">
                Cliplog
              </p>
              <h1 className="text-2xl font-semibold tracking-normal text-[#202124]">
                {workspaceCopy[workspace].title}
              </h1>
            </div>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-[#5f6673]">
            {workspaceCopy[workspace].description} 클립은 로컬에 저장되고, 필요할 때만 공유됩니다.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="grid grid-cols-2 rounded-lg border border-[#e2e5ea] bg-[#f6f7f9] p-1">
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
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-[#e2e5ea] bg-[#f6f7f9] p-2">
            <Stat label="전체" value={stats.total} />
            <Stat label="오늘" value={stats.today} />
            <Stat label="이미지" value={stats.images} />
          </div>
        </div>
      </div>
    </section>
  );
}

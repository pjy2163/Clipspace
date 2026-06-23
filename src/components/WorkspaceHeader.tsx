import { createTeamWorkspaceKey, getWorkspaceMode, workspaceCopy } from "@/lib/clip";
import type { TeamBoard, WorkspaceKey } from "@/types/clip";
import { BrandIcon, ModeButton, Stat } from "./common";

type WorkspaceHeaderProps = {
  workspace: WorkspaceKey;
  currentTeam: TeamBoard | null;
  teamBoards: TeamBoard[];
  stats: {
    total: number;
    today: number;
    images: number;
  };
  onCopyTeamLink: () => void;
  onCreateTeamBoard: (name: string) => void;
  onSelectWorkspace: (mode: WorkspaceKey) => void;
};

export function WorkspaceHeader({
  currentTeam,
  onCopyTeamLink,
  onCreateTeamBoard,
  workspace,
  stats,
  teamBoards,
  onSelectWorkspace,
}: WorkspaceHeaderProps) {
  const mode = getWorkspaceMode(workspace);
  const title = workspace === "personal" ? workspaceCopy.personal.title : currentTeam?.name ?? "Team board";
  const description =
    workspace === "personal"
      ? workspaceCopy.personal.description
      : "팀 링크 기준으로 자료, 레퍼런스, 코드 조각을 모으는 공간입니다.";

  return (
    <section className="border-b border-[#e2e5ea] bg-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-3 sm:px-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <button
              aria-label="Cliplog 새로고침"
              className="rounded-2xl transition hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-[#315fbd] focus:ring-offset-2"
              onClick={() => window.location.reload()}
              title="새로고침"
              type="button"
            >
              <BrandIcon className="size-12 rounded-2xl" />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a828e]">
                Cliplog
              </p>
              <h1 className="text-2xl font-semibold tracking-normal text-[#202124]">
                {title}
              </h1>
            </div>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-[#5f6673]">
            {description} 클립은 로컬에 저장되고, 필요할 때만 공유됩니다.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[#e2e5ea] bg-[#f6f7f9] p-1">
            <ModeButton
              active={mode === "personal"}
              label="개인"
              onClick={() => onSelectWorkspace("personal")}
            />
            {teamBoards.length > 0 ? (
              <select
                aria-label="팀 보드 선택"
                className="h-9 rounded-md border border-transparent bg-white px-2 text-sm font-semibold text-[#354052] outline-none transition focus:border-[#315fbd] focus:ring-2 focus:ring-[#dbe6ff]"
                value={currentTeam?.id ?? ""}
                onChange={(event) => {
                  if (event.target.value) {
                    onSelectWorkspace(createTeamWorkspaceKey(event.target.value));
                  }
                }}
              >
                <option value="" disabled>
                  팀 선택
                </option>
                {teamBoards.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            ) : null}
            <button
              className="rounded-md px-3 py-2 text-sm font-semibold text-[#5f6673] transition hover:text-[#202124]"
              onClick={() => onCreateTeamBoard("")}
              type="button"
            >
              팀 생성
            </button>
            {mode === "team" ? (
              <button
                className="rounded-md bg-[#315fbd] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#274d9b]"
                onClick={onCopyTeamLink}
                type="button"
              >
                링크 복사
              </button>
            ) : null}
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

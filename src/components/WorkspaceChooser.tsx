import { useState } from "react";
import Image from "next/image";
import { createTeamWorkspaceKey } from "@/lib/clip";
import type { TeamBoard, WorkspaceKey } from "@/types/clip";
import { BrandIcon } from "./common";

type WorkspaceChooserProps = {
  teamBoards: TeamBoard[];
  onCreateTeamBoard: (name: string) => void;
  onSelect: (mode: WorkspaceKey) => void;
};

export function WorkspaceChooser({
  teamBoards,
  onCreateTeamBoard,
  onSelect,
}: WorkspaceChooserProps) {
  const [teamName, setTeamName] = useState("");
  const hasTeams = teamBoards.length > 0;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#18211d]/35 px-4 backdrop-blur-sm">
      <section className="max-h-[88vh] w-full max-w-3xl overflow-auto rounded-lg border border-[#d8dfda] bg-white p-5 shadow-2xl">
        <div className="mb-5 overflow-hidden rounded-lg border border-[#e2e8f3] bg-[#f7faff]">
          <Image
            alt=""
            aria-hidden="true"
            className="h-auto w-full object-contain"
            height={630}
            priority
            src="/clipspace-preview.png"
            width={1200}
          />
        </div>

        <div className="flex items-start gap-3">
          <BrandIcon className="size-11 rounded-2xl" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64756d]">
              Start workspace
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#18211d]">
              어떤 클립보드로 시작할까요?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#64756d]">
              개인 자료와 팀 자료를 분리해서 저장합니다. 언제든 상단에서 전환할 수 있어요.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            className="rounded-lg border border-[#b9c8bf] bg-[#f8faf9] p-4 text-left transition hover:border-[#2f7d5b] hover:bg-[#eef5f1]"
            onClick={() => onSelect("personal")}
          >
            <span className="text-sm font-semibold text-[#18211d]">개인으로 시작</span>
            <span className="mt-2 block text-sm leading-6 text-[#64756d]">
              내 메모, 코드 조각, 링크를 혼자 정리하는 기본 클립보드입니다.
            </span>
          </button>
          <button
            className="rounded-lg border border-[#b9c8bf] bg-[#f8faf9] p-4 text-left transition hover:border-[#2f7d5b] hover:bg-[#eef5f1]"
            onClick={() => onCreateTeamBoard(teamName)}
          >
            <span className="text-sm font-semibold text-[#18211d]">새 팀 보드 만들기</span>
            <span className="mt-2 block text-sm leading-6 text-[#64756d]">
              팀 링크 기준으로 자료 보드를 구분합니다.
            </span>
          </button>
        </div>

        <div className="mt-4 rounded-lg border border-[#e2e5ea] bg-[#fbfcff] p-3">
          <label className="text-sm font-semibold text-[#18211d]" htmlFor="team-name">
            새 팀 이름
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="team-name"
              className="h-10 min-w-0 flex-1 rounded-md border border-[#d7dce5] bg-white px-3 text-sm outline-none transition placeholder:text-[#9aa1ad] focus:border-[#315fbd] focus:ring-2 focus:ring-[#dbe6ff]"
              placeholder="예: 캡스톤 자료 조사"
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                onCreateTeamBoard(teamName);
              }}
            />
            <button
              className="rounded-md bg-[#202124] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#303134]"
              onClick={() => onCreateTeamBoard(teamName)}
              type="button"
            >
              팀 생성
            </button>
          </div>
        </div>

        {hasTeams ? (
          <div className="mt-4">
            <p className="text-sm font-semibold text-[#18211d]">기존 팀 보드</p>
            <div className="mt-2 grid gap-2">
              {teamBoards.map((team) => (
                <button
                  className="flex items-center justify-between gap-3 rounded-lg border border-[#e2e5ea] bg-white p-3 text-left transition hover:border-[#9aa7bd] hover:bg-[#f8fafc]"
                  key={team.id}
                  onClick={() => onSelect(createTeamWorkspaceKey(team.id))}
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[#18211d]">
                      {team.name}
                    </span>
                    <span className="mt-1 block truncate text-xs text-[#64756d]">
                      team={team.id}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-[#315fbd]">열기</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

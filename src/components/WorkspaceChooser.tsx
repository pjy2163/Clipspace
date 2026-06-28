import { useState } from "react";
import Image from "next/image";
import { createTeamWorkspaceKey } from "@/lib/clip";
import type { AppLocale, TeamBoard, WorkspaceKey } from "@/types/clip";
import { BrandIcon } from "./common";

const chooserCopy = {
  ko: {
    eyebrow: "Start workspace",
    title: "온라인 클립보드와 팀 공유 클립보드 중 선택하세요",
    description:
      "복사 붙여넣기한 링크, 코드, 메모, 이미지를 개인 자료와 팀 자료로 나누어 저장합니다. 개인 온라인 클립보드와 팀 공유 클립보드를 언제든 전환할 수 있어요.",
    personalTitle: "개인으로 시작하기",
    personalDescription: "개인 온라인 클립보드로 내 메모, 코드 조각, 링크를 혼자 정리합니다.",
    teamTitle: "새 팀 공유 클립보드 만들기",
    teamDescription: "팀 링크로 같이 쓰는 팀 공유 클립보드를 만듭니다.",
    teamName: "새 팀 이름",
    teamPlaceholder: "예: 캡스톤 자료 조사",
    createTeam: "팀 생성",
    existingTeams: "기존 팀 보드",
    sharedLink: "공유 링크 사용",
    open: "열기",
    languageHref: "/en/app",
    languageLabel: "English",
    languageTitle: "영어 버전으로 전환",
  },
  en: {
    eyebrow: "Start workspace",
    title: "Choose a personal or team clipboard",
    description:
      "Save copied links, code, notes, and images as personal material or team material. You can switch between your personal online clipboard and team shared clipboards at any time.",
    personalTitle: "Start personal",
    personalDescription: "Organize your own notes, snippets, and links in a personal online clipboard.",
    teamTitle: "Create a team shared clipboard",
    teamDescription: "Create a team shared clipboard that teammates can open by link.",
    teamName: "New team name",
    teamPlaceholder: "Example: Capstone research",
    createTeam: "Create team",
    existingTeams: "Existing team boards",
    sharedLink: "Shared link",
    open: "Open",
    languageHref: "/",
    languageLabel: "한국어",
    languageTitle: "Switch to Korean",
  },
};

type WorkspaceChooserProps = {
  locale?: AppLocale;
  teamBoards: TeamBoard[];
  onCreateTeamBoard: (name: string) => void;
  onSelect: (mode: WorkspaceKey) => void;
};

export function WorkspaceChooser({
  locale = "ko",
  teamBoards,
  onCreateTeamBoard,
  onSelect,
}: WorkspaceChooserProps) {
  const copy = chooserCopy[locale];
  const [teamName, setTeamName] = useState("");
  const hasTeams = teamBoards.length > 0;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#18211d]/35 px-4 backdrop-blur-sm">
      <section className="max-h-[88vh] w-full max-w-3xl overflow-auto rounded-lg border border-[#d8dfda] bg-white p-5 shadow-2xl">
        <div className="mb-3 flex justify-end">
          <a
            className="rounded-md border border-[#d7dce5] px-2.5 py-1.5 text-xs font-semibold text-[#354052] transition hover:border-[#9aa7bd] hover:bg-[#f7f9fc]"
            href={copy.languageHref}
            title={copy.languageTitle}
          >
            {copy.languageLabel}
          </a>
        </div>
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
              {copy.eyebrow}
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#18211d]">
              {copy.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#64756d]">
              {copy.description}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            className="rounded-lg border border-[#b9c8bf] bg-[#f8faf9] p-4 text-left transition hover:border-[#2f7d5b] hover:bg-[#eef5f1]"
            onClick={() => onSelect("personal")}
          >
            <span className="text-sm font-semibold text-[#18211d]">{copy.personalTitle}</span>
            <span className="mt-2 block text-sm leading-6 text-[#64756d]">
              {copy.personalDescription}
            </span>
          </button>
          <button
            className="rounded-lg border border-[#b9c8bf] bg-[#f8faf9] p-4 text-left transition hover:border-[#2f7d5b] hover:bg-[#eef5f1]"
            onClick={() => onCreateTeamBoard(teamName)}
          >
            <span className="text-sm font-semibold text-[#18211d]">{copy.teamTitle}</span>
            <span className="mt-2 block text-sm leading-6 text-[#64756d]">
              {copy.teamDescription}
            </span>
          </button>
        </div>

        <div className="mt-4 rounded-lg border border-[#e2e5ea] bg-[#fbfcff] p-3">
          <label className="text-sm font-semibold text-[#18211d]" htmlFor="team-name">
            {copy.teamName}
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="team-name"
              className="h-10 min-w-0 flex-1 rounded-md border border-[#d7dce5] bg-white px-3 text-sm outline-none transition placeholder:text-[#9aa1ad] focus:border-[#315fbd] focus:ring-2 focus:ring-[#dbe6ff]"
              placeholder={copy.teamPlaceholder}
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
              {copy.createTeam}
            </button>
          </div>
        </div>

        {hasTeams ? (
          <div className="mt-4">
            <p className="text-sm font-semibold text-[#18211d]">{copy.existingTeams}</p>
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
                      {copy.sharedLink}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-[#315fbd]">{copy.open}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

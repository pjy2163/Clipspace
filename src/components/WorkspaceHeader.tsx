import Link from "next/link";
import { createTeamWorkspaceKey, getWorkspaceMode, workspaceCopyByLocale } from "@/lib/clip";
import type { AppLocale, TeamBoard, WorkspaceKey } from "@/types/clip";
import { BrandIcon, ModeButton, Stat } from "./common";

const headerCopy = {
  ko: {
    personalDescription: "내가 복사한 메모, 코드, 링크를 혼자 쓰는 온라인 클립보드로 정리합니다.",
    teamDescription: "팀 링크로 모은 자료, 레퍼런스, 코드 조각을 팀 공유 클립보드에서 함께 봅니다.",
    infoLinks: [
      { href: "/about", label: "소개" },
      { href: "/guide", label: "사용법" },
      { href: "/privacy", label: "개인정보" },
      { href: "/use-cases", label: "활용 사례" },
    ],
    languageHref: "/en/app",
    languageLabel: "EN",
    languageTitle: "영어 버전으로 전환",
    refreshLabel: "ClipSpace 새로고침",
    refreshTitle: "새로고침",
    navLabel: "ClipSpace 안내 페이지",
    promptTeamName: "팀 이름을 입력하세요.",
    teamSelectLabel: "팀 보드 선택",
    teamSelectPlaceholder: "팀 선택",
    createTeam: "팀 생성",
    copyLink: "링크 복사",
    deleteTeam: "팀 삭제",
    privacyLine: "클립은 로컬에 저장되고, 팀 공유 클립보드에서 필요할 때만 공유됩니다.",
    stats: {
      total: "전체",
      today: "오늘",
      images: "이미지",
    },
  },
  en: {
    personalDescription: "Organize copied notes, code, and links in your own online clipboard.",
    teamDescription: "Review references, snippets, and notes together in a team shared clipboard.",
    infoLinks: [
      { href: "/en/about", label: "About" },
      { href: "/en/guide", label: "Guide" },
      { href: "/en/privacy", label: "Privacy" },
      { href: "/en/use-cases", label: "Use cases" },
    ],
    languageHref: "/",
    languageLabel: "KO",
    languageTitle: "Switch to Korean",
    refreshLabel: "Refresh ClipSpace",
    refreshTitle: "Refresh",
    navLabel: "ClipSpace info pages",
    promptTeamName: "Enter a team name.",
    teamSelectLabel: "Select team board",
    teamSelectPlaceholder: "Select team",
    createTeam: "Create team",
    copyLink: "Copy link",
    deleteTeam: "Delete team",
    privacyLine: "Clips stay local, and are shared only when you use a team shared clipboard.",
    stats: {
      total: "Total",
      today: "Today",
      images: "Images",
    },
  },
};

type WorkspaceHeaderProps = {
  locale?: AppLocale;
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
  onDeleteTeamBoard: () => void;
  onSelectWorkspace: (mode: WorkspaceKey) => void;
};

export function WorkspaceHeader({
  currentTeam,
  locale = "ko",
  onCopyTeamLink,
  onCreateTeamBoard,
  onDeleteTeamBoard,
  workspace,
  stats,
  teamBoards,
  onSelectWorkspace,
}: WorkspaceHeaderProps) {
  const mode = getWorkspaceMode(workspace);
  const copy = headerCopy[locale];
  const workspaceCopy = workspaceCopyByLocale[locale];
  const title = workspace === "personal" ? workspaceCopy.personal.title : currentTeam?.name ?? "Team board";
  const description =
    workspace === "personal"
      ? copy.personalDescription
      : copy.teamDescription;
  const infoLinks = copy.infoLinks;
  const requestTeamName = () => {
    const name = window.prompt(copy.promptTeamName);
    if (name === null) return;
    onCreateTeamBoard(name);
  };

  return (
    <section className="border-b border-[#e2e5ea] bg-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col px-4 sm:px-5">
        <div className="flex min-h-20 flex-col gap-4 border-b border-[#edf0f4] py-4 lg:flex-row lg:items-center lg:justify-between">
          <button
            aria-label={copy.refreshLabel}
            className="flex w-fit items-center gap-3 rounded-xl transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#315fbd] focus:ring-offset-2"
            onClick={() => window.location.reload()}
            title={copy.refreshTitle}
            type="button"
          >
            <BrandIcon className="size-11 rounded-xl" />
            <span className="text-left">
              <span className="block text-sm font-semibold uppercase tracking-[0.22em] text-[#7a828e]">
                ClipSpace
              </span>
            </span>
          </button>

          <nav
            aria-label={copy.navLabel}
            className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#202124] lg:justify-center"
          >
            {infoLinks.map((item) => (
              <Link
                className="rounded-md px-3 py-2 transition hover:bg-[#f0f3f8] hover:text-[#315fbd]"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
            <Link
              aria-label={copy.languageTitle}
              className="grid size-9 place-items-center rounded-md border border-[#d7dce5] text-xs font-semibold text-[#354052] transition hover:border-[#9aa7bd] hover:bg-[#f7f9fc] hover:text-[#202124]"
              href={copy.languageHref}
              title={copy.languageTitle}
            >
              {copy.languageLabel}
            </Link>
          </nav>

          <div className="flex w-fit flex-nowrap items-center gap-1 rounded-full border border-[#e2e5ea] bg-[#f6f7f9] p-1">
            <ModeButton
              active={mode === "personal"}
              label={workspaceCopy.personal.label}
              onClick={() => onSelectWorkspace("personal")}
            />
            {teamBoards.length > 0 ? (
              <select
                aria-label={copy.teamSelectLabel}
                className="h-9 rounded-md border border-transparent bg-white px-2 text-sm font-semibold text-[#354052] outline-none transition focus:border-[#315fbd] focus:ring-2 focus:ring-[#dbe6ff]"
                value={currentTeam?.id ?? ""}
                onChange={(event) => {
                  if (event.target.value) {
                    onSelectWorkspace(createTeamWorkspaceKey(event.target.value));
                  }
                }}
              >
                <option value="" disabled>
                  {copy.teamSelectPlaceholder}
                </option>
                {teamBoards.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            ) : null}
            <button
              className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-[#5f6673] transition hover:bg-white hover:text-[#202124]"
              onClick={requestTeamName}
              type="button"
            >
              {copy.createTeam}
            </button>
            {mode === "team" ? (
              <>
                <button
                  className="rounded-md bg-[#315fbd] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#274d9b]"
                  onClick={onCopyTeamLink}
                  type="button"
                >
                  {copy.copyLink}
                </button>
                <button
                  className="rounded-md border border-[#ead6d6] bg-white px-3 py-2 text-sm font-semibold text-[#9a3d3d] transition hover:bg-[#fff6f6]"
                  onClick={onDeleteTeamBoard}
                  type="button"
                >
                  {copy.deleteTeam}
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-4 py-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a828e]">
              {mode === "personal" ? "Personal" : "Team"}
            </p>
            <h1 className="text-3xl font-semibold tracking-normal text-[#202124] sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-[#5f6673] sm:text-base">
              <span>{description}</span>
              <br />
              <span>{copy.privacyLine}</span>
            </p>
          </div>

          <div className="grid w-fit grid-cols-3 gap-2 rounded-lg border border-[#e2e5ea] bg-[#f6f7f9] p-2">
            <Stat label={copy.stats.total} value={stats.total} />
            <Stat label={copy.stats.today} value={stats.today} />
            <Stat label={copy.stats.images} value={stats.images} />
          </div>
        </div>
      </div>
    </section>
  );
}

import type { WorkspaceMode } from "@/types/clip";
import { BrandIcon } from "./common";

export function WorkspaceChooser({ onSelect }: { onSelect: (mode: WorkspaceMode) => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#18211d]/35 px-4 backdrop-blur-sm">
      <section className="w-full max-w-2xl rounded-lg border border-[#d8dfda] bg-white p-5 shadow-2xl">
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
            onClick={() => onSelect("team")}
          >
            <span className="text-sm font-semibold text-[#18211d]">팀으로 시작</span>
            <span className="mt-2 block text-sm leading-6 text-[#64756d]">
              프로젝트 자료 조사, 레퍼런스, 공유할 붙여넣기를 모으는 보드입니다.
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}

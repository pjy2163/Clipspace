import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from "react";
import { typeLabels } from "@/lib/clip";
import { ui } from "@/styles/ui";
import type { ClipType } from "@/types/clip";
import { FilterButton } from "./common";

type SidebarProps = {
  activeType: ClipType | "all";
  manualInput: string;
  query: string;
  status: string;
  sharedTeamLink?: string;
  manualInputRef: RefObject<HTMLTextAreaElement | null>;
  onAddManualClip: () => void;
  onImportFromClipboard: () => void;
  onCopySharedTeamLink?: () => void;
  onManualInputChange: (value: string) => void;
  onManualKeyDown: (event: ReactKeyboardEvent<HTMLTextAreaElement>) => void;
  onQueryChange: (value: string) => void;
  onSelectType: (type: ClipType | "all") => void;
};

export function Sidebar({
  activeType,
  manualInput,
  query,
  sharedTeamLink,
  status,
  manualInputRef,
  onAddManualClip,
  onImportFromClipboard,
  onCopySharedTeamLink,
  onManualInputChange,
  onManualKeyDown,
  onQueryChange,
  onSelectType,
}: SidebarProps) {
  return (
    <aside className="space-y-3">
      <button
        className={ui.button.paste}
        onClick={onImportFromClipboard}
      >
        <span className="block text-sm font-semibold">클립보드 가져오기</span>
        <span className="mt-2 inline-flex rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-white/95">
          Click or paste
        </span>
        <span className="mt-2 block text-xs leading-5 text-[#d7dce5]">
          버튼을 누르거나 이 화면에서 Ctrl/Cmd + V를 사용하세요.
        </span>
      </button>

      <div className={ui.panel.padded}>
        <label className={ui.form.label} htmlFor="manual">
          직접 추가
        </label>
        <textarea
          id="manual"
          ref={manualInputRef}
          className={ui.form.textarea}
          placeholder="여기에 붙여넣거나 메모를 입력하세요."
          value={manualInput}
          onChange={(event) => onManualInputChange(event.target.value)}
          onKeyDown={onManualKeyDown}
        />
        <button
          className={ui.button.primary}
          onClick={onAddManualClip}
        >
          저장
        </button>
      </div>

      <div className={ui.panel.padded}>
        <label className={ui.form.label} htmlFor="search">
          검색
        </label>
        <input
          id="search"
          className={ui.form.input}
          placeholder="내용, 제목, 카테고리"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      <div className={ui.panel.padded}>
        <p className="text-sm font-semibold text-[#202124]">분류</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <FilterButton active={activeType === "all"} onClick={() => onSelectType("all")}>
            전체
          </FilterButton>
          {(Object.keys(typeLabels) as ClipType[]).map((type) => (
            <FilterButton active={activeType === type} key={type} onClick={() => onSelectType(type)}>
              {typeLabels[type]}
            </FilterButton>
          ))}
        </div>
      </div>

      <div className={ui.panel.status}>
        <p>{status}</p>
        {sharedTeamLink ? (
          <div className="mt-3 space-y-2 rounded-md border border-[#c8d5eb] bg-white p-2">
            <a
              className="block truncate text-xs font-semibold text-[#315fbd] underline-offset-2 hover:underline"
              href={sharedTeamLink}
              target="_blank"
              rel="noreferrer"
            >
              {sharedTeamLink}
            </a>
            {onCopySharedTeamLink ? (
              <button
                className="rounded-md border border-[#d7dce5] px-2 py-1 text-xs font-semibold text-[#354052] transition hover:bg-[#f6f7f9]"
                onClick={onCopySharedTeamLink}
                type="button"
              >
                링크 다시 복사
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className={ui.panel.padded}>
        <p className="text-sm font-semibold text-[#202124]">Privacy first</p>
        <ul className="mt-3 space-y-2 text-xs leading-5 text-[#5f6673]">
          <li>브라우저 IndexedDB에 로컬 저장</li>
          <li>로그인/서버 업로드 없음</li>
          <li>민감정보 저장 전 확인</li>
          <li>안전한 이미지 형식만 허용</li>
        </ul>
      </div>
    </aside>
  );
}

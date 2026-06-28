import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from "react";
import { typeLabelsByLocale } from "@/lib/clipboard/clip";
import { ui } from "@/styles/ui";
import type { AppLocale, ClipType } from "@/types/clip";
import { FilterButton } from "@/components/common";

const sidebarCopy = {
  ko: {
    importTitle: "클립보드 가져오기",
    importHelp: "버튼을 누르거나 이 화면에서 Ctrl/Cmd + V를 사용하세요.",
    manualLabel: "직접 추가",
    manualPlaceholder: "여기에 붙여넣거나 메모를 입력하세요.",
    save: "저장",
    search: "검색",
    searchPlaceholder: "내용, 제목, 카테고리",
    filters: "분류",
    all: "전체",
    loadChanges: "새 변경사항 불러오기",
    recopyLink: "링크 다시 복사",
    privacyTitle: "Privacy first",
    privacyItems: [
      "브라우저 IndexedDB에 로컬 저장",
      "로그인/서버 업로드 없음",
      "민감정보 저장 전 확인",
      "안전한 이미지 형식만 허용",
    ],
  },
  en: {
    importTitle: "Import clipboard",
    importHelp: "Click the button or press Ctrl/Cmd + V on this screen.",
    manualLabel: "Add manually",
    manualPlaceholder: "Paste content or type a note here.",
    save: "Save",
    search: "Search",
    searchPlaceholder: "Content, title, category",
    filters: "Filters",
    all: "All",
    loadChanges: "Load new changes",
    recopyLink: "Copy link again",
    privacyTitle: "Privacy first",
    privacyItems: [
      "Stored locally in browser IndexedDB",
      "No login or server upload for personal clips",
      "Sensitive-looking content is confirmed first",
      "Only safe image formats are allowed",
    ],
  },
};

type SidebarProps = {
  activeType: ClipType | "all";
  locale?: AppLocale;
  manualInput: string;
  query: string;
  status: string;
  sharedTeamLink?: string;
  hasTeamUpdates?: boolean;
  manualInputRef: RefObject<HTMLTextAreaElement | null>;
  onAddManualClip: () => void;
  onImportFromClipboard: () => void;
  onApplyTeamUpdates?: () => void;
  onCopySharedTeamLink?: () => void;
  onManualInputChange: (value: string) => void;
  onManualKeyDown: (event: ReactKeyboardEvent<HTMLTextAreaElement>) => void;
  onQueryChange: (value: string) => void;
  onSelectType: (type: ClipType | "all") => void;
};

export function Sidebar({
  activeType,
  locale = "ko",
  manualInput,
  query,
  sharedTeamLink,
  hasTeamUpdates,
  status,
  manualInputRef,
  onAddManualClip,
  onApplyTeamUpdates,
  onImportFromClipboard,
  onCopySharedTeamLink,
  onManualInputChange,
  onManualKeyDown,
  onQueryChange,
  onSelectType,
}: SidebarProps) {
  const copy = sidebarCopy[locale];
  const typeLabels = typeLabelsByLocale[locale];

  return (
    <aside className="space-y-3">
      <button
        className={ui.button.paste}
        onClick={onImportFromClipboard}
      >
        <span className="block text-sm font-semibold">{copy.importTitle}</span>
        <span className="mt-2 inline-flex rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-white/95">
          Click or paste
        </span>
        <span className="mt-2 block text-xs leading-5 text-[#d7dce5]">
          {copy.importHelp}
        </span>
      </button>

      <div className={ui.panel.padded}>
        <label className={ui.form.label} htmlFor="manual">
          {copy.manualLabel}
        </label>
        <textarea
          id="manual"
          ref={manualInputRef}
          className={ui.form.textarea}
          placeholder={copy.manualPlaceholder}
          value={manualInput}
          onChange={(event) => onManualInputChange(event.target.value)}
          onKeyDown={onManualKeyDown}
        />
        <button
          className={ui.button.primary}
          onClick={onAddManualClip}
        >
          {copy.save}
        </button>
      </div>

      <div className={ui.panel.padded}>
        <label className={ui.form.label} htmlFor="search">
          {copy.search}
        </label>
        <input
          id="search"
          className={ui.form.input}
          placeholder={copy.searchPlaceholder}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      <div className={ui.panel.padded}>
        <p className="text-sm font-semibold text-[#202124]">{copy.filters}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <FilterButton active={activeType === "all"} onClick={() => onSelectType("all")}>
            {copy.all}
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
        {hasTeamUpdates && onApplyTeamUpdates ? (
          <button
            className="mt-3 w-full rounded-md border border-[#adc4ee] bg-white px-3 py-2 text-xs font-semibold text-[#315fbd] transition hover:bg-[#eef4ff]"
            onClick={onApplyTeamUpdates}
            type="button"
          >
            {copy.loadChanges}
          </button>
        ) : null}
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
                {copy.recopyLink}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className={ui.panel.padded}>
        <p className="text-sm font-semibold text-[#202124]">{copy.privacyTitle}</p>
        <ul className="mt-3 space-y-2 text-xs leading-5 text-[#5f6673]">
          {copy.privacyItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

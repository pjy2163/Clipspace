import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from "react";
import { typeLabels } from "@/lib/clip";
import type { ClipType } from "@/types/clip";
import { FilterButton } from "./common";

type SidebarProps = {
  activeType: ClipType | "all";
  manualInput: string;
  query: string;
  status: string;
  manualInputRef: RefObject<HTMLTextAreaElement | null>;
  onAddManualClip: () => void;
  onImportFromClipboard: () => void;
  onManualInputChange: (value: string) => void;
  onManualKeyDown: (event: ReactKeyboardEvent<HTMLTextAreaElement>) => void;
  onQueryChange: (value: string) => void;
  onSelectType: (type: ClipType | "all") => void;
};

export function Sidebar({
  activeType,
  manualInput,
  query,
  status,
  manualInputRef,
  onAddManualClip,
  onImportFromClipboard,
  onManualInputChange,
  onManualKeyDown,
  onQueryChange,
  onSelectType,
}: SidebarProps) {
  return (
    <aside className="space-y-3">
      <button
        className="w-full rounded-lg border border-[#18211d] bg-[#18211d] px-4 py-4 text-left text-white shadow-sm transition hover:bg-[#27342e]"
        onClick={onImportFromClipboard}
      >
        <span className="block text-sm font-semibold">여기를 누르면 붙여넣기가 추가됩니다</span>
        <span className="mt-2 inline-flex rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-white">
          Click to paste
        </span>
        <span className="mt-2 block text-xs leading-5 text-[#d5e3dc]">
          권한이 이미 허용돼 있으면 클릭만으로 바로 저장됩니다.
        </span>
      </button>

      <div className="rounded-lg border border-[#d8dfda] bg-white p-4 shadow-sm">
        <label className="text-sm font-semibold text-[#18211d]" htmlFor="manual">
          직접 추가
        </label>
        <textarea
          id="manual"
          ref={manualInputRef}
          className="mt-3 min-h-32 w-full resize-y rounded-md border border-[#cbd5cf] bg-[#fbfcfb] p-3 text-sm leading-6 outline-none transition focus:border-[#2f7d5b] focus:ring-2 focus:ring-[#d9eadf]"
          placeholder="여기에 붙여넣거나 메모를 입력하세요."
          value={manualInput}
          onChange={(event) => onManualInputChange(event.target.value)}
          onKeyDown={onManualKeyDown}
        />
        <button
          className="mt-3 w-full rounded-md bg-[#2f7d5b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#27684c]"
          onClick={onAddManualClip}
        >
          저장
        </button>
      </div>

      <div className="rounded-lg border border-[#d8dfda] bg-white p-4 shadow-sm">
        <label className="text-sm font-semibold text-[#18211d]" htmlFor="search">
          검색
        </label>
        <input
          id="search"
          className="mt-3 h-11 w-full rounded-md border border-[#cbd5cf] bg-[#fbfcfb] px-3 text-sm outline-none transition focus:border-[#2f7d5b] focus:ring-2 focus:ring-[#d9eadf]"
          placeholder="내용, 제목, 카테고리"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      <div className="rounded-lg border border-[#d8dfda] bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-[#18211d]">분류</p>
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

      <div className="rounded-lg border border-[#d8dfda] bg-[#eef5f1] p-4 text-sm leading-6 text-[#3f5a4e]">
        {status}
      </div>
    </aside>
  );
}

import { BrandIcon } from "./common";

export function AppLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f6f5] px-4 text-[#18211d]">
      <section className="w-full max-w-xl rounded-lg border border-[#d8dfda] bg-white p-5 text-center shadow-sm">
        <BrandIcon className="mx-auto size-12 rounded-2xl" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#718177]">
          ClipSpace 클립스페이스
        </p>
        <h1 className="mt-2 text-2xl font-semibold">온라인 클립보드와 공유 메모장</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#64756d]">
          클립스페이스는 복사한 링크, 코드, 메모, 이미지를 개인 온라인 클립보드와 팀 공유
          클립보드에 저장하고 검색해서 다시 찾는 온라인 메모장입니다.
        </p>
        <p className="mt-4 text-sm font-medium text-[#4f6258]">작업 공간을 불러오는 중입니다.</p>
      </section>
    </main>
  );
}

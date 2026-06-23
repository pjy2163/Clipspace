import { BrandIcon } from "./common";

export function AppLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f6f5] px-4 text-[#18211d]">
      <section className="w-full max-w-sm rounded-lg border border-[#d8dfda] bg-white p-5 text-center shadow-sm">
        <BrandIcon className="mx-auto size-12 rounded-2xl" />
        <h1 className="mt-4 text-xl font-semibold">Cliplog</h1>
        <p className="mt-2 text-sm text-[#64756d]">작업 공간을 불러오는 중입니다.</p>
      </section>
    </main>
  );
}

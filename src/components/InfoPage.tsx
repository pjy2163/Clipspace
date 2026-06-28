import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BrandIcon } from "./common";
import { SiteFooter } from "./SiteFooter";

const navItems = {
  ko: [
    { href: "/", label: "앱" },
    { href: "/about", label: "소개" },
    { href: "/guide", label: "사용법" },
    { href: "/privacy", label: "개인정보" },
    { href: "/use-cases", label: "활용 사례" },
  ],
  en: [
    { href: "/en/app", label: "App" },
    { href: "/en/about", label: "About" },
    { href: "/en/guide", label: "Guide" },
    { href: "/en/privacy", label: "Privacy" },
    { href: "/en/use-cases", label: "Use cases" },
  ],
};

const pageCopy = {
  ko: {
    homeHref: "/",
    brandLabel: "ClipSpace 클립스페이스",
    brandLine: "온라인 클립보드 메모장",
    languageHref: "/en",
    languageLabel: "English",
    aside:
      "복사 붙여넣기한 내용을 온라인 클립보드 카드로 저장하고, 메모를 붙이고, 필요할 때 검색하세요. 혼자 쓰는 자료는 개인 클립보드에 두고 팀 자료만 공유 클립보드로 열 수 있습니다.",
  },
  en: {
    homeHref: "/en",
    brandLabel: "ClipSpace",
    brandLine: "Shared clipboard notes",
    languageHref: "/",
    languageLabel: "한국어",
    aside:
      "Save copied links, code, notes, and images as searchable cards. Keep personal material in your browser and open team material in shared clipboard boards.",
  },
};

type InfoPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  locale?: "ko" | "en";
};

export function InfoPage({ eyebrow, title, description, children, locale = "ko" }: InfoPageProps) {
  const copy = pageCopy[locale];

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#202124]" id="top">
      <header className="border-b border-[#e2e5ea] bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link className="flex items-center gap-3" href={copy.homeHref}>
            <BrandIcon className="size-10 rounded-xl" />
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#7a828e]">
                {copy.brandLabel}
              </span>
              <span className="text-lg font-semibold">{copy.brandLine}</span>
            </span>
          </Link>
          <nav className="flex flex-wrap gap-2 text-sm font-semibold text-[#5f6673]">
            {navItems[locale].map((item) => (
              <Link
                className="rounded-md px-2.5 py-1.5 transition hover:bg-[#f0f3f8] hover:text-[#202124]"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
            <Link
              className="rounded-md border border-[#d7dce5] px-2.5 py-1.5 text-[#354052] transition hover:border-[#9aa7bd] hover:bg-[#f7f9fc]"
              href={copy.languageHref}
            >
              {copy.languageLabel}
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-5xl gap-8 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-lg border border-[#e2e5ea] bg-white p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a828e]">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-[#202124] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-7 text-[#5f6673]">{description}</p>
          <div className="mt-8 space-y-8 text-[15px] leading-7 text-[#354052]">
            {children}
          </div>
        </article>

        <aside className="space-y-4">
          <div className="aspect-[1200/630] overflow-hidden rounded-lg border border-[#e2e8f3] bg-white shadow-sm">
            <Image
              alt=""
              aria-hidden="true"
              className="size-full object-contain"
              height={630}
              priority
              src="/clipspace-preview.png"
              width={1200}
            />
          </div>
          <div className="rounded-lg border border-[#e2e5ea] bg-white p-4 text-sm leading-6 text-[#5f6673]">
            {copy.aside}
          </div>
        </aside>
      </section>
      <SiteFooter locale={locale} />
    </main>
  );
}

export function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-[#202124]">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function InfoList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li className="rounded-md border border-[#e8ecf2] bg-[#fbfcff] px-3 py-2" key={item}>
          {item}
        </li>
      ))}
    </ul>
  );
}

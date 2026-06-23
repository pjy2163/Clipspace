import Link from "next/link";
import { BrandIcon } from "./common";

const footerLinks = [
  { href: "/about", label: "소개" },
  { href: "/guide", label: "사용법" },
  { href: "/privacy", label: "개인정보" },
  { href: "/use-cases", label: "활용 사례" },
];

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "parangofsky@gmail.com";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#e2e5ea] bg-white">
      <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-5 py-10 md:grid-cols-[minmax(0,1fr)_minmax(220px,auto)_auto] md:items-end">
        <div className="space-y-4">
          <Link className="flex w-fit items-center gap-3" href="/">
            <BrandIcon className="size-11 rounded-xl" />
            <span>
              <span className="block text-sm font-semibold uppercase tracking-[0.22em] text-[#7a828e]">
                ClipSpace
              </span>
              <span className="text-sm font-medium text-[#5f6673]">
                복사한 자료를 다시 찾기 쉽게
              </span>
            </span>
          </Link>
          <p className="max-w-2xl text-sm leading-6 text-[#5f6673] lg:whitespace-nowrap">
            개인 클립은 브라우저에 저장하고, 팀 자료는 링크 보드로 필요한 사람과 공유합니다.
          </p>
          <p className="text-xs font-medium text-[#8a929f]">
            © {new Date().getFullYear()} ClipSpace. All rights reserved.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold text-[#202124]">Contact</p>
          <a
            className="inline-flex rounded-md text-[#5f6673] transition hover:text-[#315fbd]"
            href={`mailto:${contactEmail}`}
          >
            {contactEmail}
          </a>
          <nav
            aria-label="ClipSpace 하단 안내 페이지"
            className="flex flex-wrap gap-x-3 gap-y-2 text-sm font-medium text-[#5f6673]"
          >
            {footerLinks.map((item) => (
              <Link className="transition hover:text-[#202124]" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <a
          aria-label="페이지 상단으로 이동"
          className="grid size-12 place-items-center justify-self-start rounded-md border border-[#202124] bg-white text-2xl leading-none text-[#202124] transition hover:bg-[#202124] hover:text-white md:justify-self-end"
          href="#top"
          title="상단으로"
        >
          ↑
        </a>
      </div>
    </footer>
  );
}

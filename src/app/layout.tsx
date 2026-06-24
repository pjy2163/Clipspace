import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteUrl =
  configuredSiteUrl && !configuredSiteUrl.includes("localhost")
    ? configuredSiteUrl.replace(/\/$/, "")
    : process.env.NODE_ENV === "production"
      ? "https://clipspace.co.kr"
      : "http://localhost:3000";
const siteName = "ClipSpace";
const title = "ClipSpace 클립스페이스 - 공유 클립보드, 복사 붙여넣기 메모장";
const description =
  "클립스페이스는 복사한 링크, 코드, 메모, 이미지를 개인 클립보드와 팀 공유 클립보드에 저장하고 다시 찾는 온라인 메모장입니다.";
const previewImage = "/clipspace-preview.png";
const absolutePreviewImage = `${siteUrl}${previewImage}`;
const webApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: siteName,
  alternateName: ["클립스페이스", "공유 클립보드", "복사 붙여넣기 메모장", "온라인 메모장"],
  url: siteUrl,
  image: absolutePreviewImage,
  description,
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web",
  inLanguage: "ko-KR",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: title,
    template: `%s | ${siteName}`,
  },
  description,
  keywords: [
    "ClipSpace",
    "클립스페이스",
    "클립보드",
    "공유 클립보드",
    "복사 붙여넣기",
    "메모장",
    "온라인 메모장",
    "링크 저장",
    "코드 저장",
    "팀 자료 공유",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/clipspace-icon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName,
    images: [
      {
        url: previewImage,
        width: 1200,
        height: 630,
        alt: "ClipSpace clipboard workspace preview",
        type: "image/png",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [previewImage],
  },
  other: {
    "google-adsense-account": "ca-pub-7211753432405785",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-Y14L3YESDV" />
        <Script
          async
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7211753432405785"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-Y14L3YESDV');
          `}
        </Script>
        <Script
          id="clipspace-web-application"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webApplicationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

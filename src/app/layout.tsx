import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === "production" ? "https://clipspace.co.kr" : "http://localhost:3000");
const title = "ClipSpace";
const description = "복사한 링크, 코드, 메모, 이미지를 한곳에 정리합니다.";
const previewImage = "/clipspace-preview.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
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
    siteName: "ClipSpace",
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
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

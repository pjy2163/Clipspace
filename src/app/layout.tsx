import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const title = "ClipSpace";
const description =
  "복사한 텍스트, 링크, 코드, 이미지를 나만의 작업 공간에 정리하는 클립보드 대시보드입니다.";

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
    url: "/",
    siteName: "ClipSpace",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1729,
        height: 910,
        alt: "ClipSpace clipboard workspace preview",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/twitter-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

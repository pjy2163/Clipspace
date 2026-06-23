import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cliplog",
  description: "복사한 텍스트, 링크, 코드, 이미지를 로컬에서 정리하는 클립보드 대시보드입니다.",
  icons: {
    icon: "/cliplog-icon.svg",
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

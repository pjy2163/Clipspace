import type { Metadata } from "next";
import { MiniClipboard } from "@/components/app/MiniClipboard";

export const metadata: Metadata = {
  title: "ClipSpace 미니 클립보드",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MiniPage() {
  return <MiniClipboard />;
}

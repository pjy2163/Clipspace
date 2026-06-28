import type { Metadata } from "next";
import { MiniClipboard } from "@/components/app/MiniClipboard";

export const metadata: Metadata = {
  title: "ClipSpace mini clipboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EnglishMiniPage() {
  return <MiniClipboard locale="en" />;
}

import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Web Clipboard and Online Clipboard - Save copied links, code, notes, and images",
  description:
    "ClipSpace is a web clipboard and online clipboard for saving copied links, code snippets, notes, and images as searchable cards.",
};

export default function EnglishOnlineClipboardPage() {
  return (
    <InfoPage
      description="A web clipboard and online clipboard for saving copied links, code, notes, and images without installing anything."
      eyebrow="Online clipboard"
      locale="en"
      title="A web clipboard for material you need again"
    >
      <InfoSection title="Why a web clipboard helps">
        <p>
          Research, development, and writing often create a trail of copied links, commands, error
          messages, and quick notes. After the next copy, useful material can disappear from view.
          ClipSpace keeps the clips you choose to save as searchable cards grouped by date.
        </p>
        <p>
          The personal workflow is local-first: you can start without login, and personal clips stay
          in your browser by default. When material should be shared, you can open a shared clipboard
          or team clipboard board by link.
        </p>
      </InfoSection>

      <InfoSection title="What you can save">
        <InfoList
          items={[
            "Links and references to reopen later",
            "Code snippets, commands, and error messages",
            "Short notes from research or planning",
            "Screenshots and reference images",
            "Project material you want to search again",
          ]}
        />
      </InfoSection>

      <InfoSection title="From personal use to team boards">
        <p>
          Keep private material in your personal online clipboard, then create a shared clipboard or
          team clipboard board when collaborators need the same references, snippets, and notes.
        </p>
      </InfoSection>
    </InfoPage>
  );
}

import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "ClipSpace - Shared clipboard notes for links, code, and images",
  description:
    "ClipSpace helps you save copied links, code snippets, notes, and images in personal or team clipboard boards.",
};

export default function EnglishHomePage() {
  return (
    <InfoPage
      description="A lightweight clipboard workspace for saving copied links, code, notes, and screenshots so you can find them again later."
      eyebrow="ClipSpace"
      locale="en"
      title="Shared clipboard notes for work, study, and teams"
    >
      <InfoSection title="What ClipSpace is for">
        <p>
          While researching, debugging, studying, or planning, useful links and snippets often
          disappear after the next copy. ClipSpace turns the material you choose to save into
          searchable cards grouped by date.
        </p>
        <p>
          It is not a background clipboard monitor. You decide what to import, keep personal clips
          in your browser, and create team boards only when you want to share material with others.
        </p>
      </InfoSection>

      <InfoSection title="You can save">
        <InfoList
          items={[
            "Links and references you want to reopen later",
            "Code snippets, commands, and error messages",
            "Short notes that explain why something matters",
            "Screenshots and reference images",
            "Project material for a small team",
          ]}
        />
      </InfoSection>

      <InfoSection title="Personal and team boards">
        <p>
          Personal boards are stored in your browser for quick, login-free use. Team boards can be
          shared by link so collaborators can collect references, snippets, and notes in the same
          workspace.
        </p>
      </InfoSection>
    </InfoPage>
  );
}

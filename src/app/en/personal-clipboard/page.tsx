import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Personal Clipboard and Online Clipboard - Save copied material in your browser",
  description:
    "ClipSpace personal clipboard is a local-first online clipboard for copied links, code snippets, notes, and images you want to search later.",
};

export default function EnglishPersonalClipboardPage() {
  return (
    <InfoPage
      description="A local-first personal clipboard and online clipboard for saving copied links, code, notes, and images in your browser."
      eyebrow="Personal clipboard"
      locale="en"
      title="A personal online clipboard for your copied material"
    >
      <InfoSection title="What the personal clipboard solves">
        <p>
          While studying, debugging, or collecting references, copied material can pile up quickly.
          ClipSpace gives you a personal web clipboard for selected clips, then lets you search
          them later by content, title, category, and memo text.
        </p>
        <p>
          You can start without login. Personal clips use browser IndexedDB storage and are not sent
          to the server by the default personal-board flow.
        </p>
      </InfoSection>

      <InfoSection title="Good personal clipboard uses">
        <InfoList
          items={[
            "Documentation links you want to revisit",
            "Algorithm notes, commands, and debugging snippets",
            "Short ideas and work notes",
            "Screenshots and visual references",
            "Writing material for a future post or report",
          ]}
        />
      </InfoSection>

      <InfoSection title="Share only when needed">
        <p>
          The personal clipboard is the default space for your own material. When something should
          be shared with collaborators, create a separate team clipboard board and share its link.
        </p>
      </InfoSection>
    </InfoPage>
  );
}

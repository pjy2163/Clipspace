import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "ClipSpace Use Cases - Web clipboard, shared clipboard, and online notes",
  description:
    "Ways to use ClipSpace as a web clipboard, online clipboard, shared clipboard, and team clipboard for studying, development, research, writing, and small projects.",
};

export default function EnglishUseCasesPage() {
  return (
    <InfoPage
      description="ClipSpace is useful when you need a web clipboard for useful things you copy but keep losing."
      eyebrow="Use cases"
      locale="en"
      title="When an online clipboard board helps"
    >
      <InfoSection title="Development and learning">
        <p>
          Save snippets, error messages, commands, and documentation links in an online clipboard
          while learning or debugging. Later, search the board to find the context again.
        </p>
        <InfoList
          items={[
            "Keep code snippets as cards.",
            "Store error messages with solution links.",
            "Add notes about what to revisit later.",
          ]}
        />
      </InfoSection>

      <InfoSection title="Research">
        <p>
          Collect documentation, articles, lecture links, and references in one place. Add notes so
          you remember why each source was saved.
        </p>
      </InfoSection>

      <InfoSection title="Team projects">
        <p>
          A team clipboard board can hold meeting references, screenshots, and project snippets
          before or after a discussion, so the shared clipboard remains useful after chat moves on.
        </p>
      </InfoSection>

      <InfoSection title="Writing and retrospectives">
        <p>
          Keep references, solved errors, screenshots, and short observations ready when writing a
          blog post, report, or project retrospective.
        </p>
      </InfoSection>
    </InfoPage>
  );
}

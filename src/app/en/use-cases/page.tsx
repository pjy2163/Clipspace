import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "ClipSpace Use Cases - Shared clipboard and online notes",
  description:
    "Ways to use ClipSpace for studying, development, research, writing, and small team projects.",
};

export default function EnglishUseCasesPage() {
  return (
    <InfoPage
      description="ClipSpace is useful when you copy many useful things but keep losing where they went."
      eyebrow="Use cases"
      locale="en"
      title="When a shared clipboard board helps"
    >
      <InfoSection title="Development and learning">
        <p>
          Save snippets, error messages, commands, and documentation links while learning or
          debugging. Later, search the board to find the context again.
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
          A team board can hold meeting references, screenshots, and project snippets before or
          after a discussion.
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

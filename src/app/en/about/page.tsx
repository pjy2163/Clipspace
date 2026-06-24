import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "About ClipSpace - Shared clipboard note board",
  description:
    "Learn how ClipSpace helps you collect copied links, code, notes, and images in personal and team clipboard boards.",
};

export default function EnglishAboutPage() {
  return (
    <InfoPage
      description="ClipSpace is an online clipboard note board for keeping copied links, code, notes, and images easy to find."
      eyebrow="About"
      locale="en"
      title="A shared clipboard for material you need again"
    >
      <InfoSection title="Why it exists">
        <p>
          Useful links, code, error messages, and screenshots build up quickly while you work. One
          more copy can hide the thing you needed a minute ago. ClipSpace keeps selected material as
          dated cards so it is easier to recover later.
        </p>
        <p>
          ClipSpace only stores clips you explicitly paste or import. Personal material can stay in
          your browser, while team material can be opened in a shared board when collaboration is
          useful.
        </p>
      </InfoSection>

      <InfoSection title="Good fits">
        <InfoList
          items={[
            "Saving references during research",
            "Collecting debugging notes and code snippets",
            "Keeping short context notes next to links",
            "Sharing project references with teammates",
          ]}
        />
      </InfoSection>
    </InfoPage>
  );
}

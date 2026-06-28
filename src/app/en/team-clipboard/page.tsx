import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Team Clipboard and Shared Clipboard - Project links, code, notes, and images",
  description:
    "ClipSpace team clipboard boards are shared clipboard workspaces where collaborators collect project links, code snippets, notes, and screenshots.",
};

export default function EnglishTeamClipboardPage() {
  return (
    <InfoPage
      description="A team clipboard and shared clipboard board for collecting project links, code snippets, notes, and screenshots with teammates."
      eyebrow="Team clipboard"
      locale="en"
      title="A shared clipboard your collaborators can open by link"
    >
      <InfoSection title="When a team clipboard helps">
        <p>
          Project references often spread across chat threads, documents, and personal notes.
          ClipSpace team clipboard boards give the group one shared clipboard workspace for
          material everyone may need again.
        </p>
        <p>
          The flow is link-based instead of account-first: create a team board, copy the link, and
          share it with the people who should collect or review the material.
        </p>
      </InfoSection>

      <InfoSection title="Useful team board material">
        <InfoList
          items={[
            "Reference links for meetings or planning",
            "Setup notes, commands, and code snippets",
            "Research, product, design, or development references",
            "Screenshots with short context notes",
            "Shared material the team should find again later",
          ]}
        />
      </InfoSection>

      <InfoSection title="Keep private and shared material separate">
        <p>
          Personal clips can stay in your browser, while team material goes into a shared clipboard
          board. Because team boards are link-based, use them for references that are appropriate to
          share with the people who receive the link.
        </p>
      </InfoSection>
    </InfoPage>
  );
}

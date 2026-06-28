import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "ClipSpace Privacy and Security",
  description:
    "Where ClipSpace stores personal clipboard clips, how team boards work, and what sensitive material to avoid saving.",
};

export default function EnglishPrivacyPage() {
  return (
    <InfoPage
      description="Personal clips stay in your browser. Team clips are stored in shared link boards."
      eyebrow="Privacy"
      locale="en"
      title="Where your copied material is stored"
    >
      <InfoSection title="Personal boards">
        <p>
          Personal board clips are stored in your browser IndexedDB. You can use ClipSpace without
          login, and personal clips are not sent to a server by the default flow.
        </p>
      </InfoSection>

      <InfoSection title="Team boards">
        <p>
          Team boards are saved through a shared link. Anyone with the link may access that board,
          so share it only with the people who should see the material.
        </p>
      </InfoSection>

      <InfoSection title="Sensitive material">
        <p>
          Strings that look like card numbers, tokens, API keys, or passwords are flagged before
          saving. This is not a perfect secret detector, so avoid storing passwords or confidential
          company data.
        </p>
      </InfoSection>

      <InfoSection title="Image formats">
        <InfoList
          items={[
            "Allowed: PNG, JPEG, WebP, GIF",
            "Excluded: SVG",
            "SVG can contain scripts, event handlers, and external references, so it is excluded in the MVP.",
            "Images are saved only when you paste or import them yourself.",
          ]}
        />
      </InfoSection>
    </InfoPage>
  );
}

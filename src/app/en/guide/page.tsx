import type { Metadata } from "next";
import Script from "next/script";
import { InfoList, InfoPage, InfoSection } from "@/components/InfoPage";

const faqItems = [
  {
    question: "Does ClipSpace save everything I copy automatically?",
    answer: "No. ClipSpace saves only the material you import or paste into the app.",
  },
  {
    question: "What is the difference between personal and team boards?",
    answer:
      "Personal boards are for your own browser. Team clipboard boards can be shared by link so collaborators can use the same shared clipboard workspace.",
  },
  {
    question: "What can I search?",
    answer:
      "You can search saved links, code, notes, card titles, categories, and attached memo text.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export const metadata: Metadata = {
  title: "ClipSpace Guide - Save and search web clipboard material",
  description:
    "How to save copied links, code, notes, and images in ClipSpace's web clipboard, online clipboard, and team shared clipboard boards.",
};

export default function EnglishGuidePage() {
  return (
    <InfoPage
      description="Copy, paste, save, and search. ClipSpace keeps only the web clipboard material you choose to import."
      eyebrow="Guide"
      locale="en"
      title="How to turn copied material into searchable clipboard cards"
    >
      <InfoSection title="1. Copy and import">
        <p>
          Copy a link, code snippet, or note, then use the import action in ClipSpace to save it as
          a card. If browser clipboard permission is blocked, paste into the manual input instead.
        </p>
        <InfoList
          items={[
            "Links are grouped as link cards.",
            "Code-like text is categorized as code.",
            "Images can be saved as PNG, JPEG, WebP, or GIF.",
            "Sensitive-looking values are flagged before saving.",
          ]}
        />
      </InfoSection>

      <InfoSection title="2. Add context">
        <p>
          Add memo text below a card to remember why you saved it or what part matters. Image memos
          can be attached too.
        </p>
      </InfoSection>

      <InfoSection title="3. Search and filter">
        <p>
          Search checks the card content, title, category, and memo text. Filters help narrow the
          board to links, code, images, or other saved material.
        </p>
      </InfoSection>

      <InfoSection title="4. Share with a team">
        <p>
          Create a team clipboard board and copy its link when you want teammates to collect
          references, meeting material, screenshots, or snippets in one shared clipboard.
        </p>
      </InfoSection>

      <InfoSection title="FAQ">
        <div className="space-y-4">
          {faqItems.map((item) => (
            <section key={item.question}>
              <h3 className="font-semibold text-[#202124]">{item.question}</h3>
              <p className="mt-1">{item.answer}</p>
            </section>
          ))}
        </div>
      </InfoSection>
      <Script
        id="clipspace-en-guide-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </InfoPage>
  );
}

import type { Metadata } from "next";
import Script from "next/script";
import { InfoList, InfoPage, InfoSection } from "@/components/info/InfoPage";

const faqItems = [
  {
    question: "ClipSpace는 복사한 내용을 자동으로 저장하나요?",
    answer:
      "아니요. 사용자가 가져오기 버튼을 누르거나 직접 붙여넣은 내용만 저장합니다.",
  },
  {
    question: "개인 클립보드와 공유 클립보드는 어떻게 다른가요?",
    answer:
      "개인 클립보드는 혼자 쓰는 온라인 메모장처럼 사용할 수 있고, 팀 보드는 링크를 공유한 사람들과 함께 보는 공유 클립보드로 사용할 수 있습니다.",
  },
  {
    question: "어떤 내용을 저장하고 검색할 수 있나요?",
    answer:
      "링크, 코드, 일반 메모, 이미지 클립을 저장한 뒤 검색창에서 제목, 내용, 카테고리, 메모까지 함께 찾을 수 있습니다.",
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
  title: "온라인 클립보드 사용법 - 클립스페이스 저장과 검색",
  description:
    "복사한 내용을 ClipSpace 웹 클립보드와 온라인 클립보드에 저장하고 메모, 검색, 팀 공유 클립보드로 다시 쓰는 방법입니다.",
};

export default function GuidePage() {
  return (
    <InfoPage
      description="복사하고, 붙여넣고, 필요할 때 검색하세요. ClipSpace는 직접 저장한 클립만 보관하는 웹 클립보드 메모장입니다."
      eyebrow="Guide"
      title="복사 붙여넣기한 내용을 온라인 클립보드 카드로 쌓는 방법"
    >
      <InfoSection title="1. 복사한 뒤 가져오기">
        <p>
          링크나 코드를 복사한 뒤 ClipSpace에서 가져오기 버튼을 누르면 웹 클립보드
          내용이 카드로 저장됩니다. 브라우저 권한이 막히면 직접 추가 칸에
          붙여넣고 Enter를 누르면 됩니다.
        </p>
        <InfoList
          items={[
            "링크는 링크 카드로 모입니다.",
            "코드처럼 보이는 내용은 코드 카드로 분류됩니다.",
            "이미지는 PNG, JPEG, WebP, GIF만 저장됩니다.",
            "비밀번호나 API 키처럼 보이면 저장 전 확인합니다.",
          ]}
        />
      </InfoSection>

      <InfoSection title="2. 메모로 맥락 남기기">
        <p>
          카드 아래 메모 줄을 열면 댓글처럼 메모를 달 수 있습니다. 왜 저장했는지,
          어떤 부분을 봐야 하는지 적어두면 나중에 훨씬 빨리 찾을 수 있습니다.
          이미지 메모도 붙여넣을 수 있습니다.
        </p>
      </InfoSection>

      <InfoSection title="3. 검색하고 좁혀보기">
        <p>
          검색창은 카드 내용, 제목, 카테고리, 메모까지 함께 찾습니다. 링크만 보기,
          코드만 보기, 이미지 모아보기처럼 필요한 카드만 빠르게 좁힐 수 있습니다.
        </p>
      </InfoSection>

      <InfoSection title="4. 팀 링크로 같이 보기">
        <p>
          팀 보드를 만들고 링크를 복사하면 같은 공유 클립보드와 팀 클립보드를 팀원과 볼 수 있습니다.
          프로젝트 참고 링크, 회의 자료, 코드 조각을 한곳에 모을 때 유용합니다.
        </p>
        <p>
          팀 링크를 아는 사람이 접근할 수 있으니, 비밀 자료보다는 함께 봐도 되는
          레퍼런스 위주로 쓰는 것을 권장합니다.
        </p>
      </InfoSection>

      <InfoSection title="자주 묻는 질문">
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
        id="clipspace-guide-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </InfoPage>
  );
}

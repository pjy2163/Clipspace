import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "ClipSpace 소개 - 공유 클립보드 메모장",
  description:
    "복사 붙여넣기한 링크, 코드, 메모, 이미지를 개인 클립보드와 팀 공유 클립보드에 모으는 ClipSpace를 소개합니다.",
};

export default function AboutPage() {
  return (
    <InfoPage
      description="복사 붙여넣기한 링크, 코드, 메모, 이미지를 한곳에 모아 다시 찾기 쉽게 정리하는 온라인 클립보드 메모장입니다."
      eyebrow="About"
      title="방금 복사한 자료를 다시 찾는 공유 클립보드"
    >
      <InfoSection title="이런 불편함을 줄입니다">
        <p>
          자료를 찾다 보면 링크, 코드, 오류 메시지, 캡처 이미지가 계속 생깁니다.
          그런데 한 번 더 복사하는 순간 이전 내용은 금방 사라집니다. ClipSpace는 그런
          자료를 날짜별 카드로 남겨 다시 꺼내 쓰기 쉽게 만드는 복사 붙여넣기 메모장입니다.
        </p>
        <p>
          자동으로 몰래 수집하는 도구가 아니라, 사용자가 가져오기로 선택한 클립만
          저장합니다. 그래서 개인 자료는 개인 클립보드에 가볍게 보관하고, 필요한
          자료만 팀 공유 클립보드로 열 수 있습니다.
        </p>
      </InfoSection>

      <InfoSection title="무엇을 모을 수 있나요?">
        <InfoList
          items={[
            "나중에 다시 열어볼 링크와 레퍼런스",
            "풀이, 디버깅, 설정에 쓰는 코드 조각",
            "자료를 찾으며 남긴 짧은 메모",
            "화면 캡처나 참고 이미지",
            "팀원과 같이 볼 프로젝트 자료",
          ]}
        />
      </InfoSection>

      <InfoSection title="개인 클립보드와 팀 공유 클립보드">
        <p>
          개인 보드는 혼자 보는 클립 목록입니다. 브라우저에 저장되기 때문에 로그인
          없이 빠르게 시작할 수 있습니다. 팀 보드는 링크를 만들어 팀원에게 공유하고,
          같은 링크에서 자료를 함께 모으는 방식입니다.
        </p>
        <p>
          지금은 복잡한 가입보다 빠른 기록에 집중했습니다. 먼저 복사한 자료를 잘
          모으고, 협업이 필요할 때 팀 링크로 넓히는 흐름입니다.
        </p>
      </InfoSection>
    </InfoPage>
  );
}

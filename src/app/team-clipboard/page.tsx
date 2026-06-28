import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "팀 클립보드 - 링크로 같이 쓰는 팀 공유 클립보드",
  description:
    "ClipSpace 팀 클립보드는 프로젝트 링크, 코드 조각, 회의 자료, 참고 이미지를 팀원과 함께 모으는 공유 클립보드이자 팀 공유 클립보드입니다.",
};

export default function TeamClipboardPage() {
  return (
    <InfoPage
      description="팀 링크 하나로 프로젝트 자료, 코드 조각, 회의 참고 자료를 함께 모으는 팀 클립보드이자 팀 공유 클립보드입니다."
      eyebrow="Team clipboard"
      title="팀원이 같이 쓰는 팀 공유 클립보드"
    >
      <InfoSection title="팀 클립보드가 필요한 순간">
        <p>
          프로젝트를 하다 보면 각자 찾은 링크, 코드 조각, 캡처 이미지, 회의 자료가
          여러 채팅방과 문서에 흩어집니다. ClipSpace 팀 클립보드는 공유 클립보드 링크를 기준으로
          같은 보드에 자료를 모아 다시 찾기 쉽게 정리합니다.
        </p>
        <p>
          복잡한 계정 초대보다 빠른 공유 흐름에 집중했습니다. 팀 보드를 만들고 링크를
          복사하면 필요한 사람과 같은 자료 보드를 열 수 있습니다.
        </p>
      </InfoSection>

      <InfoSection title="팀 보드에 모으기 좋은 자료">
        <InfoList
          items={[
            "회의 전에 같이 볼 참고 링크",
            "프로젝트 설정이나 디버깅에 필요한 코드 조각",
            "기획, 디자인, 개발 레퍼런스",
            "화면 캡처와 이미지 메모",
            "팀원이 다시 찾아야 하는 공통 자료",
          ]}
        />
      </InfoSection>

      <InfoSection title="개인 자료와 팀 자료 분리">
        <p>
          개인 클립은 내 브라우저에 두고, 공유가 필요한 자료만 팀 공유 클립보드로
          보낼 수 있습니다. 팀 링크를 아는 사람이 접근할 수 있으므로 비밀 자료보다는
          함께 봐도 되는 레퍼런스 위주로 쓰는 것을 권장합니다.
        </p>
      </InfoSection>
    </InfoPage>
  );
}

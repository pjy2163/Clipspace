import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "웹 클립보드와 온라인 클립보드 - 복사한 링크와 코드를 다시 찾는 ClipSpace",
  description:
    "ClipSpace는 복사한 링크, 코드, 메모, 이미지를 카드로 저장하고 검색해서 다시 찾는 웹 클립보드이자 온라인 클립보드입니다.",
};

export default function OnlineClipboardPage() {
  return (
    <InfoPage
      description="설치 없이 웹에서 복사한 링크, 코드, 메모, 이미지를 저장하고 필요할 때 검색하는 웹 클립보드이자 온라인 클립보드입니다."
      eyebrow="Online clipboard"
      title="복사한 자료를 다시 찾는 웹 클립보드"
    >
      <InfoSection title="온라인 클립보드가 필요한 이유">
        <p>
          자료를 조사하거나 개발하다 보면 링크, 코드 조각, 오류 메시지, 짧은 메모를
          계속 복사합니다. 하지만 다음 내용을 복사하는 순간 이전 자료는 금방 잊히기
          쉽습니다. ClipSpace는 사용자가 직접 가져온 클립을 날짜별 카드로 저장해 다시
          찾기 쉽게 만듭니다.
        </p>
        <p>
          브라우저에서 바로 열 수 있는 웹 클립보드라 별도 설치 없이 시작할 수 있고,
          개인 자료는 내 브라우저에 저장하는 로컬 우선 흐름을 유지합니다. 팀과 같이
          봐야 하는 자료는 공유 클립보드나 팀 클립보드로 확장할 수 있습니다.
        </p>
      </InfoSection>

      <InfoSection title="저장할 수 있는 자료">
        <InfoList
          items={[
            "나중에 다시 열어볼 링크와 문서",
            "개발 중 복사한 코드 조각과 명령어",
            "자료 조사 중 남긴 짧은 메모",
            "참고 이미지와 화면 캡처",
            "검색으로 다시 찾아야 하는 프로젝트 자료",
          ]}
        />
      </InfoSection>

      <InfoSection title="개인과 팀으로 확장">
        <p>
          혼자 보는 자료는 개인 온라인 클립보드에 두고, 같이 봐야 하는 자료는 팀 공유
          클립보드로 열 수 있습니다. 처음에는 개인 자료 정리로 시작하고, 협업이 필요할
          때 팀 링크를 만들어 공유하는 흐름입니다.
        </p>
      </InfoSection>
    </InfoPage>
  );
}

import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Cliplog 사용법",
  description: "복사한 내용을 Cliplog에 저장하고 메모, 검색, 팀 공유로 다시 쓰는 방법입니다.",
};

export default function GuidePage() {
  return (
    <InfoPage
      description="복사하고, 가져오고, 필요할 때 검색하세요. Cliplog는 직접 저장한 클립만 보관합니다."
      eyebrow="Guide"
      title="복사한 내용을 카드로 쌓는 방법"
    >
      <InfoSection title="1. 복사한 뒤 가져오기">
        <p>
          링크나 코드를 복사한 뒤 Cliplog에서 가져오기 버튼을 누르면 카드로 저장됩니다.
          브라우저 권한이 막히면 직접 추가 칸에 붙여넣고 Enter를 누르면 됩니다.
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
          팀 보드를 만들고 링크를 복사하면 같은 자료함을 팀원과 볼 수 있습니다.
          프로젝트 참고 링크, 회의 자료, 코드 조각을 한곳에 모을 때 유용합니다.
        </p>
        <p>
          팀 링크를 아는 사람이 접근할 수 있으니, 비밀 자료보다는 함께 봐도 되는
          레퍼런스 위주로 쓰는 것을 권장합니다.
        </p>
      </InfoSection>
    </InfoPage>
  );
}

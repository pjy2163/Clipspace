import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "ClipSpace 활용 사례 - 웹 클립보드, 온라인 클립보드와 공유 메모장",
  description:
    "공부, 개발, 자료 조사, 팀 프로젝트에서 웹 클립보드, 온라인 클립보드, 공유 클립보드로 ClipSpace를 쓰기 좋은 상황입니다.",
};

export default function UseCasesPage() {
  return (
    <InfoPage
      description="복사할 것은 많은데 어디에 뒀는지 자주 잊는 작업에 잘 맞는 웹 클립보드 저장 도구입니다."
      eyebrow="Use cases"
      title="온라인 클립보드가 필요한 순간"
    >
      <InfoSection title="개발 공부">
        <p>
          알고리즘 풀이, 디버깅, 라이브러리 설정을 하다 보면 코드 조각과 에러 메시지를
          자주 복사합니다. ClipSpace에 모아두면 방금 참고한 코드와 링크를
          웹 클립보드처럼 다시 찾기 쉽습니다.
        </p>
        <InfoList
          items={[
            "코드 조각을 카드로 저장합니다.",
            "에러 메시지와 해결 링크를 함께 둡니다.",
            "나중에 볼 포인트를 메모로 남깁니다.",
          ]}
        />
      </InfoSection>

      <InfoSection title="자료 조사">
        <p>
          공식 문서, 블로그, 강의, 지도 링크처럼 여러 출처를 비교할 때 유용합니다.
          링크만 저장하는 것이 아니라 “왜 저장했는지”를 온라인 메모장처럼 같이
          남길 수 있습니다.
        </p>
      </InfoSection>

      <InfoSection title="팀 프로젝트">
        <p>
          팀 링크 보드에 레퍼런스와 캡처 이미지를 모으면 회의 전에 자료를 다시 찾는
          시간을 줄일 수 있습니다. 간단한 공유 클립보드, 팀 클립보드, 공유 자료함처럼 쓸 수 있습니다.
        </p>
      </InfoSection>

      <InfoSection title="글쓰기와 회고">
        <p>
          프로젝트 회고나 블로그 글을 쓸 때 참고 링크, 해결한 오류, 화면 캡처를 모아두면
          글의 근거 자료를 빠르게 꺼낼 수 있습니다.
        </p>
      </InfoSection>
    </InfoPage>
  );
}

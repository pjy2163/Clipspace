import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "개인 클립보드 - 내 브라우저에 저장하는 복사 붙여넣기 메모장",
  description:
    "ClipSpace 개인 클립보드는 복사한 링크, 코드, 메모, 이미지를 내 브라우저에 저장하고 검색하는 로컬 우선 클립보드입니다.",
};

export default function PersonalClipboardPage() {
  return (
    <InfoPage
      description="혼자 쓰는 자료를 내 브라우저에 저장하고, 필요할 때 검색해서 다시 꺼내는 개인 클립보드입니다."
      eyebrow="Personal clipboard"
      title="내 복사 자료를 보관하는 개인 클립보드"
    >
      <InfoSection title="개인 클립보드가 해결하는 일">
        <p>
          공부하거나 개발할 때 복사한 링크, 코드, 오류 메시지, 메모는 금방 흩어집니다.
          ClipSpace 개인 클립보드는 사용자가 직접 저장한 자료를 브라우저에 남겨두고,
          나중에 제목, 내용, 카테고리, 메모로 다시 찾을 수 있게 합니다.
        </p>
        <p>
          기본 흐름에서는 로그인 없이 사용할 수 있고, 개인 클립은 서버로 보내지 않고
          브라우저 IndexedDB에 저장합니다.
        </p>
      </InfoSection>

      <InfoSection title="혼자 정리하기 좋은 자료">
        <InfoList
          items={[
            "다시 보고 싶은 문서 링크",
            "알고리즘 풀이와 디버깅 코드 조각",
            "짧은 아이디어와 작업 메모",
            "스크린샷과 이미지 참고 자료",
            "나중에 정리할 글쓰기 재료",
          ]}
        />
      </InfoSection>

      <InfoSection title="필요할 때만 팀으로 공유">
        <p>
          개인 클립보드는 혼자 쓰는 기본 작업 공간입니다. 팀과 같이 봐야 하는 자료가
          생기면 별도 팀 공유 클립보드를 만들고 링크로 공유할 수 있습니다.
        </p>
      </InfoSection>
    </InfoPage>
  );
}

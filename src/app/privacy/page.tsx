import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Cliplog 개인정보와 보안",
  description: "Cliplog가 복사 내용을 어디에 저장하고 어떤 자료를 조심해야 하는지 안내합니다.",
};

export default function PrivacyPage() {
  return (
    <InfoPage
      description="개인 클립은 내 브라우저에, 팀 클립은 공유 링크 보드에 저장됩니다."
      eyebrow="Privacy"
      title="내 복사 내용은 어디에 저장될까요?"
    >
      <InfoSection title="개인 보드">
        <p>
          개인 보드의 클립은 브라우저 IndexedDB에 저장됩니다. 로그인 없이 사용할 수
          있고, 기본 동작에서는 개인 클립을 서버로 보내지 않습니다. 같은 기기의 같은
          브라우저에서 다시 열어볼 수 있습니다.
        </p>
      </InfoSection>

      <InfoSection title="팀 보드">
        <p>
          팀 보드는 공유 링크를 기준으로 Supabase에 저장됩니다. 팀 링크를 가진 사람이
          같은 보드에 들어올 수 있으므로, 링크는 필요한 사람에게만 공유해야 합니다.
        </p>
      </InfoSection>

      <InfoSection title="민감정보 감지">
        <p>
          카드번호, 토큰, API key, 비밀번호처럼 보이는 문자열은 저장 전 한 번 더
          확인합니다. 단, 모든 비밀값을 완벽하게 잡는 기능은 아니므로 중요한 비밀번호나
          회사 기밀은 저장하지 않는 것이 좋습니다.
        </p>
      </InfoSection>

      <InfoSection title="이미지 형식 제한">
        <InfoList
          items={[
            "허용 형식: PNG, JPEG, WebP, GIF",
            "제외 형식: SVG",
            "SVG는 이미지처럼 보이지만 스크립트, 이벤트 핸들러, 외부 참조를 포함할 수 있어 MVP에서는 제외했습니다.",
            "이미지 클립은 사용자가 직접 붙여넣거나 가져온 경우에만 저장됩니다.",
          ]}
        />
      </InfoSection>

      <InfoSection title="사용자가 기억해야 할 점">
        <p>
          Cliplog는 자료 정리 도구이지 비밀번호 보관함이 아닙니다. 중요한 비밀값은
          전용 비밀번호 관리 도구에 보관하고, Cliplog에는 다시 찾아야 할 링크, 코드,
          메모, 이미지 위주로 남기는 것을 권장합니다.
        </p>
      </InfoSection>
    </InfoPage>
  );
}

# ClipSpace

![ClipSpace 미리보기](./public/clipspace-preview.png)

ClipSpace는 복사한 텍스트, 링크, 코드 조각, 이미지를 한눈에 정리하는 로컬 우선 클립보드 대시보드입니다.

공부하거나 개발하면서 자료를 찾다 보면 복사한 링크, 코드, 메모가 금방 흩어집니다. ClipSpace는 이 불편함에서 시작한 프로젝트입니다. 복사한 내용을 웹에서 붙여넣거나 가져오면 날짜별 타임라인에 저장하고, 개인/팀 작업 공간에 맞춰 다시 찾아볼 수 있게 만드는 것이 목표입니다.

## 주요 기능

- 붙여넣기 단축키 또는 가져오기 버튼으로 클립 저장
- 이미지 클립과 이미지 메모 저장
- 개인/팀 작업 공간 분리
- 날짜별 타임라인 정리
- 링크, 코드, 연락처, 민감정보로 보이는 텍스트 자동 감지
- 복사한 링크의 간단한 제목 추론
- 클립별 댓글형 메모 작성
- 검색, 필터, 고정, 공유, 삭제
- 화면 크기에 맞춘 반응형 UI와 패널 크기 조절

## 개인정보와 보안 방향

ClipSpace MVP는 사용자가 가장 걱정할 수 있는 “내 복사 내용이 안전한가?”를 우선 고려해 로컬 우선 구조로 만들었습니다.

- 로그인 없이 사용할 수 있습니다.
- 저장된 클립은 브라우저의 IndexedDB에 보관합니다.
- 기본 동작에서는 저장된 클립을 서버로 전송하지 않습니다.
- 카드번호, 토큰, API key처럼 보이는 텍스트는 민감 항목으로 표시합니다.
- 붙여넣은 이미지는 `image/png`, `image/jpeg`, `image/webp`, `image/gif`만 허용합니다.
- 사용자가 붙여넣는 SVG 이미지는 MVP에서 제외했습니다. SVG는 이미지처럼 보이지만 스크립트, 이벤트 핸들러, 외부 참조, XML 동작을 포함할 수 있어 별도 검증이 필요합니다.

자세한 보안 메모는 [SECURITY.md](./SECURITY.md)에 정리했습니다.

## 기술 스택

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- IndexedDB

## 실행 방법

```bash
npm install
cp .env.example .env.local
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

팀 보드 동기화를 사용하려면 Supabase SQL Editor에서
[`supabase/schema.sql`](./supabase/schema.sql)을 실행하고 `.env.local`에 Supabase 값을 채웁니다.

## 스크립트

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## 폴더 구조

```text
src/app/          Next.js 앱 진입점
src/components/   UI 컴포넌트
src/lib/          클립, 이미지, 저장소, 공유 로직
src/styles/       공통 UI 스타일 토큰
src/types/        공통 TypeScript 타입
```

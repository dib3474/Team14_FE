# FestaPick 독립 UI 개선 명세

사용자가 제공한 2026-11-12 전체 UI/UX 요청을 구현 명세로 삼는다. develop318f31c의 기존 디자인에서 새 분기를 만들며 feature/mobile-design36ff3e2를 보존하고 비교한다. 이 문서의 색상 사용·레이아웃 세부는 구현자의 선택이며 사용자 제시 명세를 바꾸지 않는다.

## 의도와 범위

브랜드 오렌지·블루와 로고/지도/캐릭터를 유지하는 밝고 친근한 모바일 서비스. 흰 표면·차분한 블루그레이 배경·선명한 잉크색 글자로 이전 개선안의 아이보리·초록 바탕과 다른 안을 만든다. 기능 보존, 가독성, 일관성, 반응형 사용성, 시각적 완성도 순서로 판단한다.

## 접근법

기존 개선 브랜치를 다시 수정하는 방법은 독립 비교 목적에 맞지 않는다. 기존 개선안을 전체 cherry-pick하면 원본 develop의 업무 로직을 보존할 수 없다. 따라서 develop에서 독립 UI 구현하고 두 프리뷰에 같은 명시적 fixture를 연결하는 방법을 택했다. API/인증/검색/추천/채팅 훅·라우터는 원본과 일치시킨다. 미리보기 fixture의 로그인은 미리보기에서만 제공하며 실제 인증을 우회하지 않는다.

## 화면과 공통 계약

- 모든20개 primary/secondary 색상 값, 원본 이미지·SVG, 핀 좌표와 목적지 보존. 새 의존성/원격 변경 없음.
- max480px 모바일 shell, header56px/nav72px +safe area. ui-page 공통 여백20px(320px에서는16px), panel20px/control14px radius. 낮은 테두리와 얕은 그림자만 사용.
- 공통 ui-panel/ui-inset/ui-title/ui-section-title/ui-eyebrow/ui-body/ui-caption/ui-tag/ui-tabs/ui-feedback/ui-control 클래스를 단일 UI 토큰에서 제공한다. 버튼 API와 OutlineInputField native props는 유지한다. orange primary에는 어두운 글자, 보조는 blue tint로 충분한 대비를 확보.
- 홈은 밝은 블루 지도 panel과 읽기 쉬운 제목/지역 선택 모달. 지도 stage 원본 비율을 유지해 핀과 지도 좌표가 일치한다.
- 목록/검색은 포스터 중심 카드, 분리된 날짜/지역/평점/관심 정보를 갖는다. 기존 query·디바운스·필터·AI 응답 처리 및 URL을 유지한다. 검색의 동작 없는 아이콘을 임의로 새 제출 로직으로 바꾸지 않는다.
- 상세는 포스터 원본 전체, 제목/일정/장소/행동을 연결하고 공지·리뷰·관리 구역을 같은 표면 규칙으로 묶는다. 기존 요청·리뷰 집계/로딩·인증 조건 유지.
- AI PICK은 기존 선택값/단계를 유지하며 native button·pressed 상태·진행 안내로 개선한다. 결과 요약/카드도 같은 색상 역할을 쓴다.
- My/Login/Chat/Settings는 공통 표면·입력·탭·상태를 사용한다. 채팅은 UI viewport 높이와 스크롤 책임만 개선하며 STOMP/전송 로직은 보존한다.

## 비교와 검증

원본 develop/이전 개선36ff3e2/새 개선의3방향 스크린샷과 비교 페이지를 만든다. 비교 fixture는 모든 안에 같은 데이터를 주고 로컬 전용 entry에서만 실행한다. 로그인 제한 화면은 실제 component와 mock provider 상태로 표시하고 표시용임을 명시한다. production router/auth는 변경하지 않는다.
320/375/480/768/1280px, 긴 제목·빈/오류/선택·확대 상태 확인. typecheck/lint/test/build를 실행하고 전후 파일·검증·한계를 한국어 보고한다. 실제 OAuth·STOMP·업로드/물리 키보드는 검증하지 않으면 완료로 쓰지 않는다.

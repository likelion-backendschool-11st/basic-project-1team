# GAMERS API 명세서

- 버전: v0.1 (초안, 2026-11-12)
- 근거: `frontend/src/apps/*` 화면·mock 데이터, GitHub WBS 이슈 #44 ~ #79, `backend/docs/CODE_CONVENTION.md`
- 화면과 이 문서가 다르면 **이 문서를 기준**으로 하고, 바꿔야 하면 문서를 먼저 수정합니다.
- 이번 범위에서 제외한 항목은 [11. 결정 필요 사항](#11-결정-필요-사항)에 모아 두었습니다.

---

## 목차

1. [공통 규칙](#1-공통-규칙)
2. [인증 / 회원 (auth, users)](#2-인증--회원)
3. [질문 (questions)](#3-질문)
4. [답변 (answers)](#4-답변)
5. [태그 (tags)](#5-태그)
6. [첨부파일 (attachments)](#6-첨부파일)
7. [자유게시판 (posts, comments)](#7-자유게시판)
8. [신고 (reports)](#8-신고)
9. [공지 (notices)](#9-공지)
10. [관리자 (admin)](#10-관리자)
11. [결정 필요 사항](#11-결정-필요-사항)
12. [에러 코드 모음](#12-에러-코드-모음)

---

## 1. 공통 규칙

### 1.1 Base URL

```text
/api
```

프론트엔드 SPA가 `/board`, `/qna`, `/admin` 경로를 쓰므로 API는 모두 `/api` 아래에 둡니다. 이 문서의 경로는 `/api`를 생략하지 않고 적습니다.

### 1.2 인증

인증은 **JWT**로 합니다.

- 로그인 성공 시 받은 Access Token을 헤더에 담아 보냅니다.

```http
Authorization: Bearer <accessToken>
```

| 항목 | 내용 |
| --- | --- |
| 토큰 종류 | Access Token 1개 (Refresh Token 없음) |
| 서명 알고리즘 | HS256, 비밀키는 환경 변수 `JWT_SECRET` |
| Payload | `{ "sub": <회원 id>, "role": "USER" \| "ADMIN", "iat", "exp" }` |
| 만료 시간 | 기본 1일, 로그인 시 `rememberMe: true`면 14일 |
| 프론트엔드 보관 | `rememberMe: true`면 `localStorage`, 아니면 `sessionStorage`. 키 이름은 `accessToken` |
| 만료/위조/누락 | `401 UNAUTHORIZED` → 프론트엔드는 토큰을 지우고 로그인 화면으로 이동 |

- 인증 미들웨어는 토큰 검증 후 **매 요청마다 DB에서 회원 상태를 다시 확인**합니다. 그래서 정지·탈퇴·권한 변경은 토큰 만료를 기다리지 않고 바로 적용됩니다.
  - 탈퇴했거나 없는 회원이면 `401 UNAUTHORIZED`
  - 권한은 토큰의 `role`이 아니라 DB 값을 기준으로 판단합니다.
- 비밀번호 변경·재설정 후에도 기존 토큰은 만료 전까지 유효합니다. (Refresh Token과 토큰 무효화 목록을 두지 않기 때문)
- **로그아웃은 서버 API가 없습니다.** 프론트엔드가 `localStorage`·`sessionStorage`의 토큰을 모두 지우고, 다른 화면으로 이동하지 않은 채 현재 화면을 로그아웃 상태로 다시 보여 줍니다. (REQ-LOGIN-007)
  - 진입점: 사용자 화면 헤더 우측 프로필 버튼 → 프로필 메뉴의 "로그아웃", 관리자 상단바 "로그아웃" 버튼
  - 로그인해야 볼 수 있는 화면(마이페이지 등)에서 로그아웃하면 로그인 화면(`/login`)으로 이동합니다.
  - 관리자 상단바 "로그아웃"은 토큰을 지우고 로그인 화면(`/login`)으로 이동합니다.
- **헤더 프로필 메뉴** (로그인 상태): 내 정보 요약(프로필 사진·닉네임·아이디)과 "마이페이지"(`/mypage`), "프로필 수정"(`/mypage/edit`), "로그아웃"을 보여 줍니다. 내 정보는 [`GET /api/users/me`](#get-apiusersme)의 `profileImageUrl`, `nickname`, `username`을 씁니다. 비로그인 상태에서 프로필 버튼을 누르면 로그인 화면으로 이동합니다. (REQ-LOGIN-007)
  - 지운 토큰도 만료 전까지는 서버에서 유효합니다. (위와 같은 이유)

- 각 API의 **인증** 칸
  - `없음`: 로그인 없이 호출 가능
  - `선택`: 로그인하면 응답에 본인 기준 값(`isMine`, `isVoted` 등)이 채워짐
  - `필수`: 로그인 필요 (없으면 `401`)
  - `ADMIN`: 관리자 권한 필요 (없으면 `403`)
- 관리자는 회원에게 아래 3가지 제재를 걸 수 있습니다. 기간은 `3` / `7` / `30`일 또는 **영구**이고, 종류가 다르면 동시에 걸 수 있습니다. ([10.2](#102-회원-관리), REQ-ADMIN-003)

| 제재 | `type` | 막히는 것 | 에러 |
| --- | --- | --- | --- |
| 이용 정지 | `suspend` | 로그인과 모든 쓰기 API (작성·수정·삭제·추천·신고) | `403 USER_SUSPENDED` |
| 글쓰기 제한 | `write_ban` | 질문·답변·게시글 작성과 수정 | `403 WRITE_BANNED` |
| 댓글 제한 | `comment_ban` | 자유게시판 댓글 작성 | `403 COMMENT_BANNED` |

  - 에러 메시지에 해제일을 넣습니다. 예: `"2026-12-01까지 글쓰기가 제한된 계정입니다."`, 영구면 `"영구 정지된 계정입니다."`
  - 기간이 지나면 별도 처리 없이 자동으로 풀립니다. (요청 시점에 해제일과 비교)
- **게시물·댓글 관리 권한** (`content_manage`, 선택·후순위 기능, REQ-ADMIN-004): 관리자가 특정 회원에게 줄 수 있습니다. 필수 기능을 먼저 개발한 뒤 추가합니다.
  - 이 권한이 있는 회원은 **작성자가 아니어도** 질문·답변·게시글을 수정·삭제하고, 댓글을 삭제할 수 있습니다. (댓글 수정 API는 없음)
  - 같은 API(`PATCH`·`DELETE /api/questions|answers|posts/...`, `DELETE /api/comments/...`)를 그대로 쓰고, 서버는 "작성자 본인 **또는** `content_manage` 권한"이면 허용합니다.
  - 작성자에게 적용되는 규칙은 똑같이 적용합니다. 답변이 달린 질문 삭제(`409 QUESTION_HAS_ANSWERS`), 채택된 답변 수정·삭제(`409 ANSWER_ALREADY_ACCEPTED`)는 이 권한으로도 할 수 없습니다.
  - 숨김·복구, 회원 제재, 신고 처리 같은 관리자 기능은 할 수 없습니다.
  - 이용 정지 중이면 권한이 있어도 쓸 수 없습니다.
  - 다른 회원의 글을 수정·삭제하면 활동 로그에 `MODERATE_EDIT` / `MODERATE_DELETE`로 남깁니다.
  - 프론트엔드는 `isMine`이 `true`이거나 내 정보(`GET /api/users/me`)의 `permissions`에 `content_manage`가 있으면 수정·삭제 버튼을 보여 줍니다.
- **비회원**은 질문/답변과 자유게시판을 읽을 수 있습니다. 기본 화면(`/`)은 질문 목록(`/qna`)입니다.
  - 작성·추천·신고 버튼을 누르면 프론트엔드가 API를 호출하지 않고 "로그인이 필요합니다" 팝업으로 로그인 화면 이동 여부를 묻습니다.
  - 로그인 화면은 `/login?redirect=<원래 경로>`로 열고, 로그인 후 원래 화면으로 돌아갑니다.
  - 작성·수정·신고 화면 주소로 바로 들어오면 로그인 화면으로 보냅니다.

### 1.3 응답 형식

`CODE_CONVENTION.md` 11장을 따릅니다.

```json
// 성공
{ "success": true, "data": { } }

// 목록
{ "success": true, "data": [ ], "meta": { "page": 1, "size": 20, "totalCount": 135 } }

// 실패
{ "success": false, "error": { "code": "QUESTION_NOT_FOUND", "message": "질문을 찾을 수 없습니다." } }
```

- 삭제 성공은 `204 No Content` (body 없음)
- 생성 성공은 `201 Created`

### 1.4 데이터 표기

| 항목 | 규칙 | 예시 |
| --- | --- | --- |
| 필드명 | `camelCase` | `viewCount`, `createdAt` |
| ID | 숫자 PK는 항상 `id` | `"id": 4029` |
| 로그인 아이디 | 모든 API에서 `username` (`userId` 사용 안 함) | `"username": "gamer_legend"` |
| 날짜/시간 | ISO 8601 (UTC) | `"2026-11-10T05:22:00.000Z"` |
| Boolean | `is` / `has` prefix | `isAccepted`, `hasAnswer` |
| Enum 값 | 소문자 `snake_case` | `"pending"`, `"has_answer"` |
| 예외 Enum | 권한, 활동 로그 action은 대문자 (화면 표기 그대로) | `"ADMIN"`, `"SANCTION_USER"` |
| 본문 | WYSIWYG 에디터가 만든 **HTML** 문자열을 저장/반환. 길이 규칙은 [1.9](#19-본문--url-규칙) | `"<p>독서대를 <strong>다시</strong> 설치</p>"` |

화면 표시용 가공(`2,334`, `2026.11.10`, `#ANS-8941`, `3일 전`)은 **프론트엔드에서** 합니다.

### 1.5 페이지네이션 / 정렬 / 검색

| Query | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `page` | number | `1` | 1부터 시작 |
| `size` | number | API별 명시 (없으면 `20`) | 최대 `100` |
| `sort` | string | API별 명시 | 정렬 기준 |
| `keyword` | string | - | 검색어 (앞뒤 공백 제거, 빈 값이면 무시) |

### 1.6 공통 객체

**UserSummary**: 작성자 등 다른 객체 안에 들어가는 회원 정보

```json
{ "id": 12, "nickname": "호야", "profileImageUrl": "https://.../a.png" }
```

탈퇴한 회원의 글은 `{ "id": null, "nickname": "탈퇴한 회원", "profileImageUrl": null }`로 내려갑니다.

**Attachment**

```json
{ "id": 77, "name": "chat-capture.png", "url": "https://.../chat-capture.png", "size": 482133, "kind": "image" }
```

- `size`: 바이트 단위 숫자
- `kind`: `image` (신고 증빙·에디터 이미지 모두 이미지 파일만 올립니다)
- `url`: 저장소에 올린 파일의 **URL을 그대로 DB에 저장**하고 그대로 내려줍니다. (프로필 사진도 같은 방식)
- `name`: 원본 파일명, **최대 15자**. 더 길면 확장자는 그대로 두고 앞부분만 남겨 15자로 줄여 저장합니다. (예: `error-screen-2024.png` → `error-scree.png`)

### 1.7 삭제 정책 (soft delete)

이 서비스에는 **완전 삭제(행 삭제)가 없습니다.** 모든 삭제는 행을 남기고 `status`만 바꾸는 soft delete이며, 앞으로 추가하는 API도 같은 규칙을 따릅니다.

- 삭제하면 `status`를 삭제 상태로 바꾸고 삭제 시각(`deletedAt`)을 기록합니다. 행과 연결 데이터는 그대로 남습니다.
- `DELETE` 메서드 API도 내부 동작은 상태 변경이며, 응답은 그대로 `204`입니다.
- 삭제 상태인 데이터는 사용자 화면의 목록·상세·검색·개수 집계에서 빠지고, 상세 조회는 `404`입니다.
- 삭제 상태는 API로 되돌리지 않습니다. (태그 차단 해제만 예외, [10.5](#105-태그-관리))
- 질문·게시글처럼 하위 데이터가 있으면 하위 데이터(답변·댓글)도 함께 삭제 상태로 바꿉니다.
- 질문-태그, 글-에디터 이미지 같은 연결도 행을 지우지 않고 `deletedAt`을 기록해 끊습니다.
- **예외**: 첨부파일과 프로필 사진의 **실제 파일**(저장소 객체)은 삭제 상태가 되면 지웁니다. DB 행은 남깁니다.

| 대상 | `status` 값 | 삭제가 일어나는 경우 |
| --- | --- | --- |
| 회원 | `active` / `withdrawn` (관리자 API의 `status`는 여기에 제재 상태 `restricted`·`suspended`를 더해 계산) | 회원 탈퇴 |
| 질문·답변·게시글·댓글 | `active` / `hidden`(관리자 숨김) / `deleted` | 작성자·관리 권한 회원·관리자 삭제 |
| 태그 | `active` / `blocked`(관리자 삭제) / `merged`(병합됨) | 관리자 삭제, 병합 |
| 공지 | `active` / `deleted` | 관리자 삭제 |
| 활동 로그 | `active` / `expired` | 작성 후 **5년**이 지나면 `expired`로 바꾸고 조회에서 뺌 |
| 첨부파일(에디터 이미지·신고 증빙) | `active` / `deleted` | 업로드한 회원 삭제(글에 연결되기 전), 연결된 글이 하나도 없는 파일 정리(업로드 후 24시간이 지난 파일). 행은 남기고 **저장소의 실제 파일은 지움** |
| 신고 | `pending` / `resolved` / `rejected` / `canceled` | 신고자 접수 취소 |
| 답변 추천 | `active` / `canceled` | 추천 취소 (다시 추천하면 같은 행을 `active`로) |

### 1.8 회원 입력값 규칙

DB 컬럼 길이와 서버 검증의 기준입니다. 프론트엔드도 같은 규칙으로 먼저 검사합니다.

| 필드 | 규칙 |
| --- | --- |
| `name` (이름) | 1~16자, **영문·한글만** (공백·숫자·특수문자·이모지 불가) |
| `nickname` | 2~16자, **영문·한글만** (공백·숫자·특수문자·이모지 불가), 중복 불가 |
| `username` (아이디) | 4~20자, 영문 소문자·숫자·`_`, 중복 불가 |
| `email` | 이메일 형식, **최대 128자**, 중복 불가 |
| `password` | **8~32자**, 영문·숫자·특수문자 중 **2종류 이상**, 공백 불가 |
| | 같은 문자 3번 연속(`aaa`), 연속된 영문·숫자 3자(`abc`, `cba`, `123`, `321`) 불가. 즉 반복·연속은 2자까지만 |

- 비밀번호는 **Argon2id**로 해시해 저장합니다. 해시 문자열은 파라미터를 포함해 100자 안팎이므로 컬럼은 `VARCHAR(255)`로 둡니다.
- 비밀번호 규칙은 회원가입, 비밀번호 재설정, 로그인 상태 비밀번호 변경에 모두 적용합니다.
- 규칙에 맞지 않으면 `400 VALIDATION_ERROR`이고, `message`에 어긋난 규칙을 적습니다.

### 1.9 본문 / URL 규칙

질문·답변·게시글·공지 본문과 회원 소개글은 WYSIWYG 에디터([Froala](https://froala.com/wysiwyg-editor/))로 작성하고, **HTML**로 저장합니다. (Markdown은 받지 않습니다)

| 항목 | 규칙 |
| --- | --- |
| 글자 수 | 태그·서식을 뺀 **순수 글자 기준 최대 10,000자** (질문은 공백 제외 15자 이상, 나머지는 1자 이상) |
| 저장 문자열 | 저장되는 HTML 문자열 **최대 100,000자** |
| DB 컬럼 | `MEDIUMTEXT` (utf8mb4). `TEXT`는 65,535바이트라 한글 HTML을 다 담지 못함 |
| 이미지 | 본문에 base64(`data:`)로 넣지 않습니다. 에디터가 [업로드 API](#post-apiattachments)(`purpose=editor_image`)로 올린 뒤 응답의 `url`만 `<img src>`로 넣습니다. 질문·답변·게시글·공지 본문 모두 쓸 수 있습니다. 질문·답변·게시글에는 따로 첨부파일 목록이 없고, 사진은 본문에 넣습니다([6장](#6-첨부파일)) |
| 영상 | 파일로 올리지 않고 **영상 주소**로 넣습니다. 에디터에 YouTube·Vimeo 주소를 넣으면 플레이어(`<iframe>`)로 바뀝니다. 서버는 `src`가 `https://www.youtube.com/embed/`, `https://player.vimeo.com/video/`로 시작하는 `<iframe>`만 남기고 나머지 `<iframe>`·`<video>`·`<object>`·`<embed>`는 지웁니다 |
| HTML 코드 보기 | 본문 에디터는 작성한 HTML을 보고 고칠 수 있는 코드 보기를 제공합니다. 코드 보기에서 넣은 HTML도 아래 보안 규칙과 위 이미지·영상 규칙으로 똑같이 정리합니다 |
| 보안 | 서버가 저장 전에 허용 목록 방식으로 정리(sanitize)해 `<script>`, 이벤트 속성(`onclick` 등), `javascript:` 링크를 제거합니다. 프론트엔드 에디터도 붙여넣기에서 같은 태그를 지우지만, 서버 정리를 대신하지 않습니다 |

- **소개글(`bio`)**: 간단 에디터(굵게·기울임·밑줄·링크)로 작성합니다. 태그를 뺀 순수 글자 **최대 200자**, 저장 HTML **최대 1,000자**, 이미지·영상·표·코드 보기 불가입니다.
- 댓글(최대 500자)과 신고 상세 사유(최대 1,000자)는 에디터 없이 일반 텍스트입니다.
- 둘 중 하나라도 넘으면 `400 VALIDATION_ERROR`이고, `message`에 넘은 기준을 적습니다.

| URL | 컬럼 | 비고 |
| --- | --- | --- |
| 첨부파일(에디터 이미지·신고 증빙) `url`, 프로필 `profileImageUrl` | `VARCHAR(512)` | 우리 저장소 URL을 그대로 저장 |

### 1.10 대소문자 / 중복 검사 / 저장 방식

DB 설계 기준으로 정한 규칙입니다.

| 항목 | 규칙 |
| --- | --- |
| 대소문자 | **구분합니다.** 아이디·이메일·닉네임 중복 확인, 로그인, 아이디·비밀번호 찾기, 모든 검색(`keyword`)에서 `Abc`와 `abc`는 다른 값입니다. 문자열 컬럼은 대소문자를 구분하는 정렬 규칙(`utf8mb4_bin` 또는 `utf8mb4_0900_as_cs`)을 씁니다 |
| 태그 예외 | 태그 이름은 [5.1](#51-태그-이름-규칙)대로 영문을 소문자로 바꿔 저장하므로, 태그 검색어도 같은 정규화를 거친 뒤 비교합니다 |
| 탈퇴 회원 값 재사용 | 탈퇴하면 아이디·이메일·닉네임을 비우므로([2장 회원 탈퇴](#delete-apiusersme)) 같은 값으로 다시 가입할 수 있습니다. 중복 검사는 탈퇴하지 않은 회원끼리만 합니다 |
| 답변 채택 | 답변 쪽에 채택 여부 상태값(`answers.is_accepted`)으로 저장합니다. "질문당 1개"는 DB 제약이 아니라 **앱에서** 채택 시 같은 질문의 채택 답변이 있는지 확인해 막습니다(질문 행을 잠그고 확인). 질문의 `isAccepted`는 이 값으로 계산합니다. 관리자가 채택된 답변을 숨기거나 삭제하면 `0`으로 바꿔 채택을 풉니다([10.3](#103-질문답변-관리)) |
| 중복 신고 | "같은 회원·같은 대상의 `pending` 신고는 1건"은 DB unique 제약이 아니라 **앱에서** 신고 등록 시 검사합니다(신고자 회원 행을 잠그고 확인). 처리가 끝난 뒤에는 다시 신고할 수 있습니다 |
| 조회수 기록 | DB 테이블 `view_histories`에 대상(종류·id)과 조회자(회원 id, 비로그인은 IP)별로 **1행**을 두고 마지막 조회 시각만 갱신합니다. 마지막 조회가 24시간보다 오래됐을 때만 조회수를 올립니다. 행을 계속 쌓지 않으므로 삭제가 필요 없습니다 |

---

## 2. 인증 / 회원

| 우선 | Method | Path | 설명 | 인증 | WBS |
| --- | --- | --- | --- | --- | --- |
| 필수 | POST | `/api/auth/signup` | 회원가입 | 없음 | - |
| 필수 | GET | `/api/users/availability` | 아이디/닉네임/이메일 중복 확인 | 없음 | #48 #49 #50 |
| 필수 | POST | `/api/auth/login` | 로그인 | 없음 | #46 |
| 필수 | POST | `/api/auth/find-username` | 아이디 찾기 | 없음 | #47 |
| 필수 | POST | `/api/auth/password-reset/verify` | 비밀번호 찾기 (본인 확인) | 없음 | #47 |
| 필수 | POST | `/api/auth/password-reset` | 비밀번호 재설정 | 없음 | #47 |
| 필수 | GET | `/api/users/me` | 내 프로필 (마이페이지) | 필수 | - |
| 필수 | PATCH | `/api/users/me` | 마이페이지 수정 (소개글) | 필수 | #53 |
| 필수 | POST | `/api/users/me/profile-image` | 프로필 사진 업로드 | 필수 | #53 |
| 필수 | PATCH | `/api/users/me/password` | 비밀번호 변경 | 필수 | #51 |
| 필수 | DELETE | `/api/users/me` | 회원 탈퇴 | 필수 | #52 |
| 필수 | GET | `/api/users/:userId` | 회원 공개 프로필 | 없음 | - |

### POST `/api/auth/signup`

회원가입 화면(`/signup`).

**Request**

```json
{
  "name": "김게이머",
  "username": "gamer_legend",
  "nickname": "레전드게이머",
  "password": "gamer!2580",
  "email": "legend@gamers.com"
}
```

| 필드 | 규칙 |
| --- | --- |
| `name` | 필수, [1.8](#18-회원-입력값-규칙) 규칙 (1~16자, 영문·한글만) |
| `username` | 필수, 4~20자, 영문 소문자·숫자·`_` |
| `nickname` | 필수, [1.8](#18-회원-입력값-규칙) 규칙 (2~16자, 영문·한글만) |
| `password` | 필수, [1.8](#18-회원-입력값-규칙) 규칙 (8~32자, 2종류 이상, 반복·연속 2자까지) |
| `email` | 필수, 이메일 형식, 최대 128자 |

- 비밀번호 확인 일치 여부는 프론트엔드에서만 검사합니다.
- 중복 확인을 했더라도 가입 시점에 서버가 다시 중복을 검사합니다.

**Response** `201`

```json
{ "success": true, "data": { "id": 12, "username": "gamer_legend", "nickname": "레전드게이머" } }
```

**Errors**: `400 VALIDATION_ERROR`, `409 USERNAME_DUPLICATED`, `409 NICKNAME_DUPLICATED`, `409 EMAIL_DUPLICATED`

### GET `/api/users/availability`

회원가입 화면의 "중복 확인" 버튼. 세 값 중 **하나만** 보냅니다.

**Query**: `username` | `nickname` | `email`

```http
GET /api/users/availability?nickname=레전드게이머
```

**Response** `200`

```json
{ "success": true, "data": { "field": "nickname", "value": "레전드게이머", "isAvailable": false } }
```

- **대소문자를 구분해** 비교합니다. ([1.10](#110-대소문자--중복-검사--저장-방식)) 탈퇴한 회원의 값은 비교하지 않습니다.
- 사용 불가여도 에러가 아니라 `isAvailable: false`로 응답합니다.

**Errors**: `400 VALIDATION_ERROR` (값이 없거나 2개 이상, [1.8](#18-회원-입력값-규칙) 형식 오류)

### POST `/api/auth/login`

**Request**

```json
{ "loginId": "gamer_legend", "password": "gamer!2580", "rememberMe": true }
```

- `loginId`: 아이디 또는 이메일
- `rememberMe`: `false`면 1일, `true`면 14일짜리 토큰을 발급
- `expiresIn`: 토큰 만료까지 남은 초

**Response** `200`

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "expiresIn": 86400,
    "user": { "id": 12, "username": "gamer_legend", "nickname": "레전드게이머", "role": "USER" }
  }
}
```

**Errors**: `401 INVALID_CREDENTIALS` (아이디 없음/비밀번호 불일치 구분 없이 동일), `403 USER_SUSPENDED`

정지 회원 응답 예시:

```json
{
  "success": false,
  "error": { "code": "USER_SUSPENDED", "message": "2026-12-01까지 이용이 정지된 계정입니다." }
}
```

### POST `/api/auth/find-username`

**Request**

```json
{ "name": "김게이머", "email": "legend@gamers.com" }
```

**Response** `200`

```json
{ "success": true, "data": { "maskedUsername": "gam*********" } }
```

- 아이디 전체를 보내지 않고 **서버에서 마스킹한 값만** 보냅니다. 이름과 이메일만 알면 다른 사람의 아이디를 알아낼 수 있기 때문입니다.
- 마스킹 규칙: 앞 3자만 보여 주고 나머지는 같은 개수의 `*`로 바꿉니다. 아이디가 5자 이하면 앞 2자만 보여 줍니다.

| 아이디 | 응답 |
| --- | --- |
| `gamer_legend` | `gam*********` |
| `apex1` | `ap***` |

**Errors**: `404 USER_NOT_FOUND`

### POST `/api/auth/password-reset/verify`

비밀번호 찾기 1단계(본인 확인). 성공하면 2단계 화면(`/change-password`)에서 쓸 재설정 토큰을 줍니다.

**Request**

```json
{ "username": "gamer_legend", "email": "legend@gamers.com" }
```

**Response** `200`

```json
{ "success": true, "data": { "resetToken": "c2f1...", "expiresIn": 600 } }
```

- `resetToken`은 10분간, 1회만 유효합니다.

**Errors**: `400 VALIDATION_ERROR`, `404 USER_NOT_FOUND`

### POST `/api/auth/password-reset`

비밀번호 찾기 2단계.

**Request**

```json
{ "resetToken": "c2f1...", "newPassword": "Legend!4729" }
```

**Response** `204`

**Errors**: `400 VALIDATION_ERROR` ([1.8](#18-회원-입력값-규칙) 비밀번호 규칙 위반), `400 RESET_TOKEN_INVALID` (만료/사용됨/위조)

### GET `/api/users/me`

마이페이지(`/mypage`), 헤더 프로필 메뉴의 내 정보 요약.

**Response** `200`

```json
{
  "success": true,
  "data": {
    "id": 12,
    "username": "gamer_legend",
    "name": "김게이머",
    "nickname": "레전드게이머",
    "email": "legend@gamers.com",
    "role": "USER",
    "permissions": [],
    "sanctions": [{ "type": "write_ban", "until": "2026-12-01T00:00:00.000Z" }],
    "profileImageUrl": "https://.../profile.jpg",
    "bio": "<p>안녕하세요! RPG와 FPS 게임을 주로 즐기는 게이머입니다.</p>",
    "questionCount": 18,
    "answerCount": 52,
    "postCount": 64,
    "interestTags": ["리그오브레전드", "발로란트", "엘든링"],
    "createdAt": "2022-03-02T00:00:00.000Z"
  }
}
```

- `interestTags`: 내가 쓴 질문에 가장 많이 쓴 태그 상위 5개
- `permissions`: 관리자가 준 추가 권한. 지금은 `content_manage`(게시물·댓글 관리)만 있습니다. 없으면 `[]`
- `sanctions`: 지금 걸려 있는 내 제재(글쓰기·댓글 제한). 프론트엔드는 이 값으로 작성 버튼을 막고 해제일을 안내합니다. `until`이 `null`이면 영구
- `questionCount`, `answerCount`, `postCount`: 숨김 처리된 글을 뺀 개수. `answerCount`는 숨김 처리된 질문에 달린 답변도 뺍니다. ([`GET /api/answers`](#get-apianswers) 목록과 같은 기준)
- 화면의 레벨, 랭크, 매너온도, 응답률은 이번 범위에서 제외합니다. ([11. 결정 필요 사항](#11-결정-필요-사항) D-8)

### PATCH `/api/users/me`

마이페이지 수정(`/mypage/edit`).

**Request**

```json
{ "bio": "<p>새 <strong>소개글</strong></p>" }
```

| 필드 | 규칙 |
| --- | --- |
| `bio` | HTML, 순수 글자 0~200자, 저장 HTML 최대 1,000자 ([1.9](#19-본문--url-규칙)) |

**Response** `200`: `GET /api/users/me`와 같은 형식

### POST `/api/users/me/profile-image`

**Request**: `multipart/form-data`

| 필드 | 규칙 |
| --- | --- |
| `file` | 필수, PNG/JPG, 최대 10MB |

**Response** `200`

```json
{ "success": true, "data": { "profileImageUrl": "https://.../profile-12.jpg" } }
```

- 첨부파일과 같이 저장소에 올린 파일의 **URL을 그대로** `users.profile_image_url`에 저장합니다.

**Errors**: `400 FILE_TYPE_NOT_ALLOWED`, `400 FILE_TOO_LARGE`

### PATCH `/api/users/me/password`

로그인 상태에서 비밀번호 변경.

**Request**

```json
{ "currentPassword": "gamer!2580", "newPassword": "Legend!4729" }
```

**Response** `204`

**Errors**: `400 VALIDATION_ERROR` (새 비밀번호가 [1.8](#18-회원-입력값-규칙) 규칙 위반), `400 PASSWORD_MISMATCH` (현재 비밀번호 불일치)

- 화면(`/change-password`)은 로그인 상태에서 **현재 비밀번호 1번 + 새 비밀번호 2번**을 입력받습니다. (REQ-PASSUPDATE-002)
- 비밀번호 찾기에서 넘어온 경우에는 같은 화면이지만 현재 비밀번호 입력란 없이 [`POST /api/auth/password-reset`](#post-apiauthpassword-reset)을 씁니다.
- 변경에 성공하면 프론트엔드는 토큰을 지우고 로그인 화면으로 이동합니다.

### DELETE `/api/users/me`

회원 탈퇴(`/withdraw`).

**Request**

```json
{ "agreed": true }
```

**Response** `204`

- 회원 행은 지우지 않고 `status`를 `withdrawn`으로 바꾸고, **개인정보를 비식별 처리**합니다. ([1.7 삭제 정책](#17-삭제-정책-soft-delete))
  - `username`, `email`, `nickname`, `name`, 비밀번호 해시, `profileImageUrl`, `bio`를 `NULL`로 비웁니다. 프로필 사진 파일은 저장소에서 지웁니다.
  - 행의 `id`, `status`, 가입일·탈퇴일(`withdrawnAt`), 작성글·추천·신고·제재 이력과의 연결은 남깁니다.
  - 아이디·이메일·닉네임을 비우므로 **같은 값으로 다시 가입할 수 있습니다.** (`NULL`은 unique 제약에 걸리지 않음)
- 탈퇴한 회원은 로그인할 수 없고(`401 INVALID_CREDENTIALS`), 공개 프로필은 `404`입니다.
- 작성한 질문·답변·게시글·댓글은 남기고 작성자를 `탈퇴한 회원`으로 표시합니다.

**Errors**: `400 VALIDATION_ERROR` (`agreed`가 `true`가 아님)

### GET `/api/users/:userId`

회원 공개 프로필(`/users/:userId`). 다른 회원이나 비회원도 볼 수 있으므로 **공개 항목만** 보냅니다.

**Response** `200`

```json
{
  "success": true,
  "data": {
    "id": 12,
    "nickname": "레전드게이머",
    "profileImageUrl": "https://.../profile.jpg",
    "bio": "<p>안녕하세요! RPG와 FPS 게임을 주로 즐기는 게이머입니다.</p>",
    "questionCount": 18,
    "answerCount": 52,
    "postCount": 64,
    "interestTags": ["리그오브레전드", "발로란트", "엘든링"],
    "createdAt": "2022-03-02T00:00:00.000Z"
  }
}
```

| 항목 | 내 프로필 (`/me`) | 공개 프로필 (`/:userId`) |
| --- | --- | --- |
| `id`, `nickname`, `profileImageUrl`, `bio`, `questionCount`, `answerCount`, `postCount`, `interestTags`, `createdAt` | O | O |
| `username` (로그인 아이디) | O | X |
| `name` (실명), `email` | O | X |
| `role`, `permissions`, `sanctions` | O | X |

- 본인이 조회해도 이 API는 공개 항목만 보냅니다. 프론트엔드는 로그인한 회원의 `id`와 같으면 마이페이지(`/mypage`)로 보냅니다.
- 화면에서도 공개 프로필에는 아이디, 회원 코드, 수정하기 버튼을 표시하지 않습니다.
- 탈퇴했거나 없는 회원이면 `404`입니다.

**Errors**: `404 USER_NOT_FOUND`

### 회원 작성 목록

마이페이지와 공개 프로필에는 그 회원이 쓴 **질문 / 답변 / 게시글 목록**을 각각 보여 줍니다. (탭이 아니라 세 목록을 차례로 표시, REQ-MYPAGE-002·003) 본인만 보는 목록이 아니라 다른 회원·비회원도 볼 수 있으므로, 회원 전용 API를 따로 두지 않고 각 목록 API에 `authorId` 조건을 붙여 재사용합니다.

| 목록 | API | 항목에 표시하는 제목 | 제목을 누르면 | "전체 보기" |
| --- | --- | --- | --- | --- |
| 질문 | [`GET /api/questions?authorId=12&size=5`](#get-apiquestions) | 질문 제목 | 질문 상세 `/qna/questions/:questionId` | 질문 목록 `/qna/questions?authorId=12` (그 회원이 쓴 질문) |
| 답변 | [`GET /api/answers?authorId=12&size=5`](#get-apianswers) | 답변이 달린 **질문 제목** (아래에 답변 `preview`) | 질문 상세로 이동해 **그 답변으로 바로 스크롤** `/qna/questions/:questionId#answer-:answerId` | 질문 목록 `/qna/questions?answerAuthorId=12` (그 회원이 **답변을 쓴 질문**) |
| 게시글 | [`GET /api/posts?authorId=12&size=5`](#get-apiposts) | 게시글 제목 | 게시글 상세 `/board/posts/:postId` | 자유게시판 목록 `/board?authorId=12` (그 회원이 쓴 게시글) |

- 각 목록은 **최신 5개까지만** 보여 줍니다. ("더 보기"로 이어 붙이지 않습니다)
- 목록 제목 옆 "전체 보기"를 누르면 위 목록 화면으로 이동하고, 주소의 검색 조건(`authorId`·`answerAuthorId`)을 목록 API에 그대로 넘깁니다. 목록 화면은 "○○ 님이 작성한 질문"처럼 조건을 표시하고, ✕를 누르면 조건을 풉니다. 글이 없으면(개수 0) "전체 보기"를 보여 주지 않습니다.
- 마이페이지는 `GET /api/users/me`로 받은 `id`를 `authorId`로 씁니다.
- 숨김·삭제된 글은 본인이 조회해도 목록에서 빠집니다. 숨김 처리된 질문에 달린 답변도 답변 목록과 `answerCount`에서 빠집니다. (질문 상세가 `404`라 이동할 수 없기 때문)
- 프로필의 **활동 통계**(질문 / 답변 / 게시글 수)와 목록 제목 옆 숫자는 `questionCount`, `answerCount`, `postCount`를 씁니다. 통계는 숫자만 보여 주는 표시이고 누르는 기능은 없습니다.

---

## 3. 질문

| 우선 | Method | Path | 설명 | 인증 | WBS |
| --- | --- | --- | --- | --- | --- |
| 필수 | GET | `/api/questions` | 질문 목록 (검색·필터·정렬·페이징) | 없음 | #72 |
| 필수 | POST | `/api/questions` | 질문 등록 | 필수 | #71 |
| 필수 | GET | `/api/questions/:questionId` | 질문 상세 (조회수 증가) | 선택 | #73 |
| 필수 | PATCH | `/api/questions/:questionId` | 질문 수정 | 필수 (작성자 또는 관리 권한) | #71 |
| 필수 | DELETE | `/api/questions/:questionId` | 질문 삭제 | 필수 (작성자 또는 관리 권한) | #71 |
| 필수 | GET | `/api/questions/:questionId/related` | 관련 질문 | 없음 | #73 |
| 필수 | GET | `/api/questions/:questionId/edit-histories` | 질문 수정 이력 | 없음 | #71 |
| 선택 | GET | `/api/questions/stats` | 질문 목록 상단 커뮤니티 통계 | 없음 | - |

### GET `/api/questions`

질문 목록(`/qna/questions`).

**Query**

| 이름 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `page` | number | `1` | |
| `size` | number | `10` | |
| `sort` | string | `latest` | `latest`(최신순) / `views`(조회순) |
| `keyword` | string | - | 검색어. 앞의 `#`은 무시 |
| `scope` | string | `all` | 검색 대상: `all` / `title` / `tag` / `author`. 모두 부분 일치이고, `all`은 제목·태그·작성자 닉네임 중 하나라도 맞으면 찾습니다. **본문은 검색하지 않습니다** |
| `tag` | string | - | 태그 이름 정확히 일치 (빠른 태그, 태그 필터) |
| `hasAnswer` | boolean | - | `true`: 답변 있음 / `false`: 답변 없음 / 생략: 전체 |
| `isAccepted` | boolean | - | `true`: 채택 완료 / `false`: 채택 대기 / 생략: 전체 |
| `authorId` | number | - | 이 회원이 쓴 질문만 (프로필 작성 목록과 "전체 보기"). `scope=author`는 닉네임 부분 검색이라 정확한 회원 구분에 쓰지 않습니다 |
| `answerAuthorId` | number | - | 이 회원이 **답변을 쓴 질문**만 (프로필 "작성한 답변"의 "전체 보기"). 숨김·삭제된 답변만 있는 질문은 빠집니다. 한 질문에 답변을 여러 개 써도 질문은 한 번만 나옵니다 |

- 숨김 처리된 질문은 목록에서 빠집니다.
- 검색어 비교: 제목·닉네임은 대소문자를 구분하고, 태그는 검색어를 [5.1](#51-태그-이름-규칙)대로 정규화(`#` 제거, 영문 소문자)한 뒤 태그 이름과 비교합니다. ([1.10](#110-대소문자--중복-검사--저장-방식))
- 본문을 검색하지 않는 이유: 본문은 최대 100,000자 HTML이라 부분 일치 검색이 무겁고, 태그·이미지 주소 같은 HTML 코드에도 검색어가 걸리기 때문입니다.
- `answerCount`: 숨김·삭제된 답변을 뺀 개수입니다. `hasAnswer` 필터, 질문 상세, 관련 질문, 관리자 질문 목록도 같은 기준입니다.

**Response** `200`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "마인크래프트 주민 거래가 갱신되지 않아요",
      "tags": ["마인크래프트", "주민거래"],
      "answerCount": 2,
      "isAccepted": false,
      "viewCount": 238,
      "author": { "id": 12, "nickname": "호야", "profileImageUrl": null },
      "createdAt": "2026-11-10T05:22:00.000Z"
    }
  ],
  "meta": { "page": 1, "size": 10, "totalCount": 148 }
}
```

- 목록 화면의 태그 칸에는 `tags[0]`을 표시합니다.
- `HOT` 등의 배지는 프론트엔드에서 `viewCount`, `answerCount`로 계산합니다.

### POST `/api/questions`

신규 질문 작성(`/qna/questions/new`).

**Request**

```json
{
  "title": "마인크래프트 주민 거래가 갱신되지 않아요",
  "body": "마인크래프트 자바 에디션 1.20.4 ...",
  "tags": ["마인크래프트", "주민거래", "1.20.4"]
}
```

| 필드 | 규칙 |
| --- | --- |
| `title` | 필수, 1~100자 |
| `body` | 필수, 공백 제외 15자 이상, [1.9](#19-본문--url-규칙) 본문 규칙 (글자 최대 10,000자, 저장 최대 100,000자) |
| `tags` | 필수, 1~5개, 중복 제거, 앞의 `#` 제거 |

- 태그는 [5.1 태그 이름 규칙](#51-태그-이름-규칙)을 따르고, 없는 태그는 새로 만듭니다.
- 첨부파일 목록은 없습니다. 사진은 에디터 이미지, 영상은 영상 주소로 본문에 넣습니다([1.9](#19-본문--url-규칙)).
- 임시저장은 프론트엔드(localStorage)에서 처리하고 서버 API는 두지 않습니다.

**Response** `201`: `GET /api/questions/:questionId`와 같은 형식

**Errors**: `400 VALIDATION_ERROR`, `400 TAG_REQUIRED`, `400 TAG_LIMIT_EXCEEDED`, `400 TAG_BLOCKED`, `403 WRITE_BANNED`

### GET `/api/questions/:questionId`

질문 상세(`/qna/questions/:id`). 조회수를 1 올립니다. 단, 같은 회원(비로그인은 IP)이 24시간 안에 다시 조회하면 올리지 않습니다. 조회 기록은 DB 테이블 `view_histories`에 둡니다([1.10](#110-대소문자--중복-검사--저장-방식)).

**Response** `200`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "마인크래프트 주민 거래가 갱신되지 않아요",
    "body": "마인크래프트 자바 에디션 1.20.4 버전 싱글 플레이 중입니다. ...",
    "tags": ["마인크래프트", "주민거래", "버그_이슈", "자바에디션"],
    "author": { "id": 12, "nickname": "호야", "profileImageUrl": null },
    "viewCount": 238,
    "answerCount": 2,
    "isAccepted": true,
    "isEdited": true,
    "isMine": false,
    "createdAt": "2026-11-10T05:22:00.000Z",
    "editedAt": "2026-11-11T01:05:00.000Z",
    "updatedAt": "2026-11-11T01:05:00.000Z"
  }
}
```

- `isMine`: 로그인한 회원이 작성자인지 (수정/삭제 버튼 노출용)
- `createdAt`은 최초 작성 시각, `editedAt`은 제목·본문·태그를 마지막으로 수정한 시각입니다. 수정한 적이 없으면 `editedAt`은 `null`이고 `isEdited`는 `false`입니다. 조회수·답변·채택 같은 변경에는 바뀌지 않습니다.
- 화면은 작성일과 별도로, 수정된 질문에는 수정일도 함께 표시합니다. (REQ-QNA-010) 수정일을 누르면 [수정 이력](#get-apiquestionsquestionidedit-histories) 모달을 엽니다.
- 답변 목록은 [`GET /api/questions/:questionId/answers`](#get-apiquestionsquestionidanswers)로 따로 조회합니다.

**Errors**: `404 QUESTION_NOT_FOUND` (숨김 처리된 질문 포함)

### PATCH `/api/questions/:questionId`

질문 수정(`/qna/questions/:id/edit`). 보낸 필드만 수정합니다.

**Request**

```json
{
  "title": "마인크래프트 주민 거래가 갱신되지 않아요",
  "body": "...",
  "tags": ["마인크래프트", "주민거래", "버그_이슈", "자바에디션"],
  "editReason": "latest.log 내용 추가"
}
```

- 규칙은 등록과 같습니다. `editReason`은 선택, 최대 200자.
- 수정할 때마다 **수정 이력**(`question_edit_histories`)에 수정 시각, 수정한 회원, `editReason`을 한 줄 남깁니다. `editReason`은 질문 행이 아니라 이 이력에 저장합니다.
- 본문에서 빠진 에디터 이미지는 연결을 끊습니다([6장](#6-첨부파일)).
- 수정되면 `isEdited`가 `true`가 되고 `editedAt`이 현재 시각으로 바뀝니다. `createdAt`은 그대로입니다.

**Response** `200`: `GET /api/questions/:questionId`와 같은 형식

**Errors**: `400 VALIDATION_ERROR`, `400 TAG_BLOCKED`, `403 FORBIDDEN` (작성자가 아니고 `content_manage` 권한도 없음), `404 QUESTION_NOT_FOUND`, `403 WRITE_BANNED`

### DELETE `/api/questions/:questionId`

질문을 삭제 상태(`deleted`)로 바꿉니다. ([1.7](#17-삭제-정책-soft-delete))

**Response** `204`

**Errors**: `403 FORBIDDEN`, `404 QUESTION_NOT_FOUND`, `409 QUESTION_HAS_ANSWERS` (숨김 처리된 답변을 포함해 답변이 1개 이상이면 삭제 불가. 삭제 상태인 답변은 세지 않음)

- 숨김 답변도 포함하는 이유: 질문과 함께 숨김 답변이 사라지면 신고·제재의 근거가 없어지기 때문입니다. 그래서 `answerCount`가 `0`이어도 삭제가 거절될 수 있습니다.

### GET `/api/questions/:questionId/edit-histories`

질문 수정 이력. 질문 상세에서 **수정일시를 누르면** 뜨는 "수정 이력" 모달에서 씁니다.

**Response** `200`

```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "editedAt": "2026-11-11T01:05:00.000Z",
      "editor": { "id": 12, "nickname": "호야", "profileImageUrl": null },
      "editReason": "latest.log 디버그 파일 추가"
    },
    {
      "id": 1,
      "editedAt": "2026-11-10T06:30:00.000Z",
      "editor": { "id": 12, "nickname": "호야", "profileImageUrl": null },
      "editReason": null
    }
  ]
}
```

- 최신순, 페이지네이션 없이 전체를 반환합니다.
- `editReason`은 입력하지 않았으면 `null`입니다. 화면은 "사유 없음"으로 표시합니다.
- `editor`는 작성자 또는 관리 권한(`content_manage`)을 가진 회원입니다.
- 수정 전 본문은 저장하지 않습니다. (이력에는 시각·수정자·사유만)

**Errors**: `404 QUESTION_NOT_FOUND`

### GET `/api/questions/:questionId/related`

질문 상세 사이드바 "관련된 유사 질문". 태그가 많이 겹치는 순서로 최대 5개.

**Response** `200`

```json
{
  "success": true,
  "data": [
    { "id": 4018, "title": "1.20.2 사서 주민 수선 인챈트 거래 풀 잠금 해제 시간", "answerCount": 4, "isAccepted": true, "createdAt": "2026-10-29T00:00:00.000Z" }
  ]
}
```

### GET `/api/questions/stats`

질문 목록 하단 커뮤니티 통계.

**Response** `200`

```json
{
  "success": true,
  "data": {
    "todayAcceptedCount": 42,
    "acceptRate": 88.4,
    "averageFirstAnswerMinutes": 14,
    "trendingTag": { "name": "엘든링", "questionCount": 18 },
    "unansweredCount": 9
  }
}
```

---

## 4. 답변

| 우선 | Method | Path | 설명 | 인증 | WBS |
| --- | --- | --- | --- | --- | --- |
| 필수 | GET | `/api/questions/:questionId/answers` | 답변 목록 | 선택 | #74 |
| 필수 | GET | `/api/answers` | 회원이 쓴 답변 목록 (프로필 작성 목록) | 없음 | - |
| 필수 | POST | `/api/questions/:questionId/answers` | 답변 등록 | 필수 | #74 |
| 필수 | GET | `/api/answers/:answerId` | 답변 단건 (수정 화면) | 선택 | #74 |
| 필수 | GET | `/api/answers/:answerId/edit-histories` | 답변 수정 이력 | 없음 | #74 |
| 필수 | PATCH | `/api/answers/:answerId` | 답변 수정 | 필수 (작성자 또는 관리 권한) | #74 |
| 필수 | DELETE | `/api/answers/:answerId` | 답변 삭제 | 필수 (작성자 또는 관리 권한) | #74 |
| 필수 | POST | `/api/answers/:answerId/accept` | 답변 채택 | 필수 (질문 작성자) | #75 |
| 필수 | POST | `/api/answers/:answerId/votes` | 답변 추천 | 필수 | #76 |
| 필수 | DELETE | `/api/answers/:answerId/votes` | 답변 추천 취소 | 필수 | #76 |

### Answer 객체

```json
{
  "id": 8941,
  "questionId": 1,
  "body": "주민이 거래를 갱신하려면 두 가지 조건이 반드시 충족되어야 합니다: ...",
  "author": { "id": 30, "nickname": "흐야", "profileImageUrl": null },
  "voteCount": 22,
  "isVoted": false,
  "isAccepted": true,
  "isEdited": true,
  "isMine": false,
  "canAccept": false,
  "createdAt": "2026-11-12T14:23:23.000Z",
  "editedAt": "2026-11-13T00:10:00.000Z",
  "updatedAt": "2026-11-13T00:10:00.000Z"
}
```

- `isVoted`, `isMine`, `canAccept`: 로그인하지 않았으면 `false`
- `createdAt`: 최초 작성 시각. 수정해도 바뀌지 않습니다.
- `editedAt`: 작성자(또는 관리 권한 회원)가 본문을 **마지막으로 수정한 시각**. 수정한 적이 없으면 `null`이고, 이때 `isEdited`는 `false`입니다. 채택·추천처럼 본문이 바뀌지 않는 변경에는 바뀌지 않습니다.
- 화면은 작성일과 별도로, 수정된 답변에는 수정일도 함께 표시합니다. (예: `2026.11.12 23:23 답변 · 2026.11.13 09:10 수정`, REQ-QNA-012) 수정일을 누르면 [수정 이력](#get-apianswersansweridedit-histories) 모달을 엽니다.
- `canAccept`: 채택 버튼 노출 여부. 아래를 **모두** 만족할 때만 `true`
  - 로그인한 회원이 질문 작성자
  - 이 답변이 본인 답변이 아님
  - 질문에 채택된 답변이 아직 없음
- 프론트엔드는 `canAccept`가 `false`면 채택 버튼을 **표시하지 않습니다**. (비활성화가 아니라 숨김)
- 채택된 답변(`isAccepted: true`)은 수정·삭제할 수 없으므로, 프론트엔드는 수정·삭제 버튼을 표시하지 않습니다. (REQ-QNA-012)

### GET `/api/questions/:questionId/answers`

**Query**

| 이름 | 기본값 | 설명 |
| --- | --- | --- |
| `sort` | `latest` | `latest`(최신순, 기본) / `votes`(추천순). 어느 쪽이든 **채택된 답변이 맨 위에 고정** (REQ-QNA-005) |

페이지네이션 없이 전체를 반환합니다.

- 맨 위 고정은 채택된 답변 1개뿐입니다. 추천 수가 많아도 고정하지 않고, 정렬 순서에만 반영합니다.
- 질문 상세 주소에 `#answer-<답변 id>`가 붙어 있으면(프로필 답변 목록에서 이동한 경우), 프론트엔드는 답변 목록을 그린 뒤 그 답변으로 스크롤하고 잠시 강조합니다. 숨김·삭제된 답변이면 질문 상단에 그대로 머뭅니다.

**Response** `200`: `Answer[]`

**Errors**: `404 QUESTION_NOT_FOUND`

### GET `/api/answers`

회원이 쓴 답변 목록 (프로필 "작성한 답변", 최신 5개). 질문 상세의 답변 목록과 달리 여러 질문에 걸친 답변을 모아 봅니다. 전체는 답변한 질문 목록(`GET /api/questions?answerAuthorId=`)으로 봅니다.

**Query**

| 이름 | 기본값 | 설명 |
| --- | --- | --- |
| `authorId` | - | **필수**. 답변 작성자 회원 ID |
| `page`, `size` | `1`, `10` | |

- 최신순입니다.
- 숨김 처리된 답변과 숨김 처리된 질문에 달린 답변은 빠집니다.

**Response** `200`

```json
{
  "success": true,
  "data": [
    {
      "id": 8941,
      "preview": "주민이 거래를 갱신하려면 두 가지 조건이 반드시 충족되어야 합니다...",
      "question": { "id": 1, "title": "마인크래프트 주민 거래가 갱신되지 않아요" },
      "voteCount": 22,
      "isAccepted": true,
      "createdAt": "2026-11-12T14:23:23.000Z"
    }
  ],
  "meta": { "page": 1, "size": 10, "totalCount": 52 }
}
```

- `preview`: 답변 본문 앞 60자

**Errors**: `400 VALIDATION_ERROR` (`authorId` 없음)

### POST `/api/questions/:questionId/answers`

**Request**

```json
{ "body": "<p>답변 내용 (HTML)</p>" }
```

| 필드 | 규칙 |
| --- | --- |
| `body` | 필수, [1.9](#19-본문--url-규칙) 본문 규칙 (글자 1~10,000자, 저장 최대 100,000자) |

**Response** `201`: `Answer`

**Errors**: `400 VALIDATION_ERROR`, `404 QUESTION_NOT_FOUND`, `403 WRITE_BANNED`

### GET `/api/answers/:answerId`

답변 수정 화면(`/qna/questions/:id/answers/:answerId/edit`). 화면 상단의 원본 질문 요약은 `GET /api/questions/:questionId`로 조회합니다.

**Response** `200`: `Answer`

**Errors**: `404 ANSWER_NOT_FOUND`

### PATCH `/api/answers/:answerId`

**Request**

```json
{ "body": "수정된 답변", "editReason": "독서대 재설치 팁 보강" }
```

- `editReason`은 선택, 최대 200자
- 수정할 때마다 **수정 이력**(`answer_edit_histories`)에 수정 시각, 수정한 회원, `editReason`을 한 줄 남깁니다.
- **채택된 답변은 수정할 수 없습니다.** (`409 ANSWER_ALREADY_ACCEPTED`, REQ-QNA-012)
- 수정하면 `editedAt`이 현재 시각으로 바뀌고 `isEdited`가 `true`가 됩니다. `createdAt`은 그대로입니다.

**Response** `200`: `Answer`

**Errors**: `400 VALIDATION_ERROR`, `403 FORBIDDEN`, `404 ANSWER_NOT_FOUND`, `403 WRITE_BANNED`, `409 ANSWER_ALREADY_ACCEPTED` (채택된 답변은 수정 불가)

### DELETE `/api/answers/:answerId`

답변을 삭제 상태(`deleted`)로 바꿉니다. 질문의 답변 수에서 빠집니다.

**Response** `204`

**Errors**: `403 FORBIDDEN`, `404 ANSWER_NOT_FOUND`, `409 ANSWER_ALREADY_ACCEPTED` (채택된 답변은 삭제 불가)

### GET `/api/answers/:answerId/edit-histories`

답변 수정 이력. 답변의 수정일시를 누르면 뜨는 모달에서 씁니다. 응답 형식은 [질문 수정 이력](#get-apiquestionsquestionidedit-histories)과 같습니다.

**Errors**: `404 ANSWER_NOT_FOUND`

### POST `/api/answers/:answerId/accept`

질문 작성자만 호출할 수 있고, 질문당 1개만 채택할 수 있습니다. 채택 여부는 답변의 상태값(`is_accepted`)으로 저장하고, 질문당 1개는 앱에서 검사합니다([1.10](#110-대소문자--중복-검사--저장-방식)). 채택은 취소할 수 없습니다. (관리자가 채택된 답변을 숨기거나 삭제하면 해제됩니다, [10.3](#103-질문답변-관리)) 추천 수 등으로 자동 채택하지 않고 **질문자가 직접 채택한 경우만** 채택으로 봅니다. (REQ-QNA-005)

- 본인이 작성한 답변은 채택할 수 없습니다. 화면에서는 버튼이 노출되지 않지만(`canAccept`), 서버도 요청을 거절합니다.

**Response** `200`: `Answer` (`isAccepted: true`)

**Errors**: `403 FORBIDDEN` (질문 작성자 아님), `400 CANNOT_ACCEPT_OWN_ANSWER`, `404 ANSWER_NOT_FOUND`, `409 QUESTION_ALREADY_ACCEPTED`

### POST `/api/answers/:answerId/votes`

**Response** `200`

```json
{ "success": true, "data": { "answerId": 8941, "voteCount": 23, "isVoted": true } }
```

**Errors**: `400 CANNOT_VOTE_OWN_ANSWER`, `404 ANSWER_NOT_FOUND`, `409 ALREADY_VOTED`

### DELETE `/api/answers/:answerId/votes`

추천 취소. 추천 행을 지우지 않고 `status`를 `canceled`로 바꿉니다. 다시 추천하면 같은 행을 `active`로 되돌립니다. 화면의 추천 버튼이 토글이므로, 취소 후 상태를 함께 돌려주기 위해 `204` 대신 `200`으로 응답합니다.

**Response** `200`

```json
{ "success": true, "data": { "answerId": 8941, "voteCount": 22, "isVoted": false } }
```

**Errors**: `404 ANSWER_NOT_FOUND`, `404 VOTE_NOT_FOUND`

---

## 5. 태그

| 우선 | Method | Path | 설명 | 인증 | WBS |
| --- | --- | --- | --- | --- | --- |
| 필수 | GET | `/api/tags` | 태그 목록 · 자동완성 · 인기 태그 | 없음 | #79 |

### 5.1 태그 이름 규칙

사용자가 질문에 입력하는 태그와 관리자가 만드는 태그에 모두 적용합니다.

| 항목 | 규칙 |
| --- | --- |
| 길이 | 1~30자 |
| 허용 문자 | 한글, 영문, 숫자, `_`, `-` (공백 불가) |
| 정규화 | 앞의 `#` 제거, 앞뒤 공백 제거, 영문은 소문자로 저장 |
| 중복 판단 | 정규화한 이름이 같으면 같은 태그 (`LOL` = `lol`) |
| 생성 | 질문 등록·수정 시 없는 태그는 자동 생성. 병합된(`merged`) 이름은 병합 대상 태그로 바꿔 저장. 관리자는 태그 관리에서 직접 생성 |
| 차단 | 관리자가 삭제한 태그는 행을 지우지 않고 `blocked` 상태로 남깁니다. 같은 이름(정규화 기준)으로 다시 만들 수 없고, 질문에 쓰면 `400 TAG_BLOCKED`입니다. (REQ-ADMIN-010) |

```text
허용: 마인크래프트, 버그_이슈, 자바에디션, league-of-legends, elden-ring, 1-20-4
불가: 리그 오브 레전드 (공백), 1.20.4 (`.`), c++ (`+`)
```

규칙에 맞지 않으면 `400 VALIDATION_ERROR`, 차단된 태그면 `400 TAG_BLOCKED`(메시지에 태그 이름 포함)로 응답합니다. `GET /api/tags`(목록·자동완성·인기 태그)에는 차단된 태그가 나오지 않습니다.

### GET `/api/tags`

**Query**

| 이름 | 기본값 | 설명 |
| --- | --- | --- |
| `keyword` | - | 이름 **앞부분 일치** (자동완성) |
| `sort` | `popular` | `popular`(사용 많은순) / `name`(이름순) |
| `size` | `10` | |

사용 예

- 질문 목록 "인기 게임 태그": `GET /api/tags?sort=popular&size=8`
- 질문 작성 태그 자동완성: `GET /api/tags?keyword=마인`
- 추천 태그: `GET /api/tags?sort=popular&size=5`

**Response** `200`

```json
{
  "success": true,
  "data": [{ "id": 3, "name": "마인크래프트", "questionCount": 1203 }]
}
```

---

## 6. 첨부파일

| 우선 | Method | Path | 설명 | 인증 |
| --- | --- | --- | --- | --- |
| 필수 | POST | `/api/attachments` | 파일 업로드 (본문 에디터 이미지, 신고 증빙) | 필수 |
| 필수 | DELETE | `/api/attachments/:attachmentId` | 아직 글에 연결되지 않은 파일 삭제 | 필수 (업로드한 회원) |

업로드는 **에디터 이미지**와 **신고 증빙** 두 가지입니다. 질문·답변·게시글에는 따로 첨부파일 목록이 없고, 사진은 에디터 이미지로 본문에 넣습니다. 영상은 파일로 올리지 않고 영상 주소로 넣습니다([1.9](#19-본문--url-규칙)). 둘 다 같은 API로 올리고 `purpose`로 구분합니다. 파일 URL과 원본 파일명 규칙은 [1.6 Attachment](#16-공통-객체)를 따르고, 업로드한 지 24시간이 지났는데 어떤 글에도 연결돼 있지 않은 파일은 서버가 정리 작업에서 삭제 상태(`deleted`)로 바꿉니다. 글을 수정·삭제해 연결이 모두 끊긴 파일도 같은 작업이 정리합니다.

| 구분 | `purpose` | 쓰는 곳 | 글과 연결하는 방법 | 개수 제한 |
| --- | --- | --- | --- | --- |
| 신고 증빙 | `report_evidence` | 신고 | 신고 요청의 `attachmentIds` | 1건당 **최대 3개** (넘으면 `400 ATTACHMENT_LIMIT_EXCEEDED`) |
| **에디터 이미지** | `editor_image` | 질문·답변·게시글·공지 **본문 안** 이미지 | 본문 HTML의 `<img src>`. `attachmentIds`에 넣지 않음 | 개수 제한 없음. 본문 글자·저장 길이 규칙([1.9](#19-본문--url-규칙))만 적용 |

- 에디터 이미지는 글을 저장할 때 서버가 본문의 `<img src>`에서 **우리 저장소 URL**을 찾아, 그 URL의 `editor_image` 파일을 그 글에 연결합니다. 수정으로 본문에서 빠진 이미지는 연결을 끊습니다.
- **에디터 이미지 파일 하나는 여러 글에 연결될 수 있습니다.** 다른 글(다른 회원의 글 포함)에 있던 이미지를 복사해 넣거나 코드 보기로 주소를 넣어도 그 글에 연결되므로, 원래 글이 삭제돼도 이미지가 깨지지 않습니다. 파일은 연결된 글이 하나도 남지 않았을 때만 정리합니다. 숨김 처리된 글은 복구할 수 있으므로 연결을 끊지 않습니다.
- 본문의 `<img src>`는 **사용 중인(`active`) 에디터 이미지 URL**만 허용합니다. 외부 주소·`data:`·`blob:` 이미지와, 우리 저장소 URL이라도 삭제된 파일·신고 증빙·프로필 사진은 저장 전 정리 단계에서 지웁니다. ([1.9](#19-본문--url-규칙))
- 신고 증빙은 신고 1건에만 연결합니다.
- 에디터 이미지는 본문에만 보입니다. 글 응답에 따로 첨부 목록을 두지 않습니다.

### POST `/api/attachments`

**Request**: `multipart/form-data`

| 필드 | 설명 |
| --- | --- |
| `file` | 필수, 파일 1개 |
| `purpose` | 필수, `editor_image`(본문 에디터 이미지) / `report_evidence`(신고 증빙) |

| purpose | 허용 형식 | 최대 크기 |
| --- | --- | --- |
| `report_evidence` | PNG, JPG, WEBP | 10MB |
| `editor_image` | PNG, JPG, GIF, WEBP | 10MB |

**Response** `201`: `Attachment`

**Errors**: `400 FILE_TYPE_NOT_ALLOWED`, `400 FILE_TOO_LARGE`

### DELETE `/api/attachments/:attachmentId`

첨부파일 행은 삭제 상태(`deleted`)로 남기고, **저장소의 실제 파일은 지웁니다.** 이후 그 URL은 열리지 않습니다.

**Response** `204`

**Errors**: `403 FORBIDDEN`, `404 ATTACHMENT_NOT_FOUND`, `409 ATTACHMENT_IN_USE` (이미 글에 연결됨 → 글 수정으로 빼야 함)

- 에디터 이미지는 이 API로 지우지 않습니다. 본문에서 이미지를 지우고 글을 저장하면 그 글과의 연결이 끊기고, 연결된 글이 하나도 남지 않으면 정리 작업이 지웁니다.

---

## 7. 자유게시판

| 우선 | Method | Path | 설명 | 인증 | WBS |
| --- | --- | --- | --- | --- | --- |
| 필수 | GET | `/api/posts` | 게시글 목록 (검색·정렬·페이징) | 선택 | #65 #68 #69 #70 |
| 필수 | POST | `/api/posts` | 게시글 작성 | 필수 | #64 |
| 필수 | GET | `/api/posts/:postId` | 게시글 상세 (조회수 증가) | 선택 | #65 |
| 필수 | PATCH | `/api/posts/:postId` | 게시글 수정 | 필수 (작성자 또는 관리 권한) | #66 |
| 필수 | DELETE | `/api/posts/:postId` | 게시글 삭제 | 필수 (작성자 또는 관리 권한) | #66 |
| 필수 | GET | `/api/posts/:postId/comments` | 댓글 목록 | 선택 | #67 |
| 필수 | POST | `/api/posts/:postId/comments` | 댓글 작성 | 필수 | #67 |
| 필수 | DELETE | `/api/comments/:commentId` | 댓글 삭제 | 필수 (작성자 또는 관리 권한) | #67 |

내 게시글 목록(`/board/my-posts`)과 목록의 "내 게시글" 필터는 `GET /api/posts?authorId=<내 id>`를 사용합니다.

### GET `/api/posts`

자유게시판 목록(`/board`).

**Query**

| 이름 | 기본값 | 설명 |
| --- | --- | --- |
| `page` | `1` | |
| `size` | `10` | |
| `sort` | `latest` | `latest`(최신순) / `oldest`(오래된순) |
| `keyword` | - | 제목 검색 |
| `authorId` | - | 이 회원이 쓴 게시글만 (내 게시글, 프로필 작성 목록과 "전체 보기") |

**Response** `200`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "oo 게임 공략법",
      "author": { "id": 12, "nickname": "호야", "profileImageUrl": null },
      "viewCount": 238,
      "commentCount": 4,
      "isMine": true,
      "createdAt": "2025-07-23T05:32:00.000Z"
    }
  ],
  "meta": { "page": 1, "size": 10, "totalCount": 48 }
}
```

### POST `/api/posts`

게시글 작성(`/board/write`).

**Request**

```json
{
  "title": "oo 게임 공략법 및 엔드스펙 세팅 총정리 가이드",
  "body": "<p>내용</p>"
}
```

| 필드 | 규칙 |
| --- | --- |
| `title` | 필수, 1~80자 |
| `body` | 필수, [1.9](#19-본문--url-규칙) 본문 규칙 (글자 1~10,000자, 저장 최대 100,000자) |

- 외부 링크 첨부 항목은 없습니다. 사진·영상·참고 링크는 질문·답변과 같이 에디터로 본문에 넣습니다([1.9](#19-본문--url-규칙)). (REQ-BOARD-009·010)

**Response** `201`: `GET /api/posts/:postId`와 같은 형식

**Errors**: `400 VALIDATION_ERROR`, `403 WRITE_BANNED`

### GET `/api/posts/:postId`

조회수 증가 규칙은 질문 상세와 같습니다. (같은 회원/IP는 24시간에 1회)

**Response** `200`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "oo 게임 공략법 및 엔드스펙 세팅 총정리 가이드",
    "body": "안녕하세요! 이번 시즌 새롭게 업데이트된 ...",
    "author": { "id": 12, "nickname": "호야", "profileImageUrl": null },
    "viewCount": 238,
    "commentCount": 3,
    "isMine": false,
    "isEdited": false,
    "createdAt": "2025-07-23T05:32:00.000Z",
    "updatedAt": "2025-07-23T05:32:00.000Z"
  }
}
```

**Errors**: `404 POST_NOT_FOUND`

### PATCH `/api/posts/:postId`

**Request**: `POST /api/posts`와 같은 필드. 보낸 필드만 수정합니다.

**Response** `200`: `GET /api/posts/:postId`와 같은 형식

**Errors**: `400 VALIDATION_ERROR`, `403 FORBIDDEN`, `404 POST_NOT_FOUND`, `403 WRITE_BANNED`

### DELETE `/api/posts/:postId`

게시글과 댓글을 모두 삭제 상태(`deleted`)로 바꿉니다.

**Response** `204`

**Errors**: `403 FORBIDDEN`, `404 POST_NOT_FOUND`

### GET `/api/posts/:postId/comments`

**Query**: `page`, `size`(기본 20). 오래된 순서.

**Response** `200`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "body": "세팅법 상세하게 잘 정리해주셔서 감사합니다!",
      "author": { "id": 40, "nickname": "누구씨", "profileImageUrl": null },
      "isMine": false,
      "createdAt": "2025-07-23T06:10:00.000Z"
    }
  ],
  "meta": { "page": 1, "size": 20, "totalCount": 3 }
}
```

### POST `/api/posts/:postId/comments`

**Request**

```json
{ "body": "댓글 내용" }
```

- `body`: 필수, 1~500자

**Response** `201`: 댓글 객체 1개

**Errors**: `400 VALIDATION_ERROR`, `404 POST_NOT_FOUND`, `403 COMMENT_BANNED`

### DELETE `/api/comments/:commentId`

댓글을 삭제 상태(`deleted`)로 바꿉니다. 목록과 댓글 수에서 빠집니다.

**Response** `204`

**Errors**: `403 FORBIDDEN`, `404 COMMENT_NOT_FOUND`

---

## 8. 신고

| 우선 | Method | Path | 설명 | 인증 | WBS |
| --- | --- | --- | --- | --- | --- |
| 필수 | POST | `/api/reports` | 신고 등록 (질문/답변/게시글/댓글) | 필수 | #77 #78 |
| 필수 | DELETE | `/api/reports/:reportId` | 신고 접수 취소 | 필수 (신고자) | - |
| 선택 | GET | `/api/reports/me` | 내 신고 내역 | 필수 | - |

### 공통 Enum

| `targetType` | 설명 |
| --- | --- |
| `question` | 질문 |
| `answer` | 답변 |
| `post` | 자유게시판 게시글 |
| `comment` | 자유게시판 댓글 |

| `reason` | 설명 |
| --- | --- |
| `spam` | 스팸 / 홍보성 / 도배성 게시물 |
| `abuse` | 욕설 / 비하 / 혐오 발언 |
| `illegal` | 부적절한 콘텐츠 (치트/핵/불법 프로그램) |
| `spoiler` | 스포일러 |
| `misinformation` | 주제 무관 / 허위·악의적 정보 |
| `privacy` | 개인정보 노출 및 침해 |
| `etc` | 기타 (상세 사유 필수) |

| `status` | 설명 |
| --- | --- |
| `pending` | 처리 대기 |
| `resolved` | 처리 완료 (조치함) |
| `rejected` | 반려 (조치 안 함) |
| `canceled` | 신고자가 접수 취소 |

신고 사유는 Q&A 화면과 관리자 화면 모두 위 7종을 사용합니다.

### POST `/api/reports`

신고 화면. 질문·답변·게시글·댓글 모두 같은 화면을 씁니다: `/qna/report/:targetType/:targetId?from=<돌아갈 경로>` (질문은 `/qna/questions/:id/report`도 사용). 게시글 상세와 댓글의 "신고" 버튼에서 들어오며, 본인 글에는 신고 버튼을 보여 주지 않습니다.

**Request**

```json
{
  "targetType": "question",
  "targetId": 84092,
  "reason": "spam",
  "detail": "외부 도메인 유도 링크가 반복적으로 포함되어 있습니다.",
  "attachmentIds": [77]
}
```

| 필드 | 규칙 |
| --- | --- |
| `targetType` | 필수 |
| `targetId` | 필수 |
| `reason` | 필수 |
| `detail` | 선택, 최대 1000자. `reason`이 `etc`이면 필수 |
| `attachmentIds` | 선택, 최대 3개, `purpose=report_evidence`로 올린 파일 |

- 자기 글은 신고할 수 없습니다.
- 같은 회원이 같은 대상을 `pending` 상태로 두 번 신고할 수 없습니다. 앱에서 등록 전에 검사합니다([1.10](#110-대소문자--중복-검사--저장-방식)).
- 다른 회원들이 같은 대상을 신고하면 관리자 화면에서 `duplicateCount`로 묶어 보여줍니다.
- 신고가 쌓여도 대상을 자동으로 숨기지 않습니다. 신고는 `pending`으로 접수되고, 관리자가 [10.6](#106-신고-관리)에서 확인한 뒤 직접 숨김·제재를 처리합니다. (REQ-QNA-008·009)

**Response** `201`

```json
{
  "success": true,
  "data": {
    "id": 84092,
    "receiptNumber": "REP-20261110-84092",
    "targetType": "question",
    "targetId": 84092,
    "reason": "spam",
    "status": "pending",
    "queuePosition": 3,
    "createdAt": "2026-11-10T05:28:00.000Z"
  }
}
```

- `queuePosition`: 처리 대기열에서 몇 번째인지

**Errors**: `400 VALIDATION_ERROR`, `400 CANNOT_REPORT_OWN_CONTENT`, `404 REPORT_TARGET_NOT_FOUND`, `409 REPORT_DUPLICATED`

### DELETE `/api/reports/:reportId`

신고 완료 화면의 "접수 취소 (10초)". `pending` 상태이고 접수 후 10초 안에만 취소할 수 있습니다. 신고를 지우지 않고 `status`를 `canceled`로 바꾸며, 관리자 신고 목록과 `duplicateCount`에서 빠집니다.

**Response** `204`

**Errors**: `403 FORBIDDEN`, `404 REPORT_NOT_FOUND`, `409 REPORT_CANCEL_EXPIRED`

### GET `/api/reports/me`

신고 완료 화면의 "내 신고 내역 및 현황 보기".

**Query**: `page`, `size`

**Response** `200`: `POST /api/reports` 응답 객체의 목록

---

## 9. 공지

| 우선 | Method | Path | 설명 | 인증 |
| --- | --- | --- | --- | --- |
| 선택 | GET | `/api/notices` | 공지 목록 (고정 공지 먼저) | 없음 |
| 선택 | GET | `/api/notices/:noticeId` | 공지 상세 | 없음 |

사용자 화면에서 공지를 보여 주는 곳은 아래와 같습니다. 관리자 공지 API는 [10.7](#107-공지-관리)을 참고하세요.

| 화면 | 경로 | API |
| --- | --- | --- |
| 헤더 공지 롤링 (아래에서 위로 넘어가는 제목) | 모든 Q&A 화면의 헤더 | `GET /api/notices?size=5` |
| 공지사항 목록 (헤더 메뉴 "공지사항") | `/qna/notices` | `GET /api/notices` |
| 공지 상세 (롤링 제목·목록 항목 클릭) | `/qna/notices/:noticeId` | `GET /api/notices/:noticeId` |

**Notice 객체**

```json
{
  "id": 3,
  "title": "서버 점검 안내",
  "body": "11월 20일 02:00 ~ 06:00 서버 점검이 진행됩니다.",
  "isPinned": true,
  "author": { "id": 1, "nickname": "운영자01", "profileImageUrl": null },
  "createdAt": "2026-11-15T00:00:00.000Z",
  "updatedAt": "2026-11-15T00:00:00.000Z"
}
```

### GET `/api/notices`

**Query**

| 이름 | 기본값 | 설명 |
| --- | --- | --- |
| `page`, `size` | `1`, `10` | 헤더 롤링은 `size=5` |

- 고정 공지(`isPinned: true`)가 먼저, 그다음 최신순입니다.
- 목록에는 본문(`body`)을 넣지 않습니다.

**Response** `200`

```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "title": "서버 점검 안내",
      "isPinned": true,
      "author": { "id": 1, "nickname": "운영자01", "profileImageUrl": null },
      "createdAt": "2026-11-15T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "size": 10, "totalCount": 5 }
}
```

- 공지가 없으면 헤더 롤링 영역을 표시하지 않습니다.

### GET `/api/notices/:noticeId`

**Response** `200`: `Notice`

**Errors**: `404 NOTICE_NOT_FOUND`

---

## 10. 관리자

모든 API는 `ADMIN` 권한이 필요합니다 (#55). 회원 제재, 숨김, 삭제, 태그 병합, 신고 처리 등 **상태를 바꾸는 관리자 API는 모두 활동 로그를 남깁니다** (#63).

URL은 명사 복수형으로 쓰고 동작은 HTTP Method로 나타냅니다. 제재·해제, 숨김·복구, 신고 처리·반려처럼 상태를 바꾸는 작업은 `PATCH`로 상태 값을 보냅니다.

관리자 `DELETE` API도 [1.7 삭제 정책](#17-삭제-정책-soft-delete)대로 `status`를 `deleted`로 바꾸는 soft delete이고, **되돌리는 API는 없습니다.** 기본 조치는 숨김(`status: hidden`)이고, 프론트엔드는 삭제를 숨김과 다른 별도 버튼으로 두고 **확인 모달**을 거친 뒤에만 호출합니다. 확인 모달에는 함께 바뀌는 것(답변·댓글, 채택 해제, 태그 연결 해제)을 보여 줍니다. (REQ-ADMIN-008)

| 우선 | Method | Path | 설명 | WBS |
| --- | --- | --- | --- | --- |
| 필수 | GET | `/api/admin/stats` | 대시보드 현황 (`trend`, `topTags`는 선택) | #56 |
| 필수 | GET | `/api/admin/users` | 회원 목록 | #57 |
| 필수 | GET | `/api/admin/users/:userId` | 회원 상세 | #57 |
| 필수 | PATCH | `/api/admin/users/:userId` | 회원 제재 / 제재 해제 (정지·글쓰기 제한·댓글 제한) | #57 |
| 선택 (후순위) | PATCH | `/api/admin/users/:userId` | 게시물·댓글 관리 권한 부여 / 회수 (REQ-ADMIN-004) | #57 |
| 필수 | GET | `/api/admin/questions` | 질문 관리 목록 | #58 |
| 필수 | PATCH | `/api/admin/questions/:questionId` | 질문 숨김/복구 | #58 |
| 필수 | DELETE | `/api/admin/questions/:questionId` | 질문 삭제 | #58 |
| 필수 | GET | `/api/admin/answers` | 답변 관리 목록 | #58 |
| 필수 | PATCH | `/api/admin/answers/:answerId` | 답변 숨김/복구 | #58 |
| 필수 | DELETE | `/api/admin/answers/:answerId` | 답변 삭제 | #58 |
| 필수 | GET | `/api/admin/posts` | 게시글 관리 목록 | #58 |
| 필수 | PATCH | `/api/admin/posts/:postId` | 게시글 숨김/복구 | #58 |
| 필수 | DELETE | `/api/admin/posts/:postId` | 게시글 삭제 | #58 |
| 필수 | GET | `/api/admin/comments` | 댓글 관리 목록 | #58 |
| 필수 | PATCH | `/api/admin/comments/:commentId` | 댓글 숨김/복구 | #58 |
| 필수 | DELETE | `/api/admin/comments/:commentId` | 댓글 삭제 (REQ-ADMIN-012) | #58 |
| 필수 | GET | `/api/admin/tags` | 태그 관리 목록 | #59 |
| 필수 | POST | `/api/admin/tags` | 태그 생성 | #59 |
| 필수 | PATCH | `/api/admin/tags/:tagId` | 태그 수정 | #59 |
| 필수 | DELETE | `/api/admin/tags/:tagId` | 태그 삭제 | #59 |
| 선택 | DELETE | `/api/admin/tags/:tagId?mergeInto=:targetTagId` | 태그 병합 | #61 |
| 필수 (포함 여부 검토 중) | GET | `/api/admin/reports` | 신고 목록 | #60 |
| 필수 (포함 여부 검토 중) | GET | `/api/admin/reports/:reportId` | 신고 상세 | #60 |
| 필수 (포함 여부 검토 중) | PATCH | `/api/admin/reports/:reportId` | 신고 처리 / 반려 | #60 |
| 선택 | GET | `/api/admin/notices` | 공지 목록 | #62 |
| 선택 | POST | `/api/admin/notices` | 공지 작성 | #62 |
| 선택 | PATCH | `/api/admin/notices/:noticeId` | 공지 수정 | #62 |
| 선택 | DELETE | `/api/admin/notices/:noticeId` | 공지 삭제 | #62 |
| 선택 | GET | `/api/admin/activity-logs` | 활동 로그 | #63 |

- 관리자 API는 모두 30개입니다. 태그 병합(태그 삭제와 같은 경로)과 관리 권한 부여(회원 제재와 같은 경로)는 요청 본문이 달라 따로 셉니다.
- 역할 변경(USER ↔ ADMIN)은 이번 범위에서 제외합니다. 일부 권한만 주는 것은 `content_manage` 권한(선택·후순위)으로 합니다.

### 10.1 대시보드

#### GET `/api/admin/stats`

**Response** `200`

```json
{
  "success": true,
  "data": {
    "kpis": {
      "totalMembers": 128450,
      "todaySignups": 342,
      "totalQuestions": 45890,
      "unresolvedQuestions": 156,
      "pendingReports": 12
    },
    "trend": [
      { "date": "2026-11-10", "questions": 317, "signups": 217 },
      { "date": "2026-11-16", "questions": 527, "signups": 347 }
    ],
    "topTags": [
      { "rank": 1, "name": "league-of-legends", "questionCount": 4120, "share": 18.2 }
    ],
    "recentPendingReports": [
      {
        "id": 12,
        "targetType": "answer",
        "targetId": 342,
        "preview": "이 실력으로 질문을 왜 올리는지 이해가 안 가네요...",
        "reason": "abuse",
        "reporter": { "id": 7, "nickname": "gamer01", "profileImageUrl": null },
        "createdAt": "2026-11-16T05:02:00.000Z"
      }
    ]
  }
}
```

- `kpis.totalMembers`: 탈퇴 회원 제외
- `trend`: 오늘 포함 최근 7일. 최고점(peak)·오늘 강조는 프론트엔드에서 계산
- `topTags`: 질문 수 상위 **10개**, `share`는 전체 질문 대비 비율(%)
- `trend`, `topTags`는 **선택** 구현입니다. 구현 전에는 빈 배열 `[]`을 보내고, 프론트엔드는 빈 상태 문구를 보여 줍니다.
- `recentPendingReports`: 처리 대기 신고 최신 5건. 대상이 삭제됐으면 `preview`는 `null`
- 사이드바의 신고 배지 숫자는 `kpis.pendingReports`를 사용합니다.

### 10.2 회원 관리

#### GET `/api/admin/users`

**Query**

| 이름 | 기본값 | 설명 |
| --- | --- | --- |
| `page`, `size` | `1`, `20` | |
| `keyword` | - | 아이디 또는 닉네임 부분 일치 |
| `status` | - | `active`(제재 없음) / `restricted`(글쓰기·댓글 제한 중) / `suspended`(이용 정지 중) / `withdrawn`(탈퇴), 생략 시 탈퇴 회원을 뺀 전체 |
| `role` | - | `USER` / `ADMIN`, 생략 시 전체 |
| `sort` | `newest` | `newest`(가입일 최신순) / `oldest` |

**Response** `200`

```json
{
  "success": true,
  "data": [
    {
      "id": 8,
      "username": "apex_legend",
      "nickname": "에이펙스러버",
      "role": "USER",
      "permissions": [],
      "status": "suspended",
      "sanctions": [
        { "type": "suspend", "until": "2026-12-01T00:00:00.000Z" },
        { "type": "comment_ban", "until": null }
      ],
      "createdAt": "2026-11-15T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "size": 20, "totalCount": 1248 }
}
```

- `sanctions`: **지금 걸려 있는** 제재 목록. 없으면 `[]`. `until`이 `null`이면 영구
- `status`: 탈퇴했으면 `withdrawn`, 아니면 `sanctions`로 계산한 값. 이용 정지가 있으면 `suspended`, 글쓰기·댓글 제한만 있으면 `restricted`, 없으면 `active`

#### GET `/api/admin/users/:userId`

**Response** `200`

```json
{
  "success": true,
  "data": {
    "id": 4,
    "username": "pro_user",
    "nickname": "프로유저",
    "name": "홍길동",
    "email": "pro@gamers.com",
    "role": "USER",
    "permissions": ["content_manage"],
    "status": "suspended",
    "sanctions": [
      { "type": "suspend", "until": "2026-11-20T01:20:00.000Z" },
      { "type": "write_ban", "until": null }
    ],
    "createdAt": "2026-10-01T00:00:00.000Z",
    "activity": { "questionCount": 12, "answerCount": 40, "reportsReceivedCount": 3 },
    "sanctionHistory": [
      {
        "action": "apply",
        "type": "write_ban",
        "days": null,
        "reason": "도배성 게시글 반복",
        "admin": { "id": 1, "nickname": "운영자01", "profileImageUrl": null },
        "createdAt": "2026-11-14T02:00:00.000Z"
      },
      {
        "action": "apply",
        "type": "suspend",
        "days": 7,
        "reason": "신고 처리: 욕설·비하 (신고 #12)",
        "admin": { "id": 1, "nickname": "운영자01", "profileImageUrl": null },
        "createdAt": "2026-11-13T01:20:00.000Z"
      },
      {
        "action": "release",
        "type": "suspend",
        "days": null,
        "reason": "오처리 정정",
        "admin": { "id": 1, "nickname": "운영자01", "profileImageUrl": null },
        "createdAt": "2026-11-12T09:05:00.000Z"
      }
    ]
  }
}
```

- `sanctionHistory`: 최신순. `action`은 `apply`(제재) / `release`(해제), `days`는 제재일 때 기간(`null`이면 영구), 해제일 때 `null`

**Errors**: `404 USER_NOT_FOUND`

#### PATCH `/api/admin/users/:userId`

회원의 제재 상태 또는 관리 권한을 바꿉니다. 한 번에 `sanctions`와 `permissions` 중 **하나만** 보냅니다.

**제재**: `sanctions`에 바꿀 제재 **1종류만** 넣습니다. 값이 객체면 제재, `null`이면 해제입니다.

**Request**

```json
// 글쓰기 7일 제한
{ "sanctions": { "writeBan": { "days": 7 } }, "reason": "도배성 게시글 반복" }

// 영구 정지
{ "sanctions": { "suspend": { "days": null } }, "reason": "불법 프로그램 반복 유포" }

// 댓글 제한 해제
{ "sanctions": { "commentBan": null }, "reason": "오처리 정정" }

// 게시물·댓글 관리 권한 부여 (선택·후순위)
{ "permissions": ["content_manage"], "reason": "커뮤니티 모더레이터 지정" }

// 관리 권한 회수
{ "permissions": [], "reason": "모더레이터 활동 종료" }
```

| 필드 | 규칙 |
| --- | --- |
| `sanctions` | `permissions`가 없으면 필수. `suspend`(이용 정지) / `writeBan`(글쓰기 제한) / `commentBan`(댓글 제한) 중 **정확히 1개** |
| `sanctions.<종류>.days` | 제재일 때 필수. `3` / `7` / `30`, 영구는 `null` |
| `permissions` | `sanctions`가 없으면 필수. 회원이 가질 권한 **전체 목록**으로 교체합니다. 지금은 `content_manage`만 있고, `[]`이면 회수 |
| `reason` | 필수, 1~200자 |

- 권한은 `USER`에게만 줄 수 있습니다. `ADMIN`은 이미 모든 관리 기능을 쓸 수 있으므로 `400 VALIDATION_ERROR`입니다.
- 권한이 실제로 바뀌면 `GRANT_PERMISSION` / `REVOKE_PERMISSION`으로 활동 로그에 남깁니다. 바뀐 것이 없으면 로그 없이 `200`입니다.
- 제재는 `SANCTION_USER`, 해제는 `RELEASE_SANCTION`으로 활동 로그와 회원 제재 이력에 남깁니다.
- 같은 종류의 제재가 이미 걸려 있으면 거절합니다. 기간을 바꾸려면 해제한 뒤 다시 겁니다.

**Response** `200`: 회원 상세와 같은 형식

**Errors**: `400 VALIDATION_ERROR` (`sanctions`가 비었거나 2종류 이상, `sanctions`·`permissions`를 함께 보냄, 없는 권한 이름 등), `403 CANNOT_SANCTION_ADMIN`, `404 USER_NOT_FOUND`, `409 SANCTION_ALREADY_ACTIVE` (같은 종류 제재 중), `409 SANCTION_NOT_ACTIVE` (걸려 있지 않은 제재 해제)

### 10.3 질문/답변 관리

질문·답변·게시글·댓글의 관리 목록 항목은 `status`(`active` / `hidden` / `deleted`)를 가집니다. 숨김/복구 Request는 네 가지 모두 같은 형식입니다.

```json
{ "status": "hidden", "reason": "스팸 광고" }
```

| 필드 | 규칙 |
| --- | --- |
| `status` | 필수, `hidden`(숨김) / `active`(복구). `deleted`는 `DELETE` API로만 바꿉니다 |
| `reason` | 선택, 최대 200자 (활동 로그에 기록) |

- 삭제 상태(`deleted`)인 항목은 숨김/복구할 수 없습니다. (`409 CONTENT_DELETED`)
- 관리 목록의 `status` Query: `active` / `hidden` / `deleted`, 생략 시 삭제된 항목을 뺀 전체

#### GET `/api/admin/questions`

**Query**

| 이름 | 설명 |
| --- | --- |
| `page`, `size` | |
| `keyword` | 제목 또는 작성자 닉네임 |
| `tag` | 태그 이름 |
| `status` | `active` / `hidden` / `deleted`, 생략 시 삭제된 항목을 뺀 전체 |

**Response** `200`

```json
{
  "success": true,
  "data": [
    {
      "id": 127,
      "title": "...",
      "author": { "id": 12, "nickname": "호야", "profileImageUrl": null },
      "tags": ["마인크래프트"],
      "answerCount": 3,
      "isAccepted": false,
      "status": "hidden",
      "createdAt": "2026-11-16T04:02:00.000Z"
    }
  ],
  "meta": { "page": 1, "size": 20, "totalCount": 45890 }
}
```

#### PATCH `/api/admin/questions/:questionId`

질문 숨김/복구. Request는 위 숨김/복구 형식입니다.

**Response** `200`: 목록 항목 1개

**Errors**: `400 VALIDATION_ERROR`, `404 QUESTION_NOT_FOUND`, `409 CONTENT_DELETED`

#### DELETE `/api/admin/questions/:questionId`

관리자는 답변이 있는 질문도 삭제할 수 있습니다. 질문과 답변을 모두 삭제 상태(`deleted`)로 바꿉니다.

**Response** `204`

**Errors**: `404 QUESTION_NOT_FOUND`

#### GET `/api/admin/answers`

**Query**

| 이름 | 설명 |
| --- | --- |
| `page`, `size` | |
| `keyword` | 본문 또는 작성자 닉네임 |
| `status` | `active` / `hidden` / `deleted`, 생략 시 삭제된 항목을 뺀 전체 |

**Response** `200`

```json
{
  "success": true,
  "data": [
    {
      "id": 342,
      "preview": "이 실력으로 질문을 왜 올리는지 이해가 안 가네요...",
      "question": { "id": 128, "title": "엘든링 말레니아 2페이즈 공략 팁 있을까요?" },
      "author": { "id": 4, "nickname": "pro_user", "profileImageUrl": null },
      "isAccepted": false,
      "status": "hidden",
      "createdAt": "2026-11-16T04:30:00.000Z"
    }
  ],
  "meta": { "page": 1, "size": 20, "totalCount": 128402 }
}
```

- `preview`: 답변 본문 앞 60자

#### PATCH `/api/admin/answers/:answerId`

답변 숨김/복구. Request는 위 숨김/복구 형식입니다.

- 채택된 답변을 숨기면 삭제와 같이 **질문의 채택 상태를 해제**합니다(`is_accepted`를 `0`으로). 숨긴 답변이 채택으로 남으면 질문은 "채택 완료"인데 채택 답변이 보이지 않기 때문입니다.
- 복구해도 채택은 돌아오지 않습니다. 그사이 질문자가 다른 답변을 채택했을 수 있어, 질문당 채택 1개 규칙을 지키기 위해서입니다. 질문자는 복구한 답변을 포함해 다시 채택할 수 있습니다.
- 채택을 해제했으면 활동 로그 `detail`에 함께 적습니다. 프론트엔드는 채택된 답변을 숨기기 전에 "채택이 해제되고 복구해도 돌아오지 않는다"는 확인 창을 보여 줍니다.

**Response** `200`: 목록 항목 1개

**Errors**: `400 VALIDATION_ERROR`, `404 ANSWER_NOT_FOUND`, `409 CONTENT_DELETED`

#### DELETE `/api/admin/answers/:answerId`

답변을 삭제 상태(`deleted`)로 바꿉니다. 채택된 답변을 삭제하면 질문의 채택 상태도 해제합니다.

**Response** `204`

**Errors**: `404 ANSWER_NOT_FOUND`

### 10.4 자유게시판 관리

#### GET `/api/admin/posts`

**Query**: `page`, `size`, `keyword`(제목 또는 작성자 닉네임), `status`

**Response** `200`

```json
{
  "success": true,
  "data": [
    {
      "id": 51,
      "title": "...",
      "author": { "id": 20, "nickname": "해야", "profileImageUrl": null },
      "commentCount": 3,
      "status": "active",
      "createdAt": "2026-11-14T07:30:00.000Z"
    }
  ],
  "meta": { "page": 1, "size": 20, "totalCount": 3240 }
}
```

#### PATCH `/api/admin/posts/:postId`

게시글 숨김/복구. Request는 [10.3](#103-질문답변-관리)의 숨김/복구 형식입니다.

```json
{ "status": "hidden", "reason": "욕설 포함" }
```

**Response** `200`: 목록 항목 1개

**Errors**: `400 VALIDATION_ERROR`, `404 POST_NOT_FOUND`, `409 CONTENT_DELETED`

#### DELETE `/api/admin/posts/:postId`

게시글과 댓글을 모두 삭제 상태(`deleted`)로 바꿉니다.

**Response** `204`

**Errors**: `404 POST_NOT_FOUND`

#### GET `/api/admin/comments`

**Query**: `page`, `size`, `keyword`(내용 또는 작성자 닉네임), `status`

**Response** `200`

```json
{
  "success": true,
  "data": [
    {
      "id": 889,
      "preview": "이번 점검 보상 사실 전부 취소됐다던데요?",
      "post": { "id": 57, "title": "오늘 롤 듀오 구해요" },
      "author": { "id": 11, "nickname": "rumor_kr", "profileImageUrl": null },
      "status": "active",
      "createdAt": "2026-11-15T00:12:00.000Z"
    }
  ],
  "meta": { "page": 1, "size": 20, "totalCount": 18520 }
}
```

- `preview`: 댓글 내용 앞 60자

#### PATCH `/api/admin/comments/:commentId`

댓글 숨김/복구. Request는 [10.3](#103-질문답변-관리)의 숨김/복구 형식입니다.

```json
{ "status": "hidden", "reason": "허위 정보" }
```

**Response** `200`: 목록 항목 1개

**Errors**: `400 VALIDATION_ERROR`, `404 COMMENT_NOT_FOUND`, `409 CONTENT_DELETED`

#### DELETE `/api/admin/comments/:commentId`

댓글을 삭제 상태(`deleted`)로 바꿉니다. (REQ-ADMIN-012)

**Response** `204`

**Errors**: `404 COMMENT_NOT_FOUND`

### 10.5 태그 관리

**AdminTag 객체**

```json
{
  "id": 3,
  "name": "league-of-legends",
  "description": "리그 오브 레전드 관련 질문",
  "questionCount": 4120,
  "status": "active",
  "blockedAt": null,
  "createdAt": "2026-01-02T00:00:00.000Z"
}
```

- `status`: `active`(사용 중) / `blocked`(관리자가 삭제해 차단됨) / `merged`(다른 태그로 병합됨). 차단·병합된 태그는 `questionCount`가 `0`입니다. 차단된 태그는 `blockedAt`에 삭제 시각이 들어갑니다.

#### GET `/api/admin/tags`

**Query**: `page`, `size`, `keyword`(이름 부분 일치), `sort` = `usage_desc`(기본) / `name_asc` / `recent`, `status` = `active` / `blocked` / `merged` (생략 시 전체)

**Response** `200`: `AdminTag[]` + `meta`

#### POST `/api/admin/tags`

**Request**

```json
{ "name": "league-of-legends", "description": "리그 오브 레전드 관련 질문" }
```

- `name`: 필수, [5.1 태그 이름 규칙](#51-태그-이름-규칙)을 따름
- `description`: 선택, 최대 100자

- 차단된 태그와 같은 이름이면 새로 만들지 않고 `400 TAG_BLOCKED`로 거절합니다. 다시 쓰려면 아래 `PATCH`로 차단을 풉니다.

**Response** `201`: `AdminTag`

**Errors**: `400 VALIDATION_ERROR`, `400 TAG_BLOCKED`, `409 TAG_DUPLICATED`

#### PATCH `/api/admin/tags/:tagId`

**Request**: `POST`와 같은 필드 (보낸 필드만 수정). 차단 해제는 `status`만 보냅니다.

```json
{ "status": "active" }
```

- 차단된 태그는 `status: "active"`(차단 해제)만 받습니다. 이름·설명을 바꾸려면 먼저 차단을 풉니다.
- 차단을 풀어도 삭제할 때 끊긴 질문 연결은 돌아오지 않습니다.
- 차단 해제는 활동 로그에 `RESTORE_TAG`로 남깁니다.

**Response** `200`: `AdminTag`

**Errors**: `400 VALIDATION_ERROR` (차단된 태그의 이름·설명 수정 등), `404 TAG_NOT_FOUND`, `409 TAG_DUPLICATED`

#### DELETE `/api/admin/tags/:tagId`

태그를 **차단**합니다 (REQ-ADMIN-010). 행을 지우지 않고 `status`를 `blocked`로 바꿔, 같은 이름의 태그가 다시 만들어지지 않게 합니다.

- 질문에서 사용 중인 태그도 삭제할 수 있습니다. 태그와 질문의 연결만 끊고 질문은 남깁니다.
- 프론트엔드는 삭제 확인 창에 목록의 `questionCount`로 "질문 N건에서 이 태그가 빠집니다."와 "같은 이름으로 다시 만들 수 없습니다."를 보여 줍니다.
- 이미 차단된 태그를 다시 삭제하면 아무것도 바꾸지 않고 `204`입니다.

**Response** `204`

**Errors**: `404 TAG_NOT_FOUND`

#### DELETE `/api/admin/tags/:tagId?mergeInto=:targetTagId`

태그 병합 (선택). `:tagId` 태그(원본)를 `mergeInto` 태그(대상)로 합칩니다. 원본을 쓰던 질문은 대상 태그로 옮겨지고(이미 대상 태그가 있으면 중복 제거), 원본 태그는 `merged` 상태가 됩니다.

- 원본 태그는 지우지 않고 `status`를 `merged`로 바꾸고 대상 태그를 기록합니다. 차단(`blocked`)과 달리, 이후 질문에 원본 이름을 쓰면 **대상 태그로 바꿔서** 저장합니다. (예: `lol` → `league-of-legends`)
- 관리자가 병합된 이름으로 새 태그를 만들면 `409 TAG_DUPLICATED`입니다.
- 차단된 태그는 원본·대상 모두 쓸 수 없습니다.

```http
DELETE /api/admin/tags/9?mergeInto=3
```

- 활동 로그에는 `DELETE_TAG`가 아니라 `MERGE_TAG`로 남깁니다.

**Response** `200`: 병합 후 대상 태그(`AdminTag`)

**Errors**: `400 TAG_MERGE_SAME`, `400 TAG_BLOCKED` (원본 또는 대상이 차단됨), `404 TAG_NOT_FOUND` (원본 또는 대상 없음)

### 10.6 신고 관리

> 신고 관리 API는 필수로 두되, 중간점검 범위에 넣을지 검토 중입니다.

**AdminReport 객체**

```json
{
  "id": 12,
  "targetType": "answer",
  "targetId": 342,
  "targetAuthor": { "id": 4, "nickname": "pro_user", "profileImageUrl": null },
  "preview": "이 실력으로 질문을 왜 올리는지 이해가 안 가네요... 접으시길",
  "fullText": "이 실력으로 질문을 왜 올리는지 이해가 안 가네요... 다른 사람 시간 뺏지 말고 접으시길 바랍니다.",
  "reason": "abuse",
  "detail": null,
  "attachments": [],
  "reporter": { "id": 7, "nickname": "gamer01", "profileImageUrl": null },
  "status": "pending",
  "duplicateCount": 3,
  "targetStatus": "active",
  "createdAt": "2026-11-16T05:02:00.000Z",
  "processedAt": null
}
```

- `duplicateCount`: 같은 대상에 대한 `pending` 신고 수 (자기 자신 포함)
- `targetStatus`: 신고 대상의 현재 상태 `active` / `hidden` / `deleted`. 관리자가 숨겼으면 `hidden`
- `preview`: 대상 본문 앞 60자
- 신고 대상이 삭제 상태(`deleted`)면 `preview`, `fullText`, `targetAuthor`는 `null`입니다. 프론트엔드는 "삭제된 콘텐츠"로 표시합니다. (데이터는 남아 있지만 관리자 신고 화면에서는 보여 주지 않습니다)

#### GET `/api/admin/reports`

**Query**

| 이름 | 기본값 | 설명 |
| --- | --- | --- |
| `page`, `size` | `1`, `20` | |
| `status` | `pending` | `pending` / `resolved` / `rejected` |
| `targetType` | - | 생략 시 전체 |
| `reason` | - | 생략 시 전체 |

**Response** `200`

```json
{
  "success": true,
  "data": [ ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalCount": 8,
    "statusCounts": { "pending": 8, "resolved": 1, "rejected": 1 }
  }
}
```

- `meta.statusCounts`: 탭 배지에 쓰는 상태별 전체 건수

#### GET `/api/admin/reports/:reportId`

**Response** `200`: `AdminReport`

**Errors**: `404 REPORT_NOT_FOUND`

#### PATCH `/api/admin/reports/:reportId`

신고 처리와 반려를 `status` 값으로 구분합니다.

**Request**

```json
// 처리
{ "status": "resolved", "hideTarget": true, "sanction": { "type": "suspend", "days": 7 } }

// 반려
{ "status": "rejected" }
```

| 필드 | 규칙 |
| --- | --- |
| `status` | 필수, `resolved` / `rejected` |
| `hideTarget` | `resolved`일 때 필수, 신고 대상 숨김 여부 |
| `sanction` | `resolved`일 때 필수. 대상 작성자 제재 `{ "type": "suspend" \| "write_ban" \| "comment_ban", "days": 3 \| 7 \| 30 \| null }`, 제재하지 않으면 `null`. `days: null`은 영구 |

- 같은 대상에 대한 다른 `pending` 신고도 함께 같은 상태로 바꿉니다.
- `sanction`이 `null`이 아니면 회원 제재 이력에 `신고 처리: <사유> (신고 #id)`로 남깁니다. 같은 종류 제재가 이미 걸려 있으면 `409 SANCTION_ALREADY_ACTIVE`입니다.
- 신고 대상이 이미 삭제됐으면 `hideTarget`·`sanction`은 무시하고 신고 상태만 `resolved`로 바꿉니다.
- `hideTarget`으로 채택된 답변을 숨기면 [답변 숨김](#patch-apiadminanswersanswerid)과 같이 질문의 채택 상태도 해제합니다.
- 활동 로그에는 `RESOLVE_REPORT` / `REJECT_REPORT`로 남깁니다.

**Response** `200`: `AdminReport`

**Errors**: `400 VALIDATION_ERROR` (`status` 값 오류 등), `404 REPORT_NOT_FOUND`, `409 REPORT_ALREADY_PROCESSED`, `409 SANCTION_ALREADY_ACTIVE`

### 10.7 공지 관리

공지 관리 API는 모두 **선택** 구현입니다.

#### GET `/api/admin/notices`

**Query**: `page`, `size`. 고정 공지가 먼저, 그다음 최신순.

**Response** `200`: `Notice[]` + `meta` ([9. 공지](#9-공지)의 Notice 객체)

#### POST `/api/admin/notices`

**Request**

```json
{ "title": "서버 점검 안내", "body": "11월 20일 ...", "isPinned": true }
```

- `title`: 필수, 1~100자 / `body`: 필수, [1.9](#19-본문--url-규칙) 본문 규칙 / `isPinned`: 선택, 기본 `false`

**Response** `201`: `Notice`

**Errors**: `400 VALIDATION_ERROR`

#### PATCH `/api/admin/notices/:noticeId`

**Request**: `POST`와 같은 필드 (보낸 필드만 수정)

**Response** `200`: `Notice`

**Errors**: `400 VALIDATION_ERROR`, `404 NOTICE_NOT_FOUND`

#### DELETE `/api/admin/notices/:noticeId`

공지를 삭제 상태(`deleted`)로 바꿉니다. 사용자 화면과 관리자 공지 목록에서 빠집니다.

**Response** `204`

**Errors**: `404 NOTICE_NOT_FOUND`

### 10.8 활동 로그

활동 로그 API는 **선택** 구현입니다. 로그 기록 자체는 위 관리자 API에서 항상 남깁니다.

#### GET `/api/admin/activity-logs`

**Query**

| 이름 | 설명 |
| --- | --- |
| `page`, `size` | |
| `adminId` | 관리자 회원 ID, 생략 시 전체 |
| `action` | 아래 action 또는 그룹(`HIDE`, `RESTORE`, `DELETE`) |
| `startDate`, `endDate` | `YYYY-MM-DD`, 양 끝 포함 |

관리자 선택 목록은 `GET /api/admin/users?role=ADMIN`으로 조회합니다.

- **보관 기간 5년**: 작성 후 5년이 지난 로그는 `status`를 `expired`로 바꾸고 이 API에서 빼고 보여 줍니다. (행은 남김, [1.7](#17-삭제-정책-soft-delete))
- 처리한 관리자가 탈퇴하면 로그는 그대로 두고, `admin`은 탈퇴 회원 표기(`{ "id": null, "nickname": "탈퇴한 회원", ... }`)로 내려갑니다.

| action | 그룹 | 설명 |
| --- | --- | --- |
| `SANCTION_USER` | - | 회원 제재 (정지·글쓰기 제한·댓글 제한) |
| `RELEASE_SANCTION` | - | 회원 제재 해제 |
| `GRANT_PERMISSION` / `REVOKE_PERMISSION` | - | 게시물·댓글 관리 권한 부여 / 회수 (선택·후순위) |
| `MODERATE_EDIT` / `MODERATE_DELETE` | - | 관리 권한을 가진 회원이 다른 회원의 글을 수정 / 삭제 (`admin`에 그 회원이 들어감) |
| `HIDE_QUESTION` / `HIDE_ANSWER` / `HIDE_POST` / `HIDE_COMMENT` | `HIDE` | 숨김 |
| `RESTORE_QUESTION` / `RESTORE_ANSWER` / `RESTORE_POST` / `RESTORE_COMMENT` | `RESTORE` | 숨김 복구 |
| `DELETE_QUESTION` / `DELETE_ANSWER` / `DELETE_POST` / `DELETE_COMMENT` | `DELETE` | 삭제 (`status: deleted`) |
| `CREATE_TAG` / `UPDATE_TAG` | - | 태그 생성 / 수정 |
| `DELETE_TAG` / `RESTORE_TAG` | - | 태그 삭제(차단) / 차단 해제 |
| `MERGE_TAG` | - | 태그 병합 |
| `RESOLVE_REPORT` / `REJECT_REPORT` | - | 신고 처리/반려 |
| `CREATE_NOTICE` / `UPDATE_NOTICE` / `DELETE_NOTICE` | - | 공지 변경 |

**Response** `200`

```json
{
  "success": true,
  "data": [
    {
      "id": 8,
      "action": "RESOLVE_REPORT",
      "admin": { "id": 1, "nickname": "운영자01", "profileImageUrl": null },
      "targetType": "report",
      "targetId": 12,
      "targetLabel": "신고 #12",
      "detail": "대상 숨김 + 7일 정지",
      "createdAt": "2026-11-16T05:10:00.000Z"
    }
  ],
  "meta": { "page": 1, "size": 20, "totalCount": 8 }
}
```

- `targetType`: `user` / `question` / `answer` / `post` / `comment` / `tag` / `report` / `notice`
- `targetLabel`: **최대 16자**. `<대상 종류> #<id>` 형식으로 만듭니다. (예: `질문 #128`, `회원 #4`, `태그 #9`) 이름·제목은 길이가 들쭉날쭉해 넣지 않고, 화면은 `targetType`·`targetId`로 이동 링크를 만듭니다.
- `detail`: **최대 256자**. 사유·처리 내용 요약 (예: `대상 숨김 + 7일 정지`, `이용 정지 7일 · 욕설·비하`). 넘으면 잘라서 저장합니다.
- 화면의 이동 링크(`/admin/members/4` 등)는 `targetType`, `targetId`로 프론트엔드에서 만듭니다.

---

## 11. 결정 필요 사항

### 11.1 범위 제외 / 후순위 항목

이번 범위에서 제외했거나, **필수 기능을 먼저 개발한 뒤 추가 개발할 수 있는 후순위** 항목입니다. 포함하기로 정하면 이 문서를 먼저 고칩니다. 확정된 항목은 표에서 지우고 본문에 반영합니다. (ID는 다시 매기지 않습니다.)

| ID | 항목 | 현재 상황 | 기본안 |
| --- | --- | --- | --- |
| D-8 | 레벨·경험치·랭크·매너온도 | 화면에만 있음: 마이페이지(LV, 랭크 DIAMOND, 매너온도·응답률, 공식 인증 클랜원, 온라인 표시), 질문·답변 작성자(Lv, 채택률, 칭호), 질문 작성·답변 수정 사이드바의 보상·EXP 카드, 신고 대상 카드의 Lv | **후순위**. 필수 기능 뒤에 레벨·경험치 규칙(획득 조건, 등급표)과 회원 응답 필드를 정해 추가. 그 전까지 화면 값은 mock |
| D-11 | 질문 추천 | 질문 상세에 "추천" 버튼 있으나 WBS에 없음 | 이번 범위 제외 (답변 추천만 구현, #76) |
| D-13 | 게시글 카테고리 | 게시글 상세에 "공략" 카테고리 표시, 작성 화면에는 선택란 없음 | 이번 범위 제외 |
| D-14 | 알림 | 화면에만 있음: 헤더 알림 벨, 질문·답변 수정 시 "기여자·추천자에게 알림", 신고 완료 "알림 센터와 이메일로 결과 전송" 안내 | **후순위**. 추가 시 알림 목록·읽음 처리 API와 알림을 보내는 경우(답변 등록, 채택, 신고 처리, 글 수정)를 정함 |
| D-15 | 태그 상세 (REQ-TAG-002) | 회원용 태그 상세 API·화면 없음. 태그 목록·자동완성만 있음 | **후순위**. 추가 시 `GET /api/tags/:tagId`(이름·설명·질문 수)와 태그 상세 화면 |
| D-16 | 회원 태그 수정 권한 (REQ-TAG-003) | 태그 수정은 관리자만 가능. 요구사항은 "계정레벨 n 이상 회원"도 수정 | **후순위**. 레벨 기능(D-8)이 먼저 필요. 그 전까지는 관리자만 수정 |
| D-17 | 태그 동의어 제안·투표 (REQ-TAG-004) | 관리자 병합(`merged`)만 있음 | **후순위**. 추가 시 동의어 제안·추천 API와 등록/삭제 기준(추천 5 이상 등록, -2 미만 삭제). 관리자는 바로 등록(지금의 병합) |
| D-18 | 운영 통계·추천 표시 | 화면에만 있음: 로그인 "오늘 등록된 새 공략", 신고 화면 "평균 처리 시간·SLA·금일 필터 현황", 신고 완료 "예상 처리 시간", 커뮤니티 통계 "전주 대비", 질문 작성 중 "유사한 기존 해결 질문" | **후순위**. 추가 시 각 값을 주는 통계 API(`GET /api/questions/stats` 확장, 신고 처리 통계)와 작성 중 유사 질문 검색 API |
| D-19 | 게임 계정 연동·크레딧·배틀패스 | 기능 없음. 회원 탈퇴 안내에 있던 "게임 연동 계정·전적 통계 파기", "잔여 크레딧·배틀패스 보상 소멸" 문구는 화면에서 빼고 2장 회원 탈퇴 내용으로 바꿈 | **후순위**. 해당 기능이 생기면 탈퇴 시 처리 규칙을 2장 회원 탈퇴에 추가 |
| D-20 | 수정 전 본문 버전 기록 | 화면에만 있음: 답변 수정 "버전별 Diff 기록", "버전 v1.1 생성 예정" | **후순위**. 지금 수정 이력은 시각·수정자·사유만 저장(3장 수정 이력). 추가 시 이력에 수정 전 본문을 저장하고 비교 화면 제공 |
| D-21 | 긴급 신고 즉시 임시 숨김 | 화면에만 있음: 신고 화면 "긴급성 사유(핵/피싱/음란)는 전수 확인 전까지 임시 숨김" | **후순위**. 지금 규칙은 자동 숨김 없이 신고를 처리 대기로 접수하고 관리자가 직접 숨김·제재(8장). 추가 시 즉시 숨김할 신고 사유와 조건을 정함 |
| D-22 | 파티 찾기 | 기능 없음. 소개글 도움말에 있던 "파티 찾기 화면에 노출" 문구는 화면에서 뺌 | **후순위**. 파티 찾기 기능을 정하면 추가 |

---

## 12. 에러 코드 모음

| Status | code | 상황 |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | 입력값 형식 오류 |
| 400 | `INVALID_JSON` | 요청 본문이 JSON이 아님 |
| 400 | `PASSWORD_MISMATCH` | 현재 비밀번호 불일치 |
| 400 | `RESET_TOKEN_INVALID` | 비밀번호 재설정 토큰 만료/무효 |
| 400 | `TAG_REQUIRED` | 질문에 태그 없음 |
| 400 | `TAG_LIMIT_EXCEEDED` | 태그 5개 초과 |
| 400 | `TAG_MERGE_SAME` | 같은 태그끼리 병합 |
| 400 | `TAG_BLOCKED` | 관리자가 삭제(차단)한 태그 사용·재생성 |
| 400 | `ATTACHMENT_INVALID` | 없는 첨부파일 또는 남의 첨부파일 |
| 400 | `ATTACHMENT_LIMIT_EXCEEDED` | 신고 증빙 3개 초과 |
| 400 | `FILE_TYPE_NOT_ALLOWED` | 허용하지 않는 파일 형식 |
| 400 | `FILE_TOO_LARGE` | 파일 크기 초과 |
| 400 | `CANNOT_ACCEPT_OWN_ANSWER` | 자기 답변 채택 |
| 400 | `CANNOT_VOTE_OWN_ANSWER` | 자기 답변 추천 |
| 400 | `CANNOT_REPORT_OWN_CONTENT` | 자기 글 신고 |
| 401 | `UNAUTHORIZED` | 로그인 필요 / 토큰 만료 |
| 401 | `INVALID_CREDENTIALS` | 아이디 또는 비밀번호 불일치 |
| 403 | `FORBIDDEN` | 권한 없음 (작성자 아님, 관리자 아님) |
| 403 | `USER_SUSPENDED` | 이용 정지된 회원 (로그인·쓰기) |
| 403 | `WRITE_BANNED` | 글쓰기 제한 중인 회원의 질문·답변·게시글 작성/수정 |
| 403 | `COMMENT_BANNED` | 댓글 제한 중인 회원의 댓글 작성 |
| 403 | `CANNOT_SANCTION_ADMIN` | 관리자 계정 제재 시도 |
| 404 | `ROUTE_NOT_FOUND` | 없는 API 경로 |
| 404 | `USER_NOT_FOUND` | 회원 없음 |
| 404 | `QUESTION_NOT_FOUND` | 질문 없음 |
| 404 | `ANSWER_NOT_FOUND` | 답변 없음 |
| 404 | `VOTE_NOT_FOUND` | 추천하지 않은 답변의 추천 취소 |
| 404 | `POST_NOT_FOUND` | 게시글 없음 |
| 404 | `COMMENT_NOT_FOUND` | 댓글 없음 |
| 404 | `TAG_NOT_FOUND` | 태그 없음 |
| 404 | `ATTACHMENT_NOT_FOUND` | 첨부파일 없음 |
| 404 | `REPORT_NOT_FOUND` | 신고 없음 |
| 404 | `REPORT_TARGET_NOT_FOUND` | 신고 대상 없음 |
| 404 | `NOTICE_NOT_FOUND` | 공지 없음 |
| 409 | `USERNAME_DUPLICATED` | 아이디 중복 |
| 409 | `NICKNAME_DUPLICATED` | 닉네임 중복 |
| 409 | `EMAIL_DUPLICATED` | 이메일 중복 |
| 409 | `QUESTION_HAS_ANSWERS` | 답변이 있는 질문 삭제 |
| 409 | `QUESTION_ALREADY_ACCEPTED` | 이미 채택된 답변이 있음 |
| 409 | `ANSWER_ALREADY_ACCEPTED` | 채택된 답변 수정·삭제 |
| 409 | `ALREADY_VOTED` | 이미 추천함 |
| 409 | `ATTACHMENT_IN_USE` | 글에 연결된 첨부파일 직접 삭제 |
| 409 | `REPORT_DUPLICATED` | 같은 대상 중복 신고 |
| 409 | `REPORT_CANCEL_EXPIRED` | 신고 취소 가능 시간 지남 |
| 409 | `REPORT_ALREADY_PROCESSED` | 이미 처리된 신고 |
| 409 | `SANCTION_ALREADY_ACTIVE` | 같은 종류 제재가 이미 걸려 있음 |
| 409 | `SANCTION_NOT_ACTIVE` | 걸려 있지 않은 제재 해제 |
| 409 | `TAG_DUPLICATED` | 태그 이름 중복 (병합된 이름 포함) |
| 409 | `CONTENT_DELETED` | 삭제 상태인 질문·답변·게시글·댓글을 숨김/복구 |
| 500 | `INTERNAL_SERVER_ERROR` | 서버 오류 |

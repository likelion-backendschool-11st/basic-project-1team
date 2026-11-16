# GAMERS API 명세서

- 버전: v0.1 (초안, 2026-11-12)
- 근거: `frontend/src/apps/*` 화면·mock 데이터, GitHub WBS 이슈 #44 ~ #79, `backend/docs/CODE_CONVENTION.md`
- 화면과 이 문서가 다르면 **이 문서를 기준**으로 하고, 바꿔야 하면 문서를 먼저 수정합니다.
- 이번 범위에서 제외한 항목은 [13. 결정 필요 사항](#13-결정-필요-사항)에 모아 두었습니다.

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
11. [포인트 / 등급 (points)](#11-포인트--등급)
12. [알림 (notifications)](#12-알림)
13. [결정 필요 사항](#13-결정-필요-사항)
14. [에러 코드 모음](#14-에러-코드-모음)

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
- **비밀번호를 변경·재설정하면 그 전에 발급된 토큰은 모두 무효**가 됩니다. 다른 기기에 남은 로그인도 다음 요청에서 `401 UNAUTHORIZED`가 되어 로그인 화면으로 갑니다. (탈취된 토큰을 비밀번호 변경으로 끊기 위해서)
  - 서버는 비밀번호를 바꾼 시각(`users.password_changed_at`)을 기록하고, 토큰의 발급 시각(`iat`, 초 단위)이 그보다 이르면 거절합니다. 비밀번호를 바꾼 같은 초에 다시 로그인한 토큰은 통과하도록 바꾼 시각을 초 단위로 내림해 비교합니다.
  - Refresh Token과 토큰 무효화 목록은 두지 않습니다. 인증 미들웨어가 요청마다 회원 행을 읽고 있어 컬럼 하나로 처리합니다.
- **로그아웃은 서버 API가 없습니다.** 프론트엔드가 `localStorage`·`sessionStorage`의 토큰을 모두 지우고, 다른 화면으로 이동하지 않은 채 현재 화면을 로그아웃 상태로 다시 보여 줍니다. (REQ-LOGIN-007)
  - 진입점: 사용자 화면 헤더 우측 프로필 버튼 → 프로필 메뉴의 "로그아웃", 관리자 상단바 "로그아웃" 버튼
  - 로그인해야 볼 수 있는 화면(마이페이지 등)에서 로그아웃하면 로그인 화면(`/login`)으로 이동합니다.
  - 관리자 상단바 "로그아웃"은 토큰을 지우고 관리자 사이트 로그인 화면(`/admin/login`)으로 이동합니다.
- **관리자 사이트는 사용자 사이트와 따로 실행**되고(주소가 다름) 로그인 토큰을 공유하지 않습니다. 관리자는 관리자 사이트에서 같은 로그인 API로 따로 로그인하고, `role`이 `ADMIN`이 아니면 관리자 사이트 로그인 화면이 거절합니다.
- **헤더 프로필 메뉴** (로그인 상태): 내 정보 요약(프로필 사진·닉네임·아이디)과 "마이페이지"(`/mypage`), "프로필 수정"(`/mypage/edit`), "로그아웃"을 보여 줍니다. 내 정보는 [`GET /api/users/me`](#get-apiusersme)의 `profileImageUrl`, `nickname`, `username`을 씁니다. 비로그인 상태에서 프로필 버튼을 누르면 로그인 화면으로 이동합니다. (REQ-LOGIN-007)
  - 지운 토큰도 만료 전까지는 서버에서 유효합니다. (위와 같은 이유)

- 각 API의 **인증** 칸
  - `없음`: 로그인 없이 호출 가능
  - `선택`: 로그인하면 응답에 본인 기준 값(`isMine`, `isVoted` 등)이 채워짐
    - 토큰을 보내지 않으면 비로그인으로 처리합니다. 토큰을 보냈는데 만료·위조됐거나 탈퇴 회원의 토큰이면 `필수`와 같이 `401 UNAUTHORIZED`입니다. (프론트엔드가 토큰을 지우도록)
  - `필수`: 로그인 필요 (없으면 `401`)
  - `ADMIN`: 관리자 권한 필요 (없으면 `403`)
- 관리자는 회원에게 아래 3가지 제재를 걸 수 있습니다. 기간은 `3` / `7` / `30`일 또는 **영구**이고, 종류가 다르면 동시에 걸 수 있습니다. ([10.2](#102-회원-관리), REQ-ADMIN-003)

| 제재 | `type` | 막히는 것 | 에러 |
| --- | --- | --- | --- |
| 이용 정지 | `suspend` | 로그인과 모든 쓰기 API (작성·수정·삭제·채택·추천·신고) | `403 USER_SUSPENDED` |
| 글쓰기 제한 | `write_ban` | 질문·답변·게시글 작성과 수정 | `403 WRITE_BANNED` |
| 댓글 제한 | `comment_ban` | 자유게시판 댓글 작성 | `403 COMMENT_BANNED` |

  - 에러 메시지에 해제일을 넣습니다. 예: `"2026-12-01까지 글쓰기가 제한된 계정입니다."`, 영구면 `"영구 정지된 계정입니다."`
    - 해제일은 **한국 시간(KST) 기준 날짜**(`YYYY-MM-DD`)로 적습니다. DB의 해제 시각(UTC)을 한국 시간으로 바꾼 날짜입니다.
    - 기간 제재 메시지: `"<해제일>까지 이용이 정지된 계정입니다."` / `"<해제일>까지 글쓰기가 제한된 계정입니다."` / `"<해제일>까지 댓글 작성이 제한된 계정입니다."`
    - 영구 제재 메시지: `"영구 정지된 계정입니다."` / `"영구히 글쓰기가 제한된 계정입니다."` / `"영구히 댓글 작성이 제한된 계정입니다."`
    - 여러 제재가 함께 걸려 있으면 **이용 정지를 먼저** 안내합니다. 같은 종류가 여러 건이면 가장 늦게 풀리는 제재(영구 우선)를 안내합니다.
  - 기간이 지나면 별도 처리 없이 자동으로 풀립니다. (요청 시점에 해제일과 비교)
- **게시물·댓글 관리 권한** (`content_manage`, 선택·후순위 기능, REQ-ADMIN-004): 관리자가 특정 회원에게 줄 수 있습니다. 필수 기능을 먼저 개발한 뒤 추가합니다.
  - 이 권한이 있는 회원은 **작성자가 아니어도** 질문·답변을 수정·삭제하고, 게시글·댓글을 삭제할 수 있습니다.
    - 자유게시판 게시글은 작성자의 의견을 담은 글이라 **삭제만** 하고 내용은 고치지 않습니다. (댓글 수정 API는 없음)
  - 같은 API(`PATCH`·`DELETE /api/questions|answers/...`, `DELETE /api/posts/...`, `DELETE /api/comments/...`)를 그대로 쓰고, 서버는 "작성자 본인 **또는** `content_manage` 권한 **또는** `ADMIN`"이면 허용합니다.
    - `ADMIN`은 권한을 따로 받지 않아도 사용자 사이트에서 `content_manage`와 같은 범위로 수정·삭제할 수 있습니다. 숨김·복구, 확인 모달을 거치는 삭제 같은 관리 기능은 관리자 사이트에서 합니다.
  - 작성자에게 적용되는 규칙은 똑같이 적용합니다. 답변이 달린 질문 삭제(`409 QUESTION_HAS_ANSWERS`), 채택된 답변 수정·삭제(`409 ANSWER_ALREADY_ACCEPTED`)는 이 권한으로도 할 수 없습니다.
  - 숨김·복구, 회원 제재, 신고 처리 같은 관리자 기능은 할 수 없습니다.
  - 이용 정지 중이면 권한이 있어도 쓸 수 없습니다.
  - 다른 회원의 글을 수정·삭제하면 (`ADMIN` 포함) 활동 로그에 `MODERATE_EDIT`(질문·답변) / `MODERATE_DELETE`로 남깁니다.
  - 프론트엔드는 `isMine`이 `true`이거나, 내 정보(`GET /api/users/me`)의 `permissions`에 `content_manage`가 있거나, `role`이 `ADMIN`이면 수정·삭제 버튼을 보여 줍니다. 단 남의 게시글에는 삭제 버튼만 보여 줍니다.
- **비회원**은 질문/답변과 자유게시판을 읽을 수 있습니다. 기본 화면(`/`)은 질문 목록(`/qna`)입니다.
  - 작성·추천·신고 버튼을 누르면 프론트엔드가 API를 호출하지 않고 "로그인이 필요합니다" 팝업으로 로그인 화면 이동 여부를 묻습니다.
  - 로그인 화면은 `/login?redirect=<원래 경로>`로 열고, 로그인 후 원래 화면으로 돌아갑니다.
  - 돌아갈 화면(`redirect`)이 없으면 로그인 응답의 `user.role`을 보고 관리자(`ADMIN`)는 관리자 화면(`/admin`, 관리자 사이트로 넘어가며 거기서 다시 로그인), 그 외는 질문 목록(`/qna`)으로 이동합니다. (REQ-LOGIN-001)
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
- 경로의 id(`:questionId` 등)가 1 이상의 정수가 아니면 `400 VALIDATION_ERROR`입니다.
- 같은 요청이 동시에 들어와 고유 값(unique)이 겹치면 먼저 처리된 쪽을 따르고, 나머지는 `409`입니다. API별로 정한 코드(`USERNAME_DUPLICATED`, `ALREADY_VOTED` 등)가 없으면 `409 CONFLICT`(`"이미 존재하는 리소스입니다."`)입니다.
- 요청 본문(JSON)은 **최대 1MB**입니다. 넘으면 `400 VALIDATION_ERROR`(`"요청 본문이 너무 큽니다."`)입니다. 본문 HTML 최대 100,000자([1.9](#19-본문--url-규칙))는 한글이면 300KB 안팎이라 이 안에 들어갑니다.

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

- 모든 query 값은 앞뒤 공백을 지우고, 빈 값(`?page=`, `?sort=`)이면 보내지 않은 것으로 보아 기본값을 쓰거나 조건을 적용하지 않습니다.
- 같은 키를 여러 번 보내거나(`?page=1&page=2`) 형식이 틀리면 `400 VALIDATION_ERROR`입니다.

### 1.6 공통 객체

**UserSummary**: 작성자 등 다른 객체 안에 들어가는 회원 정보

```json
{ "id": 12, "nickname": "호야", "profileImageUrl": "https://.../a.png" }
```

탈퇴한 회원의 글은 `{ "id": null, "nickname": "탈퇴한 회원", "profileImageUrl": null }`로 내려갑니다.

- **질문·답변(3·4장)의 `author`** 에는 레벨과 등급이 더 붙습니다: `{ "id": 12, "nickname": "호야", "profileImageUrl": null, "level": 34, "tier": "gold" }`. 관리자·탈퇴 회원은 `level`, `tier`가 `null`입니다. ([11. 포인트 / 등급](#11-포인트--등급)) 그 밖의 API(자유게시판, 관리자, 수정 이력의 `editor` 등)의 `UserSummary`에는 붙지 않습니다.

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
- 삭제 상태는 API로 되돌리지 않습니다. (태그 차단 해제·병합 취소만 예외, [10.5](#105-태그-관리))
- 질문·게시글처럼 하위 데이터가 있으면 하위 데이터(답변·댓글)도 함께 삭제 상태로 바꿉니다.
- 질문-태그, 글-에디터 이미지 같은 연결도 행을 지우지 않고 `deletedAt`을 기록해 끊습니다.
- **예외**: 첨부파일과 프로필 사진의 **실제 파일**(저장소 객체)은 삭제 상태가 되면 지웁니다. DB 행은 남깁니다.
- **예외**: 비밀번호 재설정 토큰(`password_reset_tokens`)은 글·회원 데이터가 아니라 보안용 임시 값이라 **행을 지웁니다.** 만료되거나 사용해서 더는 쓸 수 없게 된 지 **7일**이 지난 토큰을 서버의 정리 작업이 1시간마다 지웁니다. 정리 상태는 [10.9](#109-운영-점검)에서 확인합니다.

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
- 글자 수는 위 정리(sanitize)를 거친 뒤의 본문으로 셉니다. 이모지처럼 두 칸(UTF-16)을 쓰는 글자도 1자로 셉니다.

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

### 1.11 시도 횟수 제한

비밀번호나 회원 정보를 계속 바꿔 넣어 맞히는 시도를 막기 위해, **같은 대상으로 5번 실패하면 5분 동안** 그 대상의 요청을 막습니다.

| API | 실패로 세는 응답 | 세는 기준 |
| --- | --- | --- |
| [`POST /api/auth/login`](#post-apiauthlogin) (관리자 사이트 로그인 포함) | `401 INVALID_CREDENTIALS` | 접속 IP + 입력한 `loginId` |
| [`POST /api/auth/find-username`](#post-apiauthfind-username) | `404 USER_NOT_FOUND` | 접속 IP |
| [`POST /api/auth/password-reset/verify`](#post-apiauthpassword-resetverify) | `404 USER_NOT_FOUND` | 접속 IP |
| [`PATCH /api/users/me/password`](#patch-apiusersmepassword), [`DELETE /api/users/me`](#delete-apiusersme) | `400 PASSWORD_MISMATCH` | 로그인한 회원. 두 API의 실패를 **함께** 셉니다 |

- 5번째 실패까지는 원래 오류로 응답하고, 그 뒤 5분 동안은 입력이 맞아도 확인하지 않고 `429 TOO_MANY_ATTEMPTS`로 응답합니다.
- 메시지: `"시도 횟수를 초과했습니다. N분 후에 다시 시도해주세요."` N은 남은 시간을 분 단위로 올린 값(1~5)입니다. `Retry-After` 헤더에 남은 초를 함께 보냅니다.
- 성공하면 실패 기록을 지웁니다. 잠기지 않은 채 마지막 실패 뒤 5분 동안 실패가 없어도 지웁니다.
- 확인 중인 요청도 함께 세므로, 한꺼번에 여러 요청을 보내도 5번을 넘겨 확인하지 않습니다.
- 다른 API 기준과 서로 따로 셉니다. 예를 들어 로그인 실패는 아이디 찾기 횟수에 들어가지 않습니다.
- 기록은 **서버 메모리**에 둡니다. 서버를 다시 켜면 처음부터 세고, 서버를 여러 대로 늘리면 서버마다 따로 셉니다.
- 접속 IP는 Express의 `req.ip`입니다. 리버스 프록시 뒤에 배포하면 `trust proxy`를 설정해야 회원마다 다른 IP로 셉니다(설정하지 않으면 모든 요청이 프록시 IP 하나로 세집니다).
- 화면은 따로 처리하지 않고, 각 화면에서 서버 오류를 보여 주던 자리에 이 메시지를 그대로 보여 줍니다. 로그인은 폼 위 안내 상자, 아이디·비밀번호 찾기는 폼 안 안내 상자, 비밀번호 변경·회원 탈퇴는 버튼 위입니다.

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
| 필수 | DELETE | `/api/users/me/profile-image` | 프로필 사진 삭제 | 필수 | #53 |
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

**Errors**: `401 INVALID_CREDENTIALS` (아이디 없음/비밀번호 불일치 구분 없이 동일), `403 USER_SUSPENDED`, `429 TOO_MANY_ATTEMPTS` ([1.11](#111-시도-횟수-제한))

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

**Errors**: `404 USER_NOT_FOUND`, `429 TOO_MANY_ATTEMPTS` ([1.11](#111-시도-횟수-제한))

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

**Errors**: `400 VALIDATION_ERROR`, `404 USER_NOT_FOUND`, `429 TOO_MANY_ATTEMPTS` ([1.11](#111-시도-횟수-제한))

### POST `/api/auth/password-reset`

비밀번호 찾기 2단계.

**Request**

```json
{ "resetToken": "c2f1...", "newPassword": "Legend!4729" }
```

**Response** `204`

**Errors**: `400 VALIDATION_ERROR` ([1.8](#18-회원-입력값-규칙) 비밀번호 규칙 위반), `400 RESET_TOKEN_INVALID` (만료/사용됨/위조)

- 재설정에 성공하면 그 전에 발급된 로그인 토큰은 모두 무효가 됩니다. ([1.2](#12-인증))

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
    "mainGames": [
      { "tagId": 3, "name": "리그오브레전드", "answerCount": 23, "acceptedCount": 9 },
      { "tagId": 5, "name": "발로란트", "answerCount": 0, "acceptedCount": 0 }
    ],
    "badges": [
      { "code": "accepted", "level": 2, "count": 12, "nextGoal": 50 },
      { "code": "answers", "level": 2, "count": 52, "nextGoal": 100 },
      { "code": "questions", "level": 2, "count": 18, "nextGoal": 50 },
      { "code": "expert", "level": 1, "count": 23, "nextGoal": 50 },
      { "code": "attendance", "level": 1, "count": 9, "nextGoal": 30 },
      { "code": "manner", "level": null, "count": 12, "nextGoal": 30 }
    ],
    "points": 948,
    "level": 34,
    "tier": "gold",
    "currentLevelPoints": 915,
    "nextLevelPoints": 970,
    "visitReward": 1,
    "createdAt": "2022-03-02T00:00:00.000Z"
  }
}
```

- `interestTags`: 내가 쓴 질문에 가장 많이 쓴 태그 상위 5개
- `mainGames`: 회원이 고른 주력 게임(태그) 최대 5개, 고른 순서대로. 고르지 않았으면 `[]` (REQ-MYPAGE-007)
  - `answerCount`: 그 태그가 붙은 질문(숨김·삭제 제외, 질문 수정으로 뺀 태그 제외)에 회원이 단 답변 수(숨김·삭제 제외). `acceptedCount`: 그중 채택된 답변 수
  - 고른 뒤 태그가 병합되면 병합 대상 태그로 보여 주고(같은 태그가 겹치면 하나만), 차단되면 빼고 보냅니다. 병합이 취소되면 원래 태그로 다시 보입니다.
  - 화면: 프로필 왼쪽의 닉네임·활동 블럭과 등급 블럭 사이에 "주력 게임" 블럭(`#리그오브레전드 · 답변 23 · 채택 9`)을 둡니다. 태그를 누르면 그 태그의 질문 목록으로 이동합니다. 고른 게임이 없으면 마이페이지에는 "수정하기에서 주력 게임을 골라 보세요."를, 공개 프로필에서는 블럭을 숨깁니다.
- `badges`: 활동 배지 6개, 아래 표 순서대로 (REQ-MYPAGE-008). 저장하지 않고 조회할 때 계산합니다.
  - `level`: 얻은 단계 `1`·`2`·`3`(화면 Ⅰ·Ⅱ·Ⅲ). 아직 못 땄으면 `null`
  - `count`: 지금 값, `nextGoal`: 다음 단계 기준(최고 단계면 `null`)
  - 관리자는 포인트·등급처럼 대상이 아니라 `[]`입니다.

| `code` | 화면 이름 | `count` (세는 것) | Ⅰ / Ⅱ / Ⅲ |
| --- | --- | --- | --- |
| `accepted` | 해결사 | 채택된 내 답변 수 (`answerCount`와 같은 기준) | 1 / 10 / 50 |
| `answers` | 답변러 | `answerCount` | 1 / 30 / 100 |
| `questions` | 질문러 | `questionCount` | 1 / 10 / 50 |
| `expert` | 전문가 | 내 답변(`answerCount` 기준)이 받은 추천 수 (취소한 추천 제외) | 10 / 50 / 200 |
| `attendance` | 출석왕 | 하루 첫 접속 포인트(`daily_visit`)를 받은 날 수 ([11.1](#111-포인트-지급--차감-규칙)) | 7 / 30 / 100 |
| `manner` | 매너인 | 마지막 제재가 끝난 날(기간 만료 또는 해제)과 내 글에 대한 신고가 마지막으로 처리(`resolved`)된 날 중 늦은 날부터 지난 일수. 둘 다 없으면 가입일부터. **지금 제재 중이면 `0`** | 30 / 90 / 180 (일) |

  - 숨김·삭제된 글은 세지 않으므로, 글이 숨겨지거나 채택이 풀리면 단계가 내려갈 수 있습니다. 반려된 신고는 매너인 기간에 영향을 주지 않습니다.
  - 화면: 프로필 왼쪽 등급 블럭 아래에 "활동 배지" 블럭을 둡니다. 배지마다 아이콘·이름·단계(Ⅰ·Ⅱ·Ⅲ)를 보여 주고, 마우스를 올리면 조건을 보여 줍니다. 마이페이지는 못 딴 배지도 흐리게 보여 주고 다음 단계까지의 진행(`count / nextGoal`)을 표시합니다.
- `permissions`: 관리자가 준 추가 권한. 지금은 `content_manage`(게시물·댓글 관리)만 있습니다. 없으면 `[]`
- `sanctions`: 지금 걸려 있는 내 제재(이용 정지·글쓰기·댓글 제한). 프론트엔드는 이 값으로 작성 버튼을 막고 해제일을 안내합니다. `until`이 `null`이면 영구
  - 같은 종류가 여러 건이면 가장 늦게 풀리는 제재 하나만 보냅니다(영구 우선). 기간이 지난 제재는 빠집니다. ([1.2](#12-인증))
- `questionCount`, `answerCount`, `postCount`: 숨김 처리된 글을 뺀 개수. `answerCount`는 숨김 처리된 질문에 달린 답변도 뺍니다. ([`GET /api/answers`](#get-apianswers) 목록과 같은 기준)
- `points`, `level`, `tier`, `currentLevelPoints`, `nextLevelPoints`: 포인트와 레벨·등급 ([11. 포인트 / 등급](#11-포인트--등급))
  - `currentLevelPoints`: 지금 레벨이 시작하는 포인트, `nextLevelPoints`: 다음 레벨이 시작하는 포인트. 화면의 진행 막대는 `(points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)`로 그립니다. Lv79이면 `nextLevelPoints`는 `null`입니다.
  - 관리자는 포인트·등급 대상이 아니라 `points`는 `0`, 나머지는 `null`입니다.
- **하루 첫 접속 포인트**: 이 API를 그날(한국 날짜) 처음 부르면 포인트 1을 지급하고, 지급한 값으로 응답합니다. ([11.1](#111-포인트-지급--차감-규칙))
  - `visitReward`: **이번 요청에서** 받은 하루 첫 접속 포인트(`1`). 이미 받았거나 관리자면 `null`. 프론트엔드는 값이 있으면 보상 모달을 띄웁니다. `PATCH /api/users/me` 응답에서는 항상 `null`입니다.
- 화면의 매너온도, 응답률은 이번 범위에서 제외합니다.

### PATCH `/api/users/me`

마이페이지 수정(`/mypage/edit`).

**Request**

```json
{ "bio": "<p>새 <strong>소개글</strong></p>", "mainGameTagIds": [3, 5] }
```

| 필드 | 규칙 |
| --- | --- |
| `bio` | HTML, 순수 글자 0~200자, 저장 HTML 최대 1,000자 ([1.9](#19-본문--url-규칙)) |
| `mainGameTagIds` | 선택. 주력 게임 태그 id 배열, 최대 5개, 같은 id 중복 불가. 보낸 순서대로 표시. `[]`이면 모두 뺌. 보내지 않으면 지금 주력 게임을 그대로 둠 (REQ-MYPAGE-UPDATE-005) |

- 주력 게임은 보낸 목록으로 통째로 바꿉니다. 사용 중(`active`)인 태그만 고를 수 있고, 없는·차단·병합된 태그가 있으면 `400 MAIN_GAME_TAG_INVALID`이며 메시지는 `"사용할 수 없는 태그가 있습니다. 주력 게임을 다시 골라 주세요."`입니다. 새 태그는 만들지 않습니다.
- 화면(`/mypage/edit`)은 소개글 아래에 태그 자동완성([`GET /api/tags`](#get-apitags)`?keyword=`)으로 고르는 칸과 고른 태그 칩(✕로 빼기)을 두고, "수정 완료"를 누를 때 소개글과 함께 보냅니다.

**Response** `200`: `GET /api/users/me`와 같은 형식

**Errors**: `400 VALIDATION_ERROR`, `400 MAIN_GAME_TAG_INVALID`, `403 USER_SUSPENDED`

- 화면에서 저장하지 않은 변경(새로 고른 사진, 사진 삭제, 소개글 수정)이 있을 때 닫기(X)·"비밀번호 변경"·"회원탈퇴"를 누르면, 이동하기 전에 확인 창을 띄웁니다. 제목 "수정을 그만두시겠습니까?", 설명 "저장하지 않은 변경 사항은 사라집니다.", 버튼 "계속 수정" / "나가기"입니다. 새로고침·탭 닫기는 브라우저 기본 경고를 띄웁니다. 헤더 메뉴 이동과 브라우저 뒤로 가기는 막지 않습니다.

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

### DELETE `/api/users/me/profile-image`

마이페이지 수정(`/mypage/edit`)에서 등록된 프로필 사진을 지워 비웁니다.

**Response** `204`

- `users.profile_image_url`을 `NULL`로 비우고, 저장소의 사진 파일은 지웁니다. ([1.7 삭제 정책](#17-삭제-정책-soft-delete))
- 등록된 사진이 없어도 그대로 `204`입니다.
- 업로드와 같이 이용 정지 중이면 `403 USER_SUSPENDED`입니다. ([1.2](#12-인증))
- 화면에서는 사진 영역의 "사진 삭제" 버튼으로 미리보기만 비우고, **수정완료**를 누를 때 이 API를 호출합니다. 수정을 취소하면 사진은 그대로 남습니다.

### PATCH `/api/users/me/password`

로그인 상태에서 비밀번호 변경.

**Request**

```json
{ "currentPassword": "gamer!2580", "newPassword": "Legend!4729" }
```

**Response** `204`

**Errors**: `400 VALIDATION_ERROR` (새 비밀번호가 [1.8](#18-회원-입력값-규칙) 규칙 위반), `400 PASSWORD_MISMATCH` (현재 비밀번호 불일치), `400 PASSWORD_SAME_AS_CURRENT` (새 비밀번호가 현재 비밀번호와 같음), `429 TOO_MANY_ATTEMPTS` ([1.11](#111-시도-횟수-제한))

- 현재 비밀번호를 먼저 확인합니다. 현재 비밀번호가 맞고 새 비밀번호가 그것과 **같으면** `400 PASSWORD_SAME_AS_CURRENT`입니다. 메시지: `"새 비밀번호가 현재 비밀번호와 같습니다. 다른 비밀번호를 입력해주세요."`
  - 비교는 입력한 그대로(앞뒤 공백 포함, 대소문자 구분) 합니다.
  - 프론트엔드도 제출 전에 같은 문구로 먼저 검사하고, 새 비밀번호 입력란 아래에 보여 줍니다.
  - 비밀번호 찾기의 재설정([`POST /api/auth/password-reset`](#post-apiauthpassword-reset))에는 적용하지 않습니다. 비밀번호를 잊은 경우라 예전 비밀번호로 다시 정해도 됩니다.
- 화면(`/change-password`)은 로그인 상태에서 **현재 비밀번호 1번 + 새 비밀번호 2번**을 입력받습니다. (REQ-PASSUPDATE-002)
- 비밀번호 찾기에서 넘어온 경우에는 같은 화면이지만 현재 비밀번호 입력란 없이 [`POST /api/auth/password-reset`](#post-apiauthpassword-reset)을 씁니다.
- 변경에 성공하면 프론트엔드는 토큰을 지우고 로그인 화면으로 이동합니다.
- 변경 전에 발급된 토큰은 모두 무효가 되어, 다른 기기에 남은 로그인도 해제됩니다. ([1.2](#12-인증))

### DELETE `/api/users/me`

회원 탈퇴(`/withdraw`).

**Request**

```json
{ "agreed": true, "password": "gamer!2580" }
```

| 필드 | 규칙 |
| --- | --- |
| `agreed` | 필수, `true` (탈퇴 안내 동의) |
| `password` | 필수, 현재 비밀번호. 입력한 그대로 비교합니다 (앞뒤 공백을 지우지 않음) |

- 되돌릴 수 없는 작업이라 **현재 비밀번호를 다시 확인**합니다. 로그인한 채 자리를 비운 사이 다른 사람이 탈퇴시키는 것을 막기 위해서입니다.
- 비밀번호가 틀리면 `400 PASSWORD_MISMATCH`이고 메시지는 `"비밀번호가 일치하지 않습니다."`입니다.
- 화면은 동의 체크 아래, 탈퇴 버튼 위에 비밀번호 입력란(라벨 "본인 확인")을 둡니다. 버튼은 지금처럼 동의 체크만 하면 켜지고, 비밀번호가 비어 있으면 요청하지 않고 입력란 아래에 "탈퇴하려면 비밀번호를 입력해주세요."를 보여 줍니다. 틀린 비밀번호 안내도 입력란 아래에 보여 줍니다.

**Response** `204`

- 회원 행은 지우지 않고 `status`를 `withdrawn`으로 바꾸고, **개인정보를 비식별 처리**합니다. ([1.7 삭제 정책](#17-삭제-정책-soft-delete))
  - `username`, `email`, `nickname`, `name`, 비밀번호 해시, `profileImageUrl`, `bio`를 `NULL`로 비웁니다. 프로필 사진 파일은 저장소에서 지웁니다.
  - 행의 `id`, `status`, 가입일·탈퇴일(`withdrawnAt`), 작성글·추천·신고·제재 이력과의 연결은 남깁니다.
  - 아이디·이메일·닉네임을 비우므로 **같은 값으로 다시 가입할 수 있습니다.** (`NULL`은 unique 제약에 걸리지 않음)
- 탈퇴한 회원은 로그인할 수 없고(`401 INVALID_CREDENTIALS`), 공개 프로필은 `404`입니다.
- 작성한 질문·답변·게시글·댓글은 남기고 작성자를 `탈퇴한 회원`으로 표시합니다.

**Errors**: `400 VALIDATION_ERROR` (`agreed`가 `true`가 아니거나 `password`가 없음), `400 PASSWORD_MISMATCH` (비밀번호 불일치), `429 TOO_MANY_ATTEMPTS` ([1.11](#111-시도-횟수-제한))

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
    "mainGames": [{ "tagId": 3, "name": "리그오브레전드", "answerCount": 23, "acceptedCount": 9 }],
    "badges": [
      { "code": "accepted", "level": 2 },
      { "code": "answers", "level": 2 }
    ],
    "points": 948,
    "level": 34,
    "tier": "gold",
    "createdAt": "2022-03-02T00:00:00.000Z"
  }
}
```

| 항목 | 내 프로필 (`/me`) | 공개 프로필 (`/:userId`) |
| --- | --- | --- |
| `id`, `nickname`, `profileImageUrl`, `bio`, `questionCount`, `answerCount`, `postCount`, `interestTags`, `mainGames`, `points`, `level`, `tier`, `createdAt` | O | O |
| `badges` | 6개 모두 (`code`, `level`, `count`, `nextGoal`) | 딴 배지만 (`code`, `level`). 진행·일수는 보내지 않음 |
| `currentLevelPoints`, `nextLevelPoints` | O | X |
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
| 선택 | GET | `/api/questions/stats` | 질문 목록 상단 커뮤니티 통계 | 없음 | #127 |

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

- 목록 화면의 태그 칸에는 첫 태그(`tags[0]`)를 줄이지 않고 표시하고, 나머지는 `+N`으로 접습니다. 태그 칸에 마우스를 올리면(터치·키보드는 `+N`을 누르면) 전체 태그를 플로팅 창으로 보여 줍니다. 태그를 누르면 태그 상세로 이동합니다.
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
| `title` | 필수, 앞뒤 공백을 지운 뒤 1~100자 (지운 값으로 저장) |
| `body` | 필수, 공백 제외 15자 이상, [1.9](#19-본문--url-규칙) 본문 규칙 (글자 최대 10,000자, 저장 최대 100,000자) |
| `tags` | 필수, 1~5개, 중복 제거, 앞의 `#` 제거. [5.1](#51-태그-이름-규칙)대로 정규화한 뒤 중복을 빼고 개수를 셉니다. 없거나 빈 배열이면 `400 TAG_REQUIRED`, 5개를 넘으면 `400 TAG_LIMIT_EXCEEDED` |

- 태그는 [5.1 태그 이름 규칙](#51-태그-이름-규칙)을 따르고, 없는 태그는 새로 만듭니다.
- 첨부파일 목록은 없습니다. 사진은 에디터 이미지, 영상은 영상 주소로 본문에 넣습니다([1.9](#19-본문--url-규칙)).
- 임시저장은 프론트엔드(localStorage)에서 처리하고 서버 API는 두지 않습니다.

**Response** `201`: `GET /api/questions/:questionId`와 같은 형식

**Errors**: `400 VALIDATION_ERROR`, `400 TAG_REQUIRED`, `400 TAG_LIMIT_EXCEEDED`, `400 TAG_BLOCKED`, `403 WRITE_BANNED`

### GET `/api/questions/:questionId`

질문 상세(`/qna/questions/:id`). 조회수를 1 올립니다. 단, 같은 회원(비로그인은 IP)이 24시간 안에 다시 조회하면 올리지 않습니다. 조회 기록은 DB 테이블 `view_histories`에 둡니다([1.10](#110-대소문자--중복-검사--저장-방식)).

- 응답의 `viewCount`는 이번 조회를 반영한 값입니다.
- 로그인 회원은 회원 기준으로 셉니다. 같은 회원이 다른 기기(IP)에서 봐도 24시간 안이면 올리지 않습니다.
- 숨김·삭제·없는 질문(`404`)은 조회 기록을 남기지 않습니다.

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

- 규칙은 등록과 같습니다. `editReason`은 선택, 최대 200자. 앞뒤 공백을 지우고, 보내지 않았거나 빈 값이면 `null`로 저장합니다.
- `title`, `body`, `tags` 중 하나 이상을 보내야 합니다. `editReason`만 보내면 `400 VALIDATION_ERROR`입니다.
- 수정할 때마다 **수정 이력**(`question_edit_histories`)에 수정 시각, 수정한 회원, `editReason`을 한 줄 남깁니다. `editReason`은 질문 행이 아니라 이 이력에 저장합니다.
- 본문에서 빠진 에디터 이미지는 연결을 끊습니다([6장](#6-첨부파일)).
- 수정되면 `isEdited`가 `true`가 되고 `editedAt`이 현재 시각으로 바뀝니다. `createdAt`은 그대로입니다.

**Response** `200`: `GET /api/questions/:questionId`와 같은 형식

- 수정하면 그 질문에 답변한 회원들에게 `question_edited` 알림을 보냅니다. 수정한 본인은 제외합니다. ([12. 알림](#12-알림))

**Errors**: `400 VALIDATION_ERROR`, `400 TAG_BLOCKED`, `403 FORBIDDEN` (작성자가 아니고 `content_manage` 권한도 없으며 `ADMIN`도 아님), `404 QUESTION_NOT_FOUND`, `403 WRITE_BANNED`

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
- `editor`는 작성자, 관리 권한(`content_manage`)을 가진 회원, 또는 `ADMIN`입니다.
- 수정 전 본문은 저장하지 않습니다. (이력에는 시각·수정자·사유만)

**Errors**: `404 QUESTION_NOT_FOUND`

### GET `/api/questions/:questionId/related`

질문 상세 사이드바 "관련된 유사 질문". 태그가 많이 겹치는 순서로 최대 5개.

- 태그가 **하나 이상 겹치는** 질문만 나옵니다. 겹치는 질문이 없거나 태그가 없으면 빈 배열입니다.
- 겹친 태그 수가 같으면 최신순(`createdAt` 내림차순)입니다.
- 자기 자신, 숨김·삭제된 질문, 연결이 끊긴 태그(질문 수정으로 뺀 태그, 차단·병합된 태그)는 빼고 셉니다.
- `answerCount`·`isAccepted`는 질문 목록과 같은 기준입니다.

**Response** `200`

```json
{
  "success": true,
  "data": [
    { "id": 4018, "title": "1.20.2 사서 주민 수선 인챈트 거래 풀 잠금 해제 시간", "answerCount": 4, "isAccepted": true, "createdAt": "2026-10-29T00:00:00.000Z" }
  ]
}
```

**Errors**: `404 QUESTION_NOT_FOUND` (숨김·삭제된 질문 포함)

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

| 필드 | 계산 기준 |
| --- | --- |
| `todayAcceptedCount` | **한국 시간 오늘 0시 이후** 채택된 답변 수 |
| `acceptRate` | 전체 질문 중 채택된 답변이 있는 질문의 비율(%). 소수 첫째 자리까지 반올림, 질문이 없으면 `0` |
| `averageFirstAnswerMinutes` | **최근 7일** 동안 올라온 질문 중 답변이 달린 질문의 "질문 작성 → 첫 답변" 평균 시간(분, 반올림). 해당 질문이 없으면 `null` |
| `trendingTag` | **최근 7일** 동안 올라온 질문에 가장 많이 쓰인 태그와 그 질문 수. 같으면 이름순, 없으면 `null` |
| `unansweredCount` | 지금 답변이 하나도 없는 질문 수 |

- 숨김·삭제된 질문과 답변은 모두 세지 않습니다. (숨긴 답변만 있는 질문은 미답변, 숨긴 첫 답변은 첫 답변으로 보지 않음)
- `trendingTag`는 차단·병합된 태그와 연결이 끊긴 태그를 세지 않습니다.
- "최근 7일"은 요청 시각부터 7×24시간 전까지입니다.
- 인증 없이 호출합니다. 경로가 `/api/questions/:questionId`와 겹치지 않도록 서버는 `/stats`를 먼저 처리합니다.
- "전주 대비" 같은 비교 값은 후순위입니다([13.1](#131-범위-제외--후순위-항목) D-18).

---

## 4. 답변

| 우선 | Method | Path | 설명 | 인증 | WBS |
| --- | --- | --- | --- | --- | --- |
| 필수 | GET | `/api/questions/:questionId/answers` | 답변 목록 | 선택 | #74 |
| 필수 | GET | `/api/answers` | 회원이 쓴 답변 목록 (프로필 작성 목록) | 없음 | #126 |
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
- `votes`는 추천 수(취소한 추천 제외)가 같으면 최신순입니다.
- 숨김·삭제된 답변은 빠집니다.
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
- 숨김·삭제된 답변과, 숨김·삭제된 질문에 달린 답변은 빠집니다.
- `size`는 최대 `100`입니다. 없는 회원이나 답변이 없는 회원은 빈 목록(`200`)입니다.

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

- `preview`: 답변 본문 앞 60자. 태그를 뺀 글자를 쓰고, 문단·줄바꿈·목록 사이는 공백으로 띄우고 연속 공백은 하나로 줄입니다. 60자를 넘으면 자르기만 하고 말줄임표(`...`)는 프론트엔드에서 붙입니다.
- `voteCount`는 취소한 추천을 뺀 수입니다.

**Errors**: `400 VALIDATION_ERROR` (`authorId` 없음·형식 오류, `page`·`size` 형식 오류)

### POST `/api/questions/:questionId/answers`

**Request**

```json
{ "body": "<p>답변 내용 (HTML)</p>" }
```

| 필드 | 규칙 |
| --- | --- |
| `body` | 필수, [1.9](#19-본문--url-규칙) 본문 규칙 (글자 1~10,000자, 저장 최대 100,000자) |

- 글자 수는 공백을 뺀 순수 글자로 셉니다. 공백만 있거나 이미지만 있는 본문은 `400 VALIDATION_ERROR`입니다.
- 질문 작성자도 자기 질문에 답변할 수 있습니다. (본인 답변은 채택할 수 없습니다)
- 숨김·삭제된 질문에는 등록할 수 없습니다(`404 QUESTION_NOT_FOUND`).
- 등록하면 질문 작성자에게 `answer_created` 알림을 보냅니다. 내 질문에 내가 단 답변은 알리지 않습니다. ([12. 알림](#12-알림))

**Response** `201`: `Answer`

**Errors**: `400 VALIDATION_ERROR`, `404 QUESTION_NOT_FOUND`, `403 WRITE_BANNED`

### GET `/api/answers/:answerId`

답변 수정 화면(`/qna/questions/:id/answers/:answerId/edit`). 화면 상단의 원본 질문 요약은 `GET /api/questions/:questionId`로 조회합니다.

- 숨김·삭제된 답변과, 숨김·삭제된 질문에 달린 답변은 `404 ANSWER_NOT_FOUND`입니다. (답변 수정·삭제·수정 이력도 같음)

**Response** `200`: `Answer`

**Errors**: `404 ANSWER_NOT_FOUND`

### PATCH `/api/answers/:answerId`

**Request**

```json
{ "body": "수정된 답변", "editReason": "독서대 재설치 팁 보강" }
```

- `body`는 필수입니다. 답변은 본문만 수정할 수 있습니다.
- `editReason`은 선택, 최대 200자. 앞뒤 공백을 지우고, 보내지 않았거나 빈 값이면 `null`로 저장합니다.
- 권한·상태는 `404`(답변 없음) → `403`(작성자 아님) → `409`(채택됨) 순서로 확인합니다. (삭제도 같음)
- 수정할 때마다 **수정 이력**(`answer_edit_histories`)에 수정 시각, 수정한 회원, `editReason`을 한 줄 남깁니다.
- **채택된 답변은 수정할 수 없습니다.** (`409 ANSWER_ALREADY_ACCEPTED`, REQ-QNA-012)
- 수정하면 `editedAt`이 현재 시각으로 바뀌고 `isEdited`가 `true`가 됩니다. `createdAt`은 그대로입니다.

**Response** `200`: `Answer`

- 수정하면 그 답변을 추천한 회원들과 질문 작성자에게 `answer_edited` 알림을 보냅니다. 수정한 본인은 제외합니다. ([12. 알림](#12-알림))

**Errors**: `400 VALIDATION_ERROR`, `403 FORBIDDEN`, `404 ANSWER_NOT_FOUND`, `403 WRITE_BANNED`, `409 ANSWER_ALREADY_ACCEPTED` (채택된 답변은 수정 불가)

### DELETE `/api/answers/:answerId`

답변을 삭제 상태(`deleted`)로 바꿉니다. 질문의 답변 수에서 빠집니다.

- 본문 에디터 이미지 연결은 끊고([6장](#6-첨부파일)), 추천 기록은 그대로 둡니다.
- 글쓰기 제한 중에도 삭제할 수 있고, 이용 정지 중에는 삭제할 수 없습니다([1.2](#12-인증)).

**Response** `204`

**Errors**: `403 FORBIDDEN`, `404 ANSWER_NOT_FOUND`, `409 ANSWER_ALREADY_ACCEPTED` (채택된 답변은 삭제 불가)

### GET `/api/answers/:answerId/edit-histories`

답변 수정 이력. 답변의 수정일시를 누르면 뜨는 모달에서 씁니다. 응답 형식은 [질문 수정 이력](#get-apiquestionsquestionidedit-histories)과 같습니다.

**Errors**: `404 ANSWER_NOT_FOUND`

### POST `/api/answers/:answerId/accept`

질문 작성자만 호출할 수 있고, 질문당 1개만 채택할 수 있습니다. 채택 여부는 답변의 상태값(`is_accepted`)으로 저장하고, 질문당 1개는 앱에서 검사합니다([1.10](#110-대소문자--중복-검사--저장-방식)). 채택은 취소할 수 없습니다. (관리자가 채택된 답변을 숨기거나 삭제하면 해제됩니다, [10.3](#103-질문답변-관리)) 추천 수 등으로 자동 채택하지 않고 **질문자가 직접 채택한 경우만** 채택으로 봅니다. (REQ-QNA-005)

- 본인이 작성한 답변은 채택할 수 없습니다. 화면에서는 버튼이 노출되지 않지만(`canAccept`), 서버도 요청을 거절합니다.
- 확인 순서: `404`(답변 없음) → `403`(질문 작성자 아님) → `400`(본인 답변) → `409`(이미 채택된 답변 있음). 이미 채택된 그 답변을 다시 채택해도 `409 QUESTION_ALREADY_ACCEPTED`입니다.
- 숨김·삭제된 답변과, 숨김·삭제된 질문에 달린 답변은 `404 ANSWER_NOT_FOUND`입니다.
- 채택된 답변이 관리자 숨김·삭제로 풀리면([10.3](#103-질문답변-관리)) 다른 답변을 다시 채택할 수 있습니다.
- 이용 정지 중에는 채택할 수 없고, 글쓰기 제한 중에는 채택할 수 있습니다([1.2](#12-인증)).
- 동시에 채택 요청이 와도 질문당 1개가 되도록, 답변 행과 질문 행을 잠근 뒤 같은 질문에 채택된 답변이 있는지 확인합니다.
- 채택하면 답변 작성자에게 `answer_accepted` 알림을 보냅니다. ([12. 알림](#12-알림))

**Response** `200`: `Answer` (`isAccepted: true`)

**Errors**: `403 FORBIDDEN` (질문 작성자 아님), `400 CANNOT_ACCEPT_OWN_ANSWER`, `404 ANSWER_NOT_FOUND`, `409 QUESTION_ALREADY_ACCEPTED`

### POST `/api/answers/:answerId/votes`

**Response** `200`

```json
{ "success": true, "data": { "answerId": 8941, "voteCount": 23, "isVoted": true } }
```

**Errors**: `400 CANNOT_VOTE_OWN_ANSWER`, `404 ANSWER_NOT_FOUND`, `409 ALREADY_VOTED`

- 확인 순서: `404`(답변 없음) → `400`(본인 답변) → `409`(이미 추천). 숨김·삭제된 답변과 숨김·삭제된 질문에 달린 답변은 `404 ANSWER_NOT_FOUND`입니다.
- 채택된 답변도 추천할 수 있습니다.
- 회원당 답변 1행(unique)이라 같은 추천 요청이 동시에 와도 한 번만 추천되고, 나머지는 `409 ALREADY_VOTED`입니다.
- 이용 정지 중에는 추천·추천 취소를 할 수 없고, 글쓰기 제한 중에는 할 수 있습니다([1.2](#12-인증)).

### DELETE `/api/answers/:answerId/votes`

추천 취소. 추천 행을 지우지 않고 `status`를 `canceled`로 바꿉니다. 다시 추천하면 같은 행을 `active`로 되돌립니다. 화면의 추천 버튼이 토글이므로, 취소 후 상태를 함께 돌려주기 위해 `204` 대신 `200`으로 응답합니다.

**Response** `200`

```json
{ "success": true, "data": { "answerId": 8941, "voteCount": 22, "isVoted": false } }
```

**Errors**: `404 ANSWER_NOT_FOUND`, `404 VOTE_NOT_FOUND`

- 추천하지 않았거나 이미 취소한 답변, 본인 답변은 `404 VOTE_NOT_FOUND`입니다.

---

## 5. 태그

| 우선 | Method | Path | 설명 | 인증 | WBS |
| --- | --- | --- | --- | --- | --- |
| 필수 | GET | `/api/tags` | 태그 목록 · 자동완성 · 인기 태그 (REQ-TAG-001) | 없음 | #79 |
| 선택 | GET | `/api/tags/:tagName` | 태그 상세 (REQ-TAG-002) | 선택 | - |
| 선택 | PATCH | `/api/tags/:tagName` | 태그 설명 수정 (REQ-TAG-003) | 필수 (Diamond 이상 회원 또는 ADMIN) | - |

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

- `keyword`는 [5.1](#51-태그-이름-규칙)대로 정규화(앞의 `#` 제거, 영문 소문자)한 뒤 태그 이름의 **앞부분**과 비교합니다. 중간 일치는 찾지 않고, `%`·`_`는 글자 그대로 찾습니다. 정규화한 값이 비어 있으면 조건 없이 전체입니다.
- `popular`는 질문 수가 같으면 이름순입니다. 질문이 없는 태그(`questionCount: 0`)도 뒤쪽에 나옵니다.
- `size`는 최대 `100`입니다. 페이지네이션 없이 앞에서부터 `size`개만 반환하므로 `meta`가 없습니다.
- 차단(`blocked`)·병합(`merged`)된 태그는 나오지 않습니다.
- `questionCount`: 연결이 살아 있고(질문 수정으로 빼지 않은) 숨김·삭제되지 않은 질문 수입니다.
- `description`: 태그 설명. 없으면 `null`

사용 예

- 태그 목록 화면(`/qna/tags`, 상단 메뉴 "태그"): `GET /api/tags?sort=popular&size=100`, 이름 검색은 `keyword`
- 질문 목록 "인기 게임 태그": `GET /api/tags?sort=popular&size=8`
- 질문 작성 태그 자동완성: `GET /api/tags?keyword=마인`
- 추천 태그: `GET /api/tags?sort=popular&size=5`

**Response** `200`

```json
{
  "success": true,
  "data": [{ "id": 3, "name": "마인크래프트", "description": "마인크래프트 자바·베드락 에디션", "questionCount": 1203 }]
}
```

### GET `/api/tags/:tagName`

태그 상세 화면(`/qna/tags/:tagName`). 질문의 `tags`가 이름 목록이라 **이름으로** 찾습니다. (REQ-TAG-002)

- `tagName`은 [5.1](#51-태그-이름-규칙)대로 정규화(앞의 `#` 제거, 영문 소문자)한 뒤 찾습니다. 규칙에 맞지 않으면 `400 VALIDATION_ERROR`입니다.
- 병합된(`merged`) 이름이면 **병합 대상 태그**의 상세를 줍니다. (예: `lol` → `리그오브레전드`) 화면은 응답의 `name`으로 주소를 바꿉니다.
- 차단(`blocked`)됐거나 없는 태그는 `404 TAG_NOT_FOUND`입니다.
- 그 태그의 질문 목록은 [`GET /api/questions?tag=<name>`](#get-apiquestions)을 씁니다.

**Response** `200`

```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "리그오브레전드",
    "description": "리그 오브 레전드 공략·빌드·패치 질문",
    "questionCount": 1203,
    "aliases": ["lol"],
    "canEdit": false,
    "createdAt": "2026-08-01T00:00:00.000Z"
  }
}
```

- `description`: 없으면 `null`
- `questionCount`: [`GET /api/tags`](#get-apitags)와 같은 기준
- `aliases`: 이 태그로 병합된 이름 (이름순). 없으면 `[]`
- `canEdit`: 로그인한 회원이 설명을 수정할 수 있는지 ([`PATCH`](#patch-apitagstagname)). 비회원은 `false`. 화면은 이 값으로 수정 버튼을 보여 줍니다. 제재는 수정할 때 확인합니다.

**Errors**: `400 VALIDATION_ERROR`, `404 TAG_NOT_FOUND`

### PATCH `/api/tags/:tagName`

태그 상세 화면에서 태그 설명을 수정합니다. (REQ-TAG-003)

**Request**

```json
{ "description": "리그 오브 레전드 공략·빌드·패치 질문" }
```

| 필드 | 규칙 |
| --- | --- |
| `description` | 필수(키). 문자열, 앞뒤 공백 제거 후 최대 100자. 빈 값이나 `null`이면 설명을 지웁니다 |

- **수정할 수 있는 회원**: `ADMIN`, 또는 레벨이 **Lv60(Diamond) 이상**인 회원 (Diamond·Master·Grandmaster·Challenger, [11.2](#112-레벨--등급)). 그 밖에는 `403 FORBIDDEN`
- 글쓰기 제한·이용 정지 중이면 `403 WRITE_BANNED` / `403 USER_SUSPENDED` ([1.2](#12-인증))
- 이름은 [GET](#get-apitagstagname)과 같이 찾습니다. 병합된 이름이면 병합 대상 태그의 설명을 바꿉니다. 차단됐거나 없으면 `404 TAG_NOT_FOUND`
- 이름은 바꿀 수 없습니다. 이름 수정·차단·병합은 관리자 태그 관리([10.5](#105-태그-관리))에서 합니다.
- 바뀌면 활동 로그에 `UPDATE_TAG`로 남깁니다(처리자 = 수정한 회원). 관리자가 회원의 설명 수정을 추적할 수 있도록 하기 위해서입니다. 보낸 값이 지금과 같으면 바꾸지 않고 로그도 남기지 않습니다.

**Response** `200`: [GET](#get-apitagstagname)과 같은 태그 상세

**Errors**: `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN` (레벨 부족), `403 WRITE_BANNED`, `403 USER_SUSPENDED`, `404 TAG_NOT_FOUND`

---

## 6. 첨부파일

| 우선 | Method | Path | 설명 | 인증 | WBS |
| --- | --- | --- | --- | --- | --- |
| 필수 | POST | `/api/attachments` | 파일 업로드 (본문 에디터 이미지, 신고 증빙) | 필수 | #123 |
| 필수 | DELETE | `/api/attachments/:attachmentId` | 아직 글에 연결되지 않은 파일 삭제 | 필수 (업로드한 회원) | #123 |

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
- 정리 작업은 서버 안에서 **서버가 뜰 때 한 번, 이후 1시간마다** 돕니다. 그래서 파일이 정리되는 시점은 조건이 된 뒤 최대 1시간 늦을 수 있습니다. 행은 `deleted`로 남기고 저장소의 실제 파일을 지우며, 파일 삭제가 실패해도 행은 `deleted`로 두고 기록만 남깁니다([1.7](#17-삭제-정책-soft-delete)).
- 정리하는 순간 같은 파일을 글·신고에 연결하는 요청이 오면 먼저 처리된 쪽을 따릅니다. 먼저 연결됐으면 정리하지 않고, 먼저 정리됐으면 연결하지 않습니다(그 글 본문에 남은 이미지는 깨져 보이고, 신고는 `400 ATTACHMENT_INVALID`).

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

- 파일 형식은 파일 이름이나 `Content-Type`이 아니라 **파일 내용(앞부분 시그니처)**으로 판단합니다. 이름만 `.png`인 다른 파일은 `400 FILE_TYPE_NOT_ALLOWED`이고, 저장 확장자와 `mime_type`도 판단한 형식으로 정합니다. (예: `photo.png`로 올린 JPG → `.jpg`, `image/jpeg`)
- 원본 파일명(`name`)은 [1.6](#16-공통-객체) 규칙(최대 15자)을 따릅니다. 경로가 붙어 오면 파일 이름만 남기고, 한글 파일명도 그대로 저장합니다.
- 저장 위치: 지금은 서버 디스크에 저장하고 `<UPLOAD_PUBLIC_BASE_URL>/<purpose>/<연>/<월>/<uuid>.<확장자>` URL로 내려 줍니다(로컬 기본값 `http://localhost:3000/uploads/...`). 파일 이름은 추측할 수 없는 uuid이고, URL을 아는 사람은 로그인 없이 열 수 있습니다. 저장소를 S3 등으로 바꿔도 API와 URL 저장 방식은 같습니다.
- 이용 정지 중에는 올릴 수 없고, 글쓰기 제한 중에는 올릴 수 있습니다(신고 증빙). ([1.2](#12-인증))

**Response** `201`: `Attachment`

**Errors**: `400 FILE_TYPE_NOT_ALLOWED`, `400 FILE_TOO_LARGE`, `400 VALIDATION_ERROR` (파일 없음, 2개 이상, `file`이 아닌 필드 이름, `purpose` 오류), `403 USER_SUSPENDED`

### DELETE `/api/attachments/:attachmentId`

첨부파일 행은 삭제 상태(`deleted`)로 남기고, **저장소의 실제 파일은 지웁니다.** 이후 그 URL은 열리지 않습니다.

**Response** `204`

**Errors**: `403 FORBIDDEN`, `404 ATTACHMENT_NOT_FOUND`, `409 ATTACHMENT_IN_USE` (이미 글에 연결됨 → 글 수정으로 빼야 함)

- 에디터 이미지는 이 API로 지우지 않습니다(`403 FORBIDDEN`). 본문에서 이미지를 지우고 글을 저장하면 그 글과의 연결이 끊기고, 연결된 글이 하나도 남지 않으면 정리 작업이 지웁니다.
- 지울 수 있는 것은 **업로드한 회원 본인의, 아직 신고에 연결되지 않은 신고 증빙**입니다. 확인 순서: `404`(없거나 이미 삭제) → `403`(업로드한 회원 아님, 에디터 이미지) → `409`(연결됨)
- 이용 정지 중에는 지울 수 없습니다.

---

## 7. 자유게시판

| 우선 | Method | Path | 설명 | 인증 | WBS |
| --- | --- | --- | --- | --- | --- |
| 필수 | GET | `/api/posts` | 게시글 목록 (검색·정렬·페이징) | 선택 | #65 #68 #69 #70 #169 #170 |
| 선택 | GET | `/api/posts/popular` | 최근 7일 인기 게시글 5개 | 없음 | #169 |
| 필수 | POST | `/api/posts` | 게시글 작성 | 필수 | #64 |
| 필수 | GET | `/api/posts/:postId` | 게시글 상세 (조회수 증가, 이전글·다음글) | 선택 | #65 #183 |
| 필수 | PATCH | `/api/posts/:postId` | 게시글 수정 | 필수 (작성자만) | #66 |
| 필수 | DELETE | `/api/posts/:postId` | 게시글 삭제 | 필수 (작성자 또는 관리 권한) | #66 |
| 필수 | GET | `/api/posts/:postId/comments` | 댓글 목록 | 선택 | #67 |
| 필수 | POST | `/api/posts/:postId/comments` | 댓글 작성 | 필수 | #67 |
| 선택 | PATCH | `/api/comments/:commentId` | 댓글 수정 | 필수 (작성자만) | #182 |
| 필수 | DELETE | `/api/comments/:commentId` | 댓글 삭제 | 필수 (작성자 또는 관리 권한) | #67 |

내 게시글 목록(`/board/my-posts`)과 목록의 "내 게시글" 필터는 `GET /api/posts?authorId=<내 id>`를 사용합니다.

### GET `/api/posts`

자유게시판 목록(`/board`).

**Query**

| 이름 | 기본값 | 설명 |
| --- | --- | --- |
| `page` | `1` | |
| `size` | `10` | |
| `sort` | `latest` | `latest`(최신순) / `oldest`(오래된순) / `popular`(인기순) |
| `keyword` | - | 제목 검색 |
| `authorId` | - | 이 회원이 쓴 게시글만 (내 게시글, 프로필 작성 목록과 "전체 보기") |

- `popular`(인기순)는 댓글 수(`commentCount`)가 많은 순, 같으면 조회수(`viewCount`)가 많은 순, 그다음 최신순(`createdAt` 내림차순)입니다. 댓글 수는 숨김·삭제된 댓글을 빼고 셉니다. (REQ-BOARD-013)
- `updatedAt`은 상세와 같이 마지막 수정 시각이고, 수정한 적이 없으면 `createdAt`과 같습니다. 프론트엔드는 이 값이 6개월 넘게 지난 글에 "오래된 글" 배지를 붙입니다. (REQ-BOARD-014)

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
      "createdAt": "2025-07-23T05:32:00.000Z",
      "updatedAt": "2025-07-23T05:32:00.000Z"
    }
  ],
  "meta": { "page": 1, "size": 10, "totalCount": 48 }
}
```

### GET `/api/posts/popular`

자유게시판 목록 위 "인기글 순위". 최근 7일 안에 작성된 게시글 중 인기순으로 최대 5개. (REQ-BOARD-013)

- 순서는 `GET /api/posts`의 `sort=popular`와 같습니다. (댓글 수 → 조회수 → 최신순)
- 최근 7일은 요청 시각 기준으로 `createdAt`이 7일(168시간) 안인 글입니다.
- 숨김·삭제된 게시글은 빠집니다. 해당 글이 없으면 빈 배열입니다.
- `rank`는 1부터 시작하는 순위입니다.
- 라우트는 `/api/posts/:postId`보다 먼저 등록합니다. (`popular`가 `postId`로 잡히지 않게)

**Response** `200`

```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "id": 7,
      "title": "이번 시즌 티어표 정리",
      "author": { "id": 12, "nickname": "호야", "profileImageUrl": null },
      "viewCount": 512,
      "commentCount": 31,
      "createdAt": "2026-11-12T09:00:00.000Z"
    }
  ]
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
    "updatedAt": "2025-07-23T05:32:00.000Z",
    "prevPost": { "id": 2, "title": "이번 주 레이드 후기" },
    "nextPost": null
  }
}
```

- `prevPost`·`nextPost`: 목록 최신순(`latest`) 기준 바로 앞·뒤 글입니다. `prevPost`는 더 최근 글, `nextPost`는 더 오래된 글이고, 없으면 `null`입니다. 숨김·삭제된 글은 건너뜁니다. (REQ-BOARD-017)
- 작성·수정 응답(`POST`·`PATCH`)에는 `prevPost`·`nextPost`가 없습니다.

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
      "isEdited": false,
      "createdAt": "2025-07-23T06:10:00.000Z"
    }
  ],
  "meta": { "page": 1, "size": 20, "totalCount": 3 }
}
```

- `isEdited`: 댓글을 수정한 적이 있으면 `true`. 화면은 "(수정됨)"을 붙입니다. (REQ-BOARD-016)

### POST `/api/posts/:postId/comments`

**Request**

```json
{ "body": "댓글 내용" }
```

- `body`: 필수, 1~500자

**Response** `201`: 댓글 객체 1개

- 등록하면 게시글 작성자에게 `comment_created` 알림을 보냅니다. 내 게시글에 내가 단 댓글은 알리지 않습니다. ([12. 알림](#12-알림))

**Errors**: `400 VALIDATION_ERROR`, `404 POST_NOT_FOUND`, `403 COMMENT_BANNED`

### PATCH `/api/comments/:commentId`

댓글 수정. 작성자만 할 수 있습니다. (REQ-BOARD-016)

**Request**

```json
{ "body": "고친 댓글 내용" }
```

- `body`: 필수, 1~500자 (작성과 같은 규칙)
- 이용 정지·댓글 제한 회원은 수정할 수 없습니다. (1.2)
- 숨김·삭제된 댓글이나, 숨김·삭제된 게시글의 댓글은 `404 COMMENT_NOT_FOUND`입니다.

**Response** `200`: 댓글 객체 1개 (`isEdited: true`)

**Errors**: `400 VALIDATION_ERROR`, `403 FORBIDDEN`(작성자 아님), `403 COMMENT_BANNED`, `404 COMMENT_NOT_FOUND`

### DELETE `/api/comments/:commentId`

댓글을 삭제 상태(`deleted`)로 바꿉니다. 목록과 댓글 수에서 빠집니다.

**Response** `204`

**Errors**: `403 FORBIDDEN`, `404 COMMENT_NOT_FOUND`

---

## 8. 신고

| 우선 | Method | Path | 설명 | 인증 | WBS |
| --- | --- | --- | --- | --- | --- |
| 필수 | POST | `/api/reports` | 신고 등록 (질문/답변/게시글/댓글) | 필수 | #77 #78 |
| 필수 | DELETE | `/api/reports/:reportId` | 신고 접수 취소 | 필수 (신고자) | #124 |
| 선택 | GET | `/api/reports/me` | 내 신고 내역 | 필수 | #125 |

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
| `targetType` | 필수, 위 Enum |
| `targetId` | 필수, 1 이상의 정수(숫자) |
| `reason` | 필수, 위 Enum |
| `detail` | 선택, 최대 1000자. `reason`이 `etc`이면 필수. 앞뒤 공백을 지우고, 빈 값이면 `null`로 저장 (공백만 있으면 `etc`에서 입력하지 않은 것으로 봄) |
| `attachmentIds` | 선택, 최대 3개, `purpose=report_evidence`로 올린 파일. 같은 id는 한 번만 연결하고, 중복을 뺀 개수가 3개를 넘으면 `400 ATTACHMENT_LIMIT_EXCEEDED` |

- 자기 글은 신고할 수 없습니다.
- 숨김·삭제된 대상과, 숨김·삭제된 질문에 달린 답변·숨김·삭제된 게시글에 달린 댓글은 `404 REPORT_TARGET_NOT_FOUND`입니다.
- 증빙 파일은 **신고자가 올린 사용 중인 `report_evidence` 파일이고 다른 신고에 연결되지 않은 것**만 쓸 수 있습니다. 아니면 `400 ATTACHMENT_INVALID`이고 신고도 저장하지 않습니다. 보낸 순서대로 연결합니다([6장](#6-첨부파일)).
- 확인 순서: `400`(입력값) → `404`(대상 없음) → `400 CANNOT_REPORT_OWN_CONTENT` → `409 REPORT_DUPLICATED` → `400 ATTACHMENT_INVALID`
- 이용 정지 중에는 신고할 수 없고, 글쓰기 제한 중에는 신고할 수 있습니다([1.2](#12-인증)).
- 같은 회원이 같은 대상을 `pending` 상태로 두 번 신고할 수 없습니다. 앱에서 등록 전에 검사합니다([1.10](#110-대소문자--중복-검사--저장-방식)).
- 다른 회원들이 같은 대상을 신고하면 관리자 화면에서 `duplicateCount`로 묶어 보여줍니다.
- 신고는 `pending`으로 접수되고, 관리자가 [10.6](#106-신고-관리)에서 확인한 뒤 직접 숨김·제재를 처리합니다. (REQ-QNA-008·009)
- **긴급 신고 임시 숨김**: 긴급 사유(`illegal`, `privacy`)로 대상을 신고한 `pending` 신고의 신고자가 서로 다른 회원 **3명 이상**이 되면, 그 신고를 접수할 때 대상을 바로 숨김(`hidden`)으로 바꿉니다. 관리자가 확인하기 전까지 공개하지 않기 위한 **임시 숨김**입니다.
  - 그 밖의 사유는 신고가 쌓여도 자동으로 숨기지 않습니다.
  - 채택된 답변은 임시 숨김하지 않습니다. 숨기면 채택이 풀리므로 관리자가 직접 처리합니다.
  - 이미 숨김·삭제된 대상은 바꾸지 않습니다.
  - 임시 숨김은 처리한 관리자가 없어 활동 로그에 남기지 않고, 임시 숨김 기록(DB 설계서 4.25 `report_temp_hides`)에만 남깁니다. 관리자가 확정하거나 해제하는 방법은 [10.6](#106-신고-관리)에 있습니다.
  - 신고 응답은 임시 숨김 여부와 관계없이 같습니다.

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

- `queuePosition`: 처리 대기열에서 몇 번째인지. 처리 대기(`pending`) 신고를 접수 순서(`createdAt`, 같으면 `id`)로 세웠을 때의 위치이고, 처리·반려·취소된 신고는 세지 않습니다.
- `receiptNumber`: `REP-<접수일>-<id>`. 접수일은 **한국 시간(KST) 기준** `YYYYMMDD`입니다.

**Errors**: `400 VALIDATION_ERROR`, `400 CANNOT_REPORT_OWN_CONTENT`, `400 ATTACHMENT_INVALID`, `400 ATTACHMENT_LIMIT_EXCEEDED`, `403 USER_SUSPENDED`, `404 REPORT_TARGET_NOT_FOUND`, `409 REPORT_DUPLICATED`

### DELETE `/api/reports/:reportId`

신고 완료 화면의 "접수 취소 (10초)". `pending` 상태이고 접수 후 10초 안에만 취소할 수 있습니다. 신고를 지우지 않고 `status`를 `canceled`로 바꾸며, 관리자 신고 목록과 `duplicateCount`에서 빠집니다.

- 확인 순서: `404`(없음, 이미 취소한 신고) → `403`(신고한 회원 아님) → `409 REPORT_ALREADY_PROCESSED`(처리·반려된 신고) → `409 REPORT_CANCEL_EXPIRED`(접수 후 10초 지남)
- 10초는 서버(DB) 시각 기준입니다. 취소한 신고는 삭제 상태라 다시 취소하면 `404`입니다([1.7](#17-삭제-정책-soft-delete)).
- 신고 증빙 파일의 연결을 끊습니다. 연결이 끊긴 파일은 정리 작업이 지웁니다([6장](#6-첨부파일)).
- 취소한 뒤에는 같은 대상을 다시 신고할 수 있습니다.
- 이용 정지 중에는 취소할 수 없습니다([1.2](#12-인증)).

**Response** `204`

**Errors**: `403 FORBIDDEN`, `403 USER_SUSPENDED`, `404 REPORT_NOT_FOUND`, `409 REPORT_ALREADY_PROCESSED`, `409 REPORT_CANCEL_EXPIRED`

### GET `/api/reports/me`

마이페이지의 "내 신고 내역"(`/mypage#my-reports`). 신고 완료 화면의 "내 신고 내역 보기"로도 들어갑니다. 화면은 접수번호·대상·사유·처리 상태·접수일을 보여 주고, `queuePosition`은 쓰지 않으며 내역에서 접수를 취소하지 않습니다.

**Query**: `page`, `size` (기본 `20`, 최대 `100`)

- 로그인한 회원이 접수한 신고를 최신 접수 순(`createdAt`, 같으면 `id` 내림차순)으로 보여 줍니다.
- 취소한(`canceled`) 신고는 삭제 상태라 빠집니다([1.7](#17-삭제-정책-soft-delete)). 처리 완료·반려된 신고는 포함합니다.
- `queuePosition`은 처리 대기(`pending`) 신고에만 있고, 처리 완료·반려된 신고는 `null`입니다.
- 조회 API라 이용 정지 중에도 볼 수 있습니다([1.2](#12-인증)).

**Response** `200`: `POST /api/reports` 응답 객체의 목록 + `meta` ([1.5](#15-페이지네이션--정렬--검색))

**Errors**: `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`

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
| 필수 | GET | `/api/admin/questions/:questionId` | 질문 관리 상세 (본문 확인) | #58 |
| 필수 | PATCH | `/api/admin/questions/:questionId` | 질문 숨김/복구 | #58 |
| 필수 | DELETE | `/api/admin/questions/:questionId` | 질문 삭제 | #58 |
| 필수 | GET | `/api/admin/answers` | 답변 관리 목록 | #58 |
| 필수 | GET | `/api/admin/answers/:answerId` | 답변 관리 상세 (본문 확인) | #58 |
| 필수 | PATCH | `/api/admin/answers/:answerId` | 답변 숨김/복구 | #58 |
| 필수 | DELETE | `/api/admin/answers/:answerId` | 답변 삭제 | #58 |
| 필수 | GET | `/api/admin/posts` | 게시글 관리 목록 | #58 |
| 필수 | GET | `/api/admin/posts/:postId` | 게시글 관리 상세 (본문 확인) | #58 |
| 필수 | PATCH | `/api/admin/posts/:postId` | 게시글 숨김/복구 | #58 |
| 필수 | DELETE | `/api/admin/posts/:postId` | 게시글 삭제 | #58 |
| 필수 | GET | `/api/admin/comments` | 댓글 관리 목록 | #58 |
| 필수 | GET | `/api/admin/comments/:commentId` | 댓글 관리 상세 (본문 확인) | #58 |
| 필수 | PATCH | `/api/admin/comments/:commentId` | 댓글 숨김/복구 | #58 |
| 필수 | DELETE | `/api/admin/comments/:commentId` | 댓글 삭제 (REQ-ADMIN-012) | #58 |
| 필수 | GET | `/api/admin/tags` | 태그 관리 목록 | #59 |
| 필수 | POST | `/api/admin/tags` | 태그 생성 | #59 |
| 필수 | PATCH | `/api/admin/tags/:tagId` | 태그 수정 (차단 해제·병합 취소 포함) | #59 |
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
| 선택 | GET | `/api/admin/activity-logs/admins` | 활동 로그 처리자 목록 (필터용) | #63 |
| 선택 | GET | `/api/admin/password-reset-tokens/cleanup` | 재설정 토큰 정리 상태 | - |
| 선택 (개발 환경 전용) | POST | `/api/admin/password-reset-tokens/cleanup` | 재설정 토큰 정리 바로 실행 (테스트용) | - |

- 관리자 API는 모두 37개입니다. (개발 환경 전용 테스트 API 1개 포함) 태그 병합(태그 삭제와 같은 경로)과 관리 권한 부여(회원 제재와 같은 경로)는 요청 본문이 달라 따로 셉니다.
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

| 필드 | 계산 기준 |
| --- | --- |
| `kpis.totalMembers` | 탈퇴하지 않은 회원 수 |
| `kpis.todaySignups` | **한국 시간 오늘 0시 이후** 가입한 회원 수 (그 뒤 탈퇴했어도 포함) |
| `kpis.totalQuestions` | 공개(`active`) 질문 수 |
| `kpis.unresolvedQuestions` | 공개 질문 중 채택된 답변이 없는 질문 수 |
| `kpis.pendingReports` | 처리 대기(`pending`) 신고 수. 신고 관리 목록의 `statusCounts.pending`과 같은 값 |
| `trend` | 오늘 포함 최근 7일의 **한국 날짜**별 값. `questions`는 그날 올라온 질문 중 지금 공개인 질문 수, `signups`는 그날 가입한 회원 수. 값이 없는 날도 `0`으로 채움 |
| `topTags` | 공개 질문에 연결이 살아 있는 태그의 질문 수 상위 10개(같으면 이름순). 차단·병합된 태그 제외. `share`는 `questionCount ÷ totalQuestions × 100`, 소수 첫째 자리까지 반올림, 질문이 없으면 `0` |

- 숨김·삭제된 질문은 모두 세지 않습니다. ([커뮤니티 통계](#get-apiquestionsstats)와 같은 기준)

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
      "withdrawnAt": null,
      "createdAt": "2026-11-15T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "size": 20, "totalCount": 1248 }
}
```

- `sanctions`: **지금 걸려 있는** 제재 목록. 없으면 `[]`. `until`이 `null`이면 영구
- `status`: 탈퇴했으면 `withdrawn`, 아니면 `sanctions`로 계산한 값. 이용 정지가 있으면 `suspended`, 글쓰기·댓글 제한만 있으면 `restricted`, 없으면 `active`
- `withdrawnAt`: 탈퇴 시각. 탈퇴하지 않았으면 `null`

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
    "withdrawnAt": null,
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
- `activity`: 질문·답변 수는 숨김 글을 포함하고 삭제된 글만 뺍니다. `reportsReceivedCount`는 이 회원의 글이 받은 신고 중 신고자가 접수 취소(`canceled`)한 것만 뺀 수입니다. 관리자가 숨긴 글도 보고 제재를 판단할 수 있도록 공개 프로필의 `questionCount`·`answerCount`(숨김 제외)와 기준이 다릅니다.

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
- 탈퇴한 회원은 제재 대상이 아니므로 제재·해제 요청은 `404 USER_NOT_FOUND`입니다. (상세 조회는 됩니다)

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
- 이미 그 상태인 항목을 다시 숨기거나 복구하면 바꾸지 않고 `200`(목록 항목)이고, 이미 삭제된 항목을 다시 삭제하면 `204`입니다. 두 경우 모두 활동 로그를 남기지 않습니다.
- 긴급 신고로 임시 숨김된 항목([8장](#8-신고))을 숨기면 상태는 그대로 두고 **숨김을 확정**합니다. 이때는 `HIDE_*` 활동 로그를 남깁니다(`detail`에 `임시 숨김 확정`). 복구하면 임시 숨김도 해제합니다.
- 관리 목록의 `status` Query: `active` / `hidden` / `deleted`, 생략 시 삭제된 항목을 뺀 전체

#### GET `/api/admin/questions`

**Query**

| 이름 | 설명 |
| --- | --- |
| `page`, `size` | |
| `keyword` | 제목 또는 작성자 닉네임 |
| `authorId` | 작성자 회원 ID, 생략 시 전체 (회원 상세의 질문 수에서 이동) |
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

#### GET `/api/admin/questions/:questionId`

관리자가 처리 전에 본문을 확인하는 상세입니다. 사용자용 `GET /api/questions/:questionId`와 달리 **숨김·삭제된 질문도** 보여 주고, 조회수를 올리지 않습니다.

**Response** `200`: 목록 항목에 `body`(HTML)와 `answers`를 더한 형식

```json
{
  "success": true,
  "data": {
    "id": 127,
    "title": "...",
    "body": "<p>...</p>",
    "author": { "id": 12, "nickname": "호야", "profileImageUrl": null },
    "tags": ["마인크래프트"],
    "answerCount": 3,
    "isAccepted": false,
    "status": "hidden",
    "createdAt": "2026-11-16T04:02:00.000Z",
    "answers": [
      {
        "id": 342,
        "body": "<p>...</p>",
        "author": { "id": 4, "nickname": "pro_user", "profileImageUrl": null },
        "isAccepted": false,
        "status": "hidden",
        "createdAt": "2026-11-16T04:30:00.000Z"
      }
    ]
  }
}
```

- `answers`: 숨김·삭제를 포함한 모든 답변, 오래된 순. `answerCount`는 목록과 같이 공개 답변 수입니다.

**Errors**: `404 QUESTION_NOT_FOUND`

#### PATCH `/api/admin/questions/:questionId`

질문 숨김/복구. Request는 위 숨김/복구 형식입니다.

**Response** `200`: 목록 항목 1개

**Errors**: `400 VALIDATION_ERROR`, `404 QUESTION_NOT_FOUND`, `409 CONTENT_DELETED`

#### DELETE `/api/admin/questions/:questionId`

관리자는 답변이 있는 질문도 삭제할 수 있습니다. 질문과 답변을 모두 삭제 상태(`deleted`)로 바꿉니다. 질문의 태그 연결과 질문·답변의 본문 이미지 연결도 끊습니다. ([1.7](#17-삭제-정책-soft-delete))

**Response** `204`

**Errors**: `404 QUESTION_NOT_FOUND`

#### GET `/api/admin/answers`

**Query**

| 이름 | 설명 |
| --- | --- |
| `page`, `size` | |
| `keyword` | 본문 또는 작성자 닉네임 |
| `authorId` | 작성자 회원 ID, 생략 시 전체 (회원 상세의 답변 수에서 이동) |
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

#### GET `/api/admin/answers/:answerId`

숨김·삭제된 답변도 보여 주는 관리자 상세입니다.

**Response** `200`: 목록 항목에 `body`(HTML)를 더한 형식

**Errors**: `404 ANSWER_NOT_FOUND`

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

#### GET `/api/admin/posts/:postId`

숨김·삭제된 게시글도 보여 주는 관리자 상세입니다. 조회수를 올리지 않습니다.

**Response** `200`: 목록 항목에 `body`(HTML)와 `comments`를 더한 형식

- `comments`: 숨김·삭제를 포함한 모든 댓글 `{ id, body, author, status, createdAt }`, 오래된 순. `commentCount`는 목록과 같이 공개 댓글 수입니다.

**Errors**: `404 POST_NOT_FOUND`

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

#### GET `/api/admin/comments/:commentId`

숨김·삭제된 댓글도 보여 주는 관리자 상세입니다.

**Response** `200`: 목록 항목에 `body`(내용 전체)를 더한 형식

**Errors**: `404 COMMENT_NOT_FOUND`

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
  "mergedInto": null,
  "createdAt": "2026-01-02T00:00:00.000Z"
}
```

- `status`: `active`(사용 중) / `blocked`(관리자가 삭제해 차단됨) / `merged`(다른 태그로 병합됨). 차단·병합된 태그는 `questionCount`가 `0`입니다. 차단된 태그는 `blockedAt`에 삭제 시각이 들어갑니다.
- `mergedInto`: 병합된 태그면 병합 대상 태그 `{ "id": 3, "name": "league-of-legends" }`, 아니면 `null`

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

**Request**: `POST`와 같은 필드 (보낸 필드만 수정). 차단 해제·병합 취소는 `status`만 보냅니다.

```json
{ "status": "active" }
```

- 차단된 태그는 `status: "active"`(차단 해제)만 받습니다. 이름·설명을 바꾸려면 먼저 차단을 풉니다.
- 차단을 풀어도 삭제할 때 끊긴 질문 연결은 돌아오지 않습니다.
- 차단 해제는 활동 로그에 `RESTORE_TAG`로 남깁니다.
- 이름을 차단된 태그의 이름으로 바꾸면 생성과 같이 `400 TAG_BLOCKED`, 사용 중이거나 병합된 이름이면 `409 TAG_DUPLICATED`입니다.
- 병합된(`merged`) 태그는 대상 태그의 다른 이름으로만 쓰이므로 이름·설명을 수정하거나 삭제할 수 없습니다. (`400 VALIDATION_ERROR`) `status: "active"`(병합 취소)만 받습니다.
- 보낸 값이 지금과 같으면 바꾸지 않고 활동 로그도 남기지 않습니다.

**병합 취소** (선택): 병합된 태그에 `{ "status": "active" }`를 보내면 마지막 병합을 되돌립니다.

- 원본 태그는 다시 사용 중(`active`)이 되고 `mergedInto`는 `null`이 됩니다. 이후 원본 이름은 다시 원본 태그로 저장됩니다.
- 병합 때 옮긴 질문에 원본 태그를 다시 연결하고, 병합 때문에 대상 태그가 새로 붙은 질문에서는 대상 태그를 뗍니다. 병합 전부터 대상 태그가 있던 질문은 대상 태그를 그대로 둡니다.
- 병합 뒤 질문을 수정해 대상 태그를 뺀 질문에는 원본 태그를 다시 연결하지 않습니다. 병합 뒤 원본 이름으로 새로 쓴 질문은 병합 때 옮긴 질문이 아니므로 대상 태그로 남습니다.
- 원본으로 병합돼 있다가 이 병합 때 대상 태그를 가리키게 바뀐 태그는 다시 원본 태그를 가리킵니다.
- 병합 기록이 없으면(병합 취소 기능을 넣기 전에 한 병합) 되돌릴 수 없습니다. (`400 VALIDATION_ERROR`)
- 대상 태그가 그 뒤에 다시 병합되거나 차단됐으면 되돌릴 수 없습니다. (`400 VALIDATION_ERROR`) 병합을 여러 번 했으면 나중 병합부터 거꾸로 취소합니다.
- 활동 로그에는 `UNMERGE_TAG`로 남깁니다.

**Response** `200`: `AdminTag`

**Errors**: `400 VALIDATION_ERROR` (차단된 태그의 이름·설명 수정, 병합된 태그 수정, 되돌릴 수 없는 병합 등), `400 TAG_BLOCKED`, `404 TAG_NOT_FOUND`, `409 TAG_DUPLICATED`

#### DELETE `/api/admin/tags/:tagId`

태그를 **차단**합니다 (REQ-ADMIN-010). 행을 지우지 않고 `status`를 `blocked`로 바꿔, 같은 이름의 태그가 다시 만들어지지 않게 합니다.

- 질문에서 사용 중인 태그도 삭제할 수 있습니다. 태그와 질문의 연결만 끊고 질문은 남깁니다.
- 프론트엔드는 삭제 확인 창에 목록의 `questionCount`로 "질문 N건에서 이 태그가 빠집니다."와 "같은 이름으로 다시 만들 수 없습니다."를 보여 줍니다.
- 이미 차단된 태그를 다시 삭제하면 아무것도 바꾸지 않고 `204`입니다.
- 병합된(`merged`) 태그는 삭제할 수 없습니다. (`400 VALIDATION_ERROR`)

**Response** `204`

**Errors**: `400 VALIDATION_ERROR` (병합된 태그), `404 TAG_NOT_FOUND`

#### DELETE `/api/admin/tags/:tagId?mergeInto=:targetTagId`

태그 병합 (선택). `:tagId` 태그(원본)를 `mergeInto` 태그(대상)로 합칩니다. 원본을 쓰던 질문은 대상 태그로 옮겨지고(이미 대상 태그가 있으면 중복 제거), 원본 태그는 `merged` 상태가 됩니다.

- 원본 태그는 지우지 않고 `status`를 `merged`로 바꾸고 대상 태그를 기록합니다. 차단(`blocked`)과 달리, 이후 질문에 원본 이름을 쓰면 **대상 태그로 바꿔서** 저장합니다. (예: `lol` → `league-of-legends`)
- 관리자가 병합된 이름으로 새 태그를 만들면 `409 TAG_DUPLICATED`입니다.
- 차단된 태그는 원본·대상 모두 쓸 수 없습니다.
- 병합된(`merged`) 태그도 원본·대상 모두 쓸 수 없습니다. (`400 VALIDATION_ERROR`) 대상은 사용 중(`active`) 태그만 고릅니다.
- 원본으로 이미 병합돼 있던 태그들은 새 대상 태그를 바로 가리키도록 함께 바꿉니다. (병합 단계가 늘어나지 않게)
- 병합할 때 옮긴 질문을 기록해 두므로, 나중에 위 `PATCH`로 병합을 취소할 수 있습니다.

```http
DELETE /api/admin/tags/9?mergeInto=3
```

- 활동 로그에는 `DELETE_TAG`가 아니라 `MERGE_TAG`로 남깁니다.

**Response** `200`: 병합 후 대상 태그(`AdminTag`)

**Errors**: `400 VALIDATION_ERROR` (`mergeInto` 형식 오류, 원본 또는 대상이 병합됨), `400 TAG_MERGE_SAME`, `400 TAG_BLOCKED` (원본 또는 대상이 차단됨), `404 TAG_NOT_FOUND` (원본 또는 대상 없음)

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
  "isTempHidden": false,
  "createdAt": "2026-11-16T05:02:00.000Z",
  "processedAt": null
}
```

- `duplicateCount`: 같은 대상에 대한 `pending` 신고 수 (자기 자신 포함)
- `targetStatus`: 신고 대상의 현재 상태 `active` / `hidden` / `deleted`. 관리자가 숨겼거나 긴급 신고로 임시 숨김됐으면 `hidden`
- `isTempHidden`: 대상이 긴급 신고로 임시 숨김 중이면 `true` ([8장](#8-신고)). 관리자가 확정하거나 해제하면 `false`
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
| `targetAuthorId` | - | 신고 대상 작성자 회원 ID, 생략 시 전체 (회원 상세의 받은 신고 수에서 이동) |

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

- `meta.statusCounts`: 탭 배지에 쓰는 상태별 건수. `status`를 뺀 나머지 필터(`targetType`·`reason`·`targetAuthorId`)는 적용합니다. 회원 상세에서 `targetAuthorId`로 들어오면 세 탭의 합이 그 회원의 `reportsReceivedCount`와 같습니다.
- 접수 취소(`canceled`)한 신고는 관리자 신고 목록·상세·건수에 나오지 않습니다.

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
- 제재 규칙은 [회원 제재](#patch-apiadminusersuserid)와 같습니다. 작성자가 탈퇴했으면 `404 USER_NOT_FOUND`, 관리자면 `403 CANNOT_SANCTION_ADMIN`이고, 숨김을 포함한 처리 전체를 되돌립니다. 프론트엔드는 작성자가 탈퇴했으면(`targetAuthor.id`가 `null`) 제재 선택을 막고, 관리자 계정이면 서버가 준 메시지를 보여 줍니다.
- 신고 대상이 이미 삭제됐으면 `hideTarget`·`sanction`은 무시하고 신고 상태만 `resolved`로 바꿉니다.
- `hideTarget`으로 채택된 답변을 숨기면 [답변 숨김](#patch-apiadminanswersanswerid)과 같이 질문의 채택 상태도 해제합니다.
- 대상이 임시 숨김 중이면([8장](#8-신고)) `resolved`이고 `hideTarget: true`일 때 숨김을 확정하고, `hideTarget: false`이거나 `rejected`이면 대상을 다시 공개(`active`)합니다. 활동 로그 `detail`에 `임시 숨김 확정` / `임시 숨김 해제`를 붙입니다. 대상이 이미 삭제됐으면 상태는 바꾸지 않고 임시 숨김 기록만 끝냅니다.
- 활동 로그에는 `RESOLVE_REPORT` / `REJECT_REPORT` 하나로 남깁니다. 숨김·제재는 `detail`에 적고(예: `대상 숨김 + 7일 정지`), `HIDE_*`·`SANCTION_USER` 로그를 따로 남기지 않습니다.
- 처리·반려하면 함께 바뀌는 같은 대상의 신고를 접수한 회원 모두에게 `report_processed` 알림을 보냅니다. ([12. 알림](#12-알림))
- `resolved`이고 대상 숨김 또는 제재가 있으면 대상 작성자에게 `report_action` 알림을 보냅니다. 조치 없는 처리·반려는 알리지 않습니다. ([12. 알림](#12-알림))
- `resolved`이면 대상 작성자의 포인트를 일정 비율 차감하고, 활동 로그 `detail` 끝에 붙입니다(예: `대상 숨김 + 7일 정지 · 포인트 35% 차감(-331)`). 대상이 이미 삭제됐거나 작성자가 탈퇴·관리자면 차감하지 않습니다. ([11.1](#111-포인트-지급--차감-규칙))

**Response** `200`: `AdminReport`

**Errors**: `400 VALIDATION_ERROR` (`status` 값 오류 등), `403 CANNOT_SANCTION_ADMIN`, `404 REPORT_NOT_FOUND`, `404 USER_NOT_FOUND` (작성자 탈퇴), `409 REPORT_ALREADY_PROCESSED`, `409 SANCTION_ALREADY_ACTIVE`

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

- 등록하면 탈퇴하지 않은 일반 회원(`role = USER`) 모두에게 `notice_created` 알림을 보냅니다. 수정은 알리지 않습니다. ([12. 알림](#12-알림))

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
| `startDate`, `endDate` | `YYYY-MM-DD`, 양 끝 포함. **한국 시간(KST) 기준 날짜**입니다 (예: `2026-11-13`은 KST 11-13 0시부터 11-14 0시 전까지) |

처리자 선택 목록은 아래 [`GET /api/admin/activity-logs/admins`](#get-apiadminactivity-logsadmins)로 조회합니다. 관리자뿐 아니라 관리 권한(`content_manage`) 회원의 `MODERATE_*` 로그도 처리자로 고를 수 있습니다.

- **보관 기간 5년**: 작성 후 5년이 지난 로그는 하루 1번 도는 작업이 `status`를 `expired`로 바꾸고 이 API에서 빼고 보여 줍니다. (행은 남김, [1.7](#17-삭제-정책-soft-delete))
- 처리한 관리자가 탈퇴하면 로그는 그대로 두고, `admin`은 탈퇴 회원 표기(`{ "id": null, "nickname": "탈퇴한 회원", ... }`)로 내려갑니다.

| action | 그룹 | 설명 |
| --- | --- | --- |
| `SANCTION_USER` | - | 회원 제재 (정지·글쓰기 제한·댓글 제한) |
| `RELEASE_SANCTION` | - | 회원 제재 해제 |
| `GRANT_PERMISSION` / `REVOKE_PERMISSION` | - | 게시물·댓글 관리 권한 부여 / 회수 (선택·후순위) |
| `MODERATE_EDIT` / `MODERATE_DELETE` | - | 관리 권한을 가진 회원 또는 `ADMIN`이 사용자 사이트에서 다른 회원의 글을 수정(질문·답변) / 삭제 (`admin`에 그 회원이 들어감) |
| `HIDE_QUESTION` / `HIDE_ANSWER` / `HIDE_POST` / `HIDE_COMMENT` | `HIDE` | 숨김 |
| `RESTORE_QUESTION` / `RESTORE_ANSWER` / `RESTORE_POST` / `RESTORE_COMMENT` | `RESTORE` | 숨김 복구 |
| `DELETE_QUESTION` / `DELETE_ANSWER` / `DELETE_POST` / `DELETE_COMMENT` | `DELETE` | 삭제 (`status: deleted`) |
| `CREATE_TAG` / `UPDATE_TAG` | - | 태그 생성 / 수정. `UPDATE_TAG`는 Diamond 이상 회원이 사용자 사이트에서 설명을 수정한 경우도 포함 (`admin`에 그 회원이 들어감, [5장](#patch-apitagstagname)) |
| `DELETE_TAG` / `RESTORE_TAG` | - | 태그 삭제(차단) / 차단 해제 |
| `MERGE_TAG` / `UNMERGE_TAG` | - | 태그 병합 / 병합 취소 |
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

#### GET `/api/admin/activity-logs/admins`

활동 로그에 한 번이라도 남은 처리자 목록입니다. 활동 로그 화면의 처리자 필터에 씁니다.

**Response** `200`

```json
{
  "success": true,
  "data": [
    { "id": 1, "nickname": "운영자", "role": "ADMIN", "isWithdrawn": false },
    { "id": 2, "nickname": "모더레이터", "role": "USER", "isWithdrawn": false },
    { "id": 7, "nickname": null, "role": "ADMIN", "isWithdrawn": true }
  ]
}
```

- 지금 권한이 없어도 로그가 있으면 넣습니다. (권한을 회수한 모더레이터, 탈퇴한 관리자 포함)
- 보관 기간이 지난(`expired`) 로그만 있는 처리자는 넣지 않습니다.
- 정렬: `ADMIN` 먼저, 그다음 가장 최근 로그가 있는 순서
- 탈퇴한 처리자는 `nickname`이 `null`입니다. 관리자 화면 안에서만 쓰므로 필터에 쓸 `id`는 그대로 줍니다. (`GET /api/admin/users`의 탈퇴 회원과 같은 방식)
- 페이지네이션 없이 전체를 줍니다. (처리자는 많지 않음)

### 10.9 운영 점검

비밀번호 재설정 토큰 정리 작업([1.7](#17-삭제-정책-soft-delete) 예외)이 잘 돌고 있는지 확인하는 API입니다. 관리자 화면은 두지 않고 API로만 확인합니다.

- 정리 대상: 더는 쓸 수 없게 된 시각(사용 시각과 만료 시각 중 이른 쪽)이 보관 기간(**7일**)보다 오래된 토큰
- 정리 작업은 서버가 뜰 때 한 번, 이후 **1시간마다** 돕니다.

#### GET `/api/admin/password-reset-tokens/cleanup`

정리 상태를 봅니다. 정리 작업이 잘 돌고 있으면 `cleanupTargetCount`는 거의 항상 `0`입니다.

**Response** `200`

```json
{
  "success": true,
  "data": {
    "retentionMinutes": 10080,
    "totalCount": 42,
    "usableCount": 1,
    "cleanupTargetCount": 0,
    "lastRun": { "finishedAt": "2026-11-16T05:00:00.000Z", "deletedCount": 3, "trigger": "schedule" }
  }
}
```

- `retentionMinutes`: 보관 기간(분). 7일 = `10080`
- `totalCount`: 지금 남아 있는 토큰 행 수
- `usableCount`: 아직 쓸 수 있는 토큰 수 (사용 전이고 만료 전)
- `cleanupTargetCount`: 보관 기간이 지나 정리 대상인데 아직 남아 있는 토큰 수
- `lastRun`: 서버가 뜬 뒤 마지막으로 끝난 정리 결과. 서버를 다시 띄우면 `null`부터 시작합니다. `trigger`는 `schedule`(주기 작업) / `manual`(아래 테스트 API)

#### POST `/api/admin/password-reset-tokens/cleanup`

**개발 환경 전용**(`NODE_ENV`가 `production`이 아닐 때만 있음) 테스트 API입니다. 정리를 바로 한 번 실행합니다. 운영 환경에서는 `404 ROUTE_NOT_FOUND`입니다.

**Request** (본문 생략 가능)

```json
{ "retentionMinutes": 0 }
```

| 필드 | 규칙 |
| --- | --- |
| `retentionMinutes` | 선택, 0 이상의 정수. 생략하면 보관 기간(10080). 테스트할 때 `0`을 주면 지금 쓸 수 없는 토큰을 모두 지웁니다 |

**Response** `200`

```json
{ "success": true, "data": { "retentionMinutes": 0, "deletedCount": 2 } }
```

- 쓸 수 있는 토큰(사용 전이고 만료 전)은 `retentionMinutes`와 상관없이 지우지 않습니다.
- 테스트용이라 활동 로그([10.8](#108-활동-로그))를 남기지 않습니다.

**Errors**: `400 VALIDATION_ERROR`

---

## 11. 포인트 / 등급

회원은 활동으로 포인트를 받고, 신고가 처리되면 포인트를 잃습니다. 포인트로 레벨(Lv0~79)과 등급 배지가 정해집니다. (REQ-POINT-001~010)

- **관리자 계정은 대상이 아닙니다.** 지급·차감하지 않고, 레벨·등급은 `null`입니다.
- 처음 가입한 회원은 포인트 0, Lv0(`unranked`)입니다.
- 포인트는 0 아래로 내려가지 않습니다.

### 11.1 포인트 지급 / 차감 규칙

| `reason` | 언제 | 포인트 | 한도 |
| --- | --- | --- | --- |
| `daily_visit` | 로그인한 상태로 그날(한국 날짜) 처음 [`GET /api/users/me`](#get-apiusersme)를 부를 때 | +1 | 하루 1회 |
| `question_create` | 질문 작성 ([`POST /api/questions`](#post-apiquestions)) | +2 | 하루(한국 날짜) 5개까지. 6번째부터는 지급하지 않음 |
| `accept_give` | 질문자가 답변을 채택 (질문자에게) | +20 | 질문당 1회 |
| `answer_accepted` | 내 답변이 채택됨 (답변자에게) | +50 | 답변당 1회 |
| `report_penalty` | 내 글에 대한 신고가 처리(`resolved`)됨 | 현재 포인트 × 차감 비율 (소수점 버림) | 신고 처리 1회당 1번 |

- 지급은 그 행동과 같은 트랜잭션에서 합니다. 지급이 실패하면 행동도 되돌립니다.
- 질문을 지우거나, 관리자가 채택된 답변을 숨겨 채택이 풀려도 받은 포인트는 회수하지 않습니다. 잘못된 활동은 신고 처리 차감으로 다룹니다.
- 채택이 풀린 질문에서 다른 답변을 다시 채택하면 새 답변자는 `answer_accepted`를 받지만, 질문자는 `accept_give`를 다시 받지 않습니다.

**신고 처리 차감 비율** = 조치 비율 + 기간 가산 + 이전 처리 횟수 × 5%p, **최대 80%**

| 처리 내용 (`PATCH /api/admin/reports/:reportId`) | 조치 비율 |
| --- | --- |
| 숨김·제재 없음 | 5% |
| 대상 숨김 (`hideTarget: true`) | 10% |
| 댓글 제한 (`comment_ban`) | 15% |
| 글쓰기 제한 (`write_ban`) | 20% |
| 이용 정지 (`suspend`) | 30% |

| 제재 기간 (`days`) | 3 | 7 | 30 | `null`(영구) |
| --- | --- | --- | --- | --- |
| 기간 가산 | +0%p | +5%p | +10%p | +20%p |

- 숨김과 제재를 같이 하면 조치 비율은 둘 중 큰 값입니다. 기간 가산은 제재가 있을 때만 더합니다.
- 이전 처리 횟수: 그 회원이 지금까지 받은 `report_penalty` 수 (차감액이 0이라 남지 않은 처리는 세지 않음)
- 같은 대상의 신고 여러 건을 한 번에 처리해도 1회로 차감합니다. 반려(`rejected`)는 차감하지 않습니다.
- 예: 처음 처리, 숨김 + 7일 정지 → 30% + 5%p = 35%. 포인트 948이면 331 차감
- 차감 결과 레벨이 내려갈 수 있습니다.

### 11.2 레벨 / 등급

레벨은 현재 포인트로 정합니다. 등급(`tier`)은 [리그 오브 레전드](https://www.leagueoflegends.com) 랭크 티어 이름을 따르고, 배지는 **자체 디자인**(디자인 토큰 색·아이콘)으로 만듭니다. 게임 엠블럼 이미지는 쓰지 않습니다.

| `tier` | 레벨 | 레벨당 필요 포인트 | 시작 포인트 (첫 레벨) | 마지막 레벨 시작 포인트 |
| --- | --- | --- | --- | --- |
| `unranked` | 0 | - | 0 | 0 |
| `iron` | 1~9 | 10 | 10 | 90 |
| `bronze` | 10~19 | 20 | 110 | 290 |
| `silver` | 20~29 | 35 | 325 | 640 |
| `gold` | 30~39 | 55 | 695 | 1,190 |
| `platinum` | 40~49 | 80 | 1,270 | 1,990 |
| `emerald` | 50~59 | 110 | 2,100 | 3,090 |
| `diamond` | 60~69 | 150 | 3,240 | 4,590 |
| `master` | 70~79 | 200 | 4,790 | 6,590 |
| `grandmaster` | 70~79 중 순위 101~300위 | - | - | - |
| `challenger` | 70~79 중 순위 1~100위 | - | - | - |

- Lv N의 시작 포인트 = Lv N-1 시작 포인트 + 그 레벨이 속한 등급의 "레벨당 필요 포인트". Lv79(6,590) 이상은 모두 Lv79입니다.
- **Grandmaster / Challenger**: Master 레벨(70~79) 회원을 순위 점수로 줄 세워 1~100위는 `challenger`, 101~300위는 `grandmaster`, 나머지는 `master`입니다.
  - 순위 점수 = `points × (1 + 답변 채택률)`. 답변 채택률 = 채택된 답변 수 ÷ 작성한 답변 수 (숨김·삭제된 답변 제외, 답변이 없으면 0). 같으면 포인트가 많은 순, 그다음 가입이 빠른 순
  - 순위는 서버가 **10분마다** 다시 계산합니다(로컬 테스트에서는 `RANKING_INTERVAL_MINUTES`로 줄일 수 있음). 그 사이 포인트가 바뀌어도 순위는 다음 계산 때 반영됩니다. 다만 Master 레벨 아래로 내려가면 바로 그 레벨의 등급으로 보입니다.
  - 계산한 순위 등급은 `users.ranked_tier`에 저장합니다. 등급이 한 단계 오르면(없음 → `grandmaster` → `challenger`, 없음 → `challenger`) `rank_achieved` 알림을 보냅니다. 내려갈 때는 알리지 않고, 순위 밖으로 떨어졌다가 다시 오르면 다시 알립니다. 서버를 다시 켜도 저장한 값과 비교하므로 중복으로 보내지 않습니다. ([12. 알림](#12-알림))

### GET `/api/users/me/point-histories`

마이페이지의 포인트 내역. 로그인 필수.

**Query**: `page`, `size`(기본 20). 최신순.

**Response** `200`

```json
{
  "success": true,
  "data": [
    {
      "id": 905,
      "reason": "report_penalty",
      "amount": -331,
      "targetType": "report",
      "targetId": 4021,
      "detail": "대상 숨김 + 7일 정지 · 35%",
      "createdAt": "2026-11-16T03:10:00.000Z"
    },
    {
      "id": 902,
      "reason": "answer_accepted",
      "amount": 50,
      "targetType": "answer",
      "targetId": 8941,
      "detail": null,
      "createdAt": "2026-11-15T12:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "size": 20, "totalCount": 37 }
}
```

- `targetType` / `targetId`: `question_create`·`accept_give`는 질문, `answer_accepted`는 답변, `report_penalty`는 신고, `daily_visit`은 `null`
- 신고 처리 차감의 `targetId`는 처리된 신고 id입니다. 회원은 신고 상세를 볼 수 없으므로 화면은 링크 없이 `detail`만 보여 줍니다.
- 관리자는 내역이 없어 빈 목록입니다.

**Errors**: `401 UNAUTHORIZED`

---

## 12. 알림

헤더의 알림 버튼에 읽지 않은 알림 수를 보여 주고, 누르면 최근 알림 목록을 엽니다. (REQ-NOTI-001~008)

| 우선 | Method | Path | 설명 | 인증 |
| --- | --- | --- | --- | --- |
| 선택 | GET | `/api/notifications` | 내 알림 목록 (최신순) | 필수 |
| 선택 | GET | `/api/notifications/unread-count` | 읽지 않은 알림 수 | 필수 |
| 선택 | PATCH | `/api/notifications/:notificationId/read` | 알림 하나 읽음 처리 | 필수 |
| 선택 | PATCH | `/api/notifications/read-all` | 모두 읽음 처리 | 필수 |

### 12.1 알림 종류

알림은 그 일이 일어난 요청과 **같은 트랜잭션**에서 만듭니다. 받는 회원이 탈퇴했으면 만들지 않습니다.

| `type` | 언제 / 누구에게 | `actor` | `targetType` / `targetId` / `subTargetId` | `title` | `detail` |
| --- | --- | --- | --- | --- | --- |
| `answer_created` | 내 질문에 새 답변 (내가 단 답변 제외) | 답변 작성자 | `question` / 질문 id / 답변 id | 질문 제목 | `null` |
| `answer_accepted` | 내 답변이 채택됨 | 질문 작성자 | `question` / 질문 id / 답변 id | 질문 제목 | `null` |
| `comment_created` | 내 게시글에 새 댓글 (내가 단 댓글 제외) | 댓글 작성자 | `post` / 게시글 id / 댓글 id | 게시글 제목 | `null` |
| `notice_created` | 공지 등록. 그 시점의 일반 회원 전체 (관리자 제외) | `null` | `notice` / 공지 id / `null` | 공지 제목 | `null` |
| `question_edited` | 내가 답변한 질문이 수정됨 (수정한 본인 제외) | 수정한 회원 | `question` / 질문 id / `null` | 질문 제목 | `null` |
| `answer_edited` | 내가 추천한 답변, 또는 내 질문에 달린 답변이 수정됨 (수정한 본인 제외) | 수정한 회원 | `question` / 질문 id / 답변 id | 질문 제목 | `null` |
| `report_processed` | 내가 접수한 신고가 처리·반려됨 | `null` | `report` / 신고 id / `null` | 신고한 글 제목 (`report_action`과 같은 규칙, 삭제된 글이면 `<종류> #<id>`) | `처리 완료` 또는 `반려` |
| `rank_achieved` | Grandmaster·Challenger로 한 단계 오름 ([11.2](#112-레벨--등급)) | `null` | `user` / 내 회원 id / `null` | `Grandmaster` 또는 `Challenger` | `순위 <n>위` |
| `report_action` | 내 글이 신고 처리로 숨김 또는 제재됨 ([10.6](#patch-apiadminreportsreportid)) | `null` (신고자·처리자를 알리지 않음) | 신고된 글 종류(`question`·`answer`·`post`·`comment`) / 글 id / `null` | 질문·게시글은 제목, 답변은 `답변: <질문 제목>`, 댓글은 `댓글: <게시글 제목>` | `<신고 사유> · <조치>` (예: `스팸·홍보 · 대상 숨김 + 7일 정지 · 포인트 35% 차감(-331)`) |

- `title`은 알림을 만든 시점의 값을 저장합니다(최대 100자). 나중에 글 제목이 바뀌어도 그대로입니다.
- 화면의 이동 경로는 `targetType`·`targetId`·`subTargetId`로 프론트엔드에서 만듭니다. 답변은 질문 상세의 `#answer-<id>`로 이동합니다. `report_action`은 숨김 처리된 글이라 이동하지 않고, `report_processed`는 마이페이지 내 신고 내역(`/mypage#my-reports`), `rank_achieved`는 마이페이지로 이동합니다.
- `rank_achieved`를 읽지 않은 채로 화면을 열면 프론트엔드는 **축하 모달**을 띄우고, 닫으면 그 알림을 읽음 처리합니다.
- 대상 글이 그 뒤 숨김·삭제됐으면 상세 화면이 `404`로 안내합니다. 알림은 지우지 않습니다.
- **보관 기간 제한이 없고 회원이 삭제할 수 없습니다.** 읽음 처리만 합니다. ([1.7](#17-삭제-정책-soft-delete))
- 새 알림은 실시간으로 보내지 않습니다. 프론트엔드는 화면을 옮길 때와 **60초마다** `unread-count`를 다시 불러옵니다.

**Notification 객체**

```json
{
  "id": 501,
  "type": "answer_created",
  "title": "마인크래프트 주민 전직이 안 돼요",
  "detail": null,
  "actor": { "id": 30, "nickname": "호야", "profileImageUrl": null },
  "targetType": "question",
  "targetId": 128,
  "subTargetId": 8941,
  "isRead": false,
  "createdAt": "2026-11-16T03:10:00.000Z"
}
```

- `actor`: [UserSummary](#16-공통-객체). 탈퇴한 회원이면 `탈퇴한 회원`, 없는 종류는 `null`

### GET `/api/notifications`

**Query**: `page`, `size`(기본 20). 최신순(`createdAt`, 같으면 `id` 내림차순).

**Response** `200`: `Notification[]` + `meta`. `meta`에 `unreadCount`를 함께 줍니다.

```json
{ "success": true, "data": [], "meta": { "page": 1, "size": 20, "totalCount": 37, "unreadCount": 3 } }
```

**Errors**: `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`

### GET `/api/notifications/unread-count`

**Response** `200`

```json
{ "success": true, "data": { "unreadCount": 3 } }
```

**Errors**: `401 UNAUTHORIZED`

### PATCH `/api/notifications/:notificationId/read`

**Response** `204`

- 이미 읽은 알림이어도 `204`입니다.
- 내 알림이 아니거나 없으면 `404 NOTIFICATION_NOT_FOUND`입니다.

**Errors**: `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `404 NOTIFICATION_NOT_FOUND`

### PATCH `/api/notifications/read-all`

**Response** `204`. 읽지 않은 내 알림을 모두 읽음으로 바꿉니다.

**Errors**: `401 UNAUTHORIZED`

- 알림 API는 조회·읽음 처리라 이용 정지 중에도 쓸 수 있습니다. ([1.2](#12-인증))

---

## 13. 결정 필요 사항

### 13.1 범위 제외 / 후순위 항목

이번 범위에서 제외했거나, **필수 기능을 먼저 개발한 뒤 추가 개발할 수 있는 후순위** 항목입니다. 포함하기로 정하면 이 문서를 먼저 고칩니다. 확정된 항목은 표에서 지우고 본문에 반영합니다. (ID는 다시 매기지 않습니다.)

| ID | 항목 | 현재 상황 | 기본안 |
| --- | --- | --- | --- |
| D-11 | 질문 추천 | 질문 상세에 "추천" 버튼 있으나 WBS에 없음 | 이번 범위 제외 (답변 추천만 구현, #76) |
| D-13 | 게시글 카테고리 | 게시글 상세에 "공략" 카테고리 표시, 작성 화면에는 선택란 없음 | 이번 범위 제외 |
| D-17 | 태그 동의어 제안·투표 (REQ-TAG-004) | 관리자 병합(`merged`)만 있음 | **후순위**. 추가 시 동의어 제안·추천 API와 등록/삭제 기준(추천 5 이상 등록, -2 미만 삭제). 관리자는 바로 등록(지금의 병합) |
| D-18 | 운영 통계·추천 표시 | 화면에만 있음: 로그인 "오늘 등록된 새 공략". 신고 화면 "평균 처리 시간·SLA·금일 필터 현황", 신고 완료 "예상 처리 시간", 커뮤니티 통계 "전주 대비", 질문 작성 중 "유사한 기존 해결 질문"은 mock 값이라 화면에서 뺌 | **후순위**. 추가 시 각 값을 주는 통계 API(`GET /api/questions/stats` 확장, 신고 처리 통계)와 작성 중 유사 질문 검색 API |
| D-19 | 게임 계정 연동·크레딧·배틀패스 | 기능 없음. 회원 탈퇴 안내에 있던 "게임 연동 계정·전적 통계 파기", "잔여 크레딧·배틀패스 보상 소멸" 문구는 화면에서 빼고 2장 회원 탈퇴 내용으로 바꿈 | **후순위**. 해당 기능이 생기면 탈퇴 시 처리 규칙을 2장 회원 탈퇴에 추가 |
| D-20 | 수정 전 본문 버전 기록 | 화면에만 있음: 답변 수정 "버전별 Diff 기록", "버전 v1.1 생성 예정" | **후순위**. 지금 수정 이력은 시각·수정자·사유만 저장(3장 수정 이력). 추가 시 이력에 수정 전 본문을 저장하고 비교 화면 제공 |
| D-22 | 파티 찾기 | 기능 없음. 소개글 도움말에 있던 "파티 찾기 화면에 노출" 문구는 화면에서 뺌 | **후순위**. 파티 찾기 기능을 정하면 추가 |
| D-24 | 이메일 발송 | 메일을 보내는 기능 없음. 비밀번호 찾기는 아이디·이메일이 가입 정보와 맞으면 재설정 토큰을 바로 주고([2장](#post-apiauthpassword-resetverify)), 회원가입은 이메일 중복만 확인함. 시도 횟수 제한([1.11](#111-시도-횟수-제한))으로 대입 시도를 막음 | **이번 범위 제외** (팀 결정). 비밀번호 재설정 메일 링크, 가입 이메일 인증, 아이디 찾기 메일 발송 모두 하지 않음. 화면 문구도 메일을 보내는 것처럼 읽히지 않게 씀 |

---

## 14. 에러 코드 모음

| Status | code | 상황 |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | 입력값 형식 오류 |
| 400 | `INVALID_JSON` | 요청 본문이 JSON이 아님 |
| 400 | `PASSWORD_MISMATCH` | 현재 비밀번호 불일치 (비밀번호 변경, 회원 탈퇴) |
| 400 | `PASSWORD_SAME_AS_CURRENT` | 새 비밀번호가 현재 비밀번호와 같음 (로그인 상태 비밀번호 변경) |
| 400 | `RESET_TOKEN_INVALID` | 비밀번호 재설정 토큰 만료/무효 |
| 400 | `MAIN_GAME_TAG_INVALID` | 주력 게임에 없는·차단·병합된 태그 |
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
| 404 | `NOTIFICATION_NOT_FOUND` | 알림 없음 (내 알림이 아님) |
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
| 429 | `TOO_MANY_ATTEMPTS` | 5번 실패 뒤 5분 동안 로그인·아이디 찾기·비밀번호 찾기·현재 비밀번호 확인 제한 ([1.11](#111-시도-횟수-제한)) |
| 500 | `INTERNAL_SERVER_ERROR` | 서버 오류 |

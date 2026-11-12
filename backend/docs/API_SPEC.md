# GAMERS API 명세서

- 버전: v0.1 (초안, 2026-11-12)
- 근거: `frontend/src/apps/*` 화면·mock 데이터, GitHub WBS 이슈 #44 ~ #79, `backend/docs/CODE_CONVENTION.md`
- 화면과 이 문서가 다르면 **이 문서를 기준**으로 하고, 바꿔야 하면 문서를 먼저 수정합니다.
- 아직 정해지지 않았거나 이번 범위에서 제외한 항목은 [11. 결정 필요 사항](#11-결정-필요-사항)에 모아 두었습니다. 미정 항목은 **기본안**을 기준으로 본문을 작성했습니다.

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
- **로그아웃은 서버 API가 없습니다.** 프론트엔드가 `localStorage`·`sessionStorage`의 토큰을 모두 지우고 로그인 화면(`/login`)으로 이동합니다.
  - 진입점: Q&A 헤더 우측 프로필 버튼 → "로그아웃" 메뉴, 관리자 상단바 "로그아웃" 버튼
  - 지운 토큰도 만료 전까지는 서버에서 유효합니다. (위와 같은 이유)

- 각 API의 **인증** 칸
  - `없음`: 로그인 없이 호출 가능
  - `선택`: 로그인하면 응답에 본인 기준 값(`isMine`, `isVoted` 등)이 채워짐
  - `필수`: 로그인 필요 (없으면 `401`)
  - `ADMIN`: 관리자 권한 필요 (없으면 `403`)
- 정지된 회원은 로그인과 쓰기 API 호출 시 `403 USER_SUSPENDED`를 받습니다.
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
| 예외 Enum | 권한, 활동 로그 action은 대문자 (화면 표기 그대로) | `"ADMIN"`, `"SUSPEND_USER"` |
| 본문 | Markdown 문자열 그대로 저장/반환 | |

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
{ "id": 31, "name": "latest.log", "url": "https://.../latest.log", "size": 49152, "kind": "log" }
```

- `size`: 바이트 단위 숫자
- `kind`: `image` | `log`

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
  "password": "password123!",
  "email": "legend@gamers.com"
}
```

| 필드 | 규칙 |
| --- | --- |
| `name` | 필수, 1~20자 |
| `username` | 필수, 4~20자, 영문 소문자·숫자·`_` |
| `nickname` | 필수, 2~12자 |
| `password` | 필수, 8자 이상 |
| `email` | 필수, 이메일 형식 |

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

- 대소문자를 구분하지 않고 비교합니다.
- 사용 불가여도 에러가 아니라 `isAvailable: false`로 응답합니다.

**Errors**: `400 VALIDATION_ERROR` (값이 없거나 2개 이상, 이메일 형식 오류)

### POST `/api/auth/login`

**Request**

```json
{ "loginId": "gamer_legend", "password": "password123!", "rememberMe": true }
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
{ "resetToken": "c2f1...", "newPassword": "newPassword1!" }
```

**Response** `204`

**Errors**: `400 VALIDATION_ERROR` (8자 미만), `400 RESET_TOKEN_INVALID` (만료/사용됨/위조)

### GET `/api/users/me`

마이페이지(`/mypage`).

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
    "profileImageUrl": "https://.../profile.jpg",
    "bio": "안녕하세요! RPG와 FPS 게임을 주로 즐기는 게이머입니다.",
    "questionCount": 18,
    "answerCount": 52,
    "postCount": 64,
    "interestTags": ["리그오브레전드", "발로란트", "엘든링"],
    "createdAt": "2022-03-02T00:00:00.000Z"
  }
}
```

- `interestTags`: 내가 쓴 질문에 가장 많이 쓴 태그 상위 5개
- `questionCount`, `answerCount`, `postCount`: 숨김 처리된 글을 뺀 개수
- 화면의 레벨, 랭크, 매너온도, 응답률은 이번 범위에서 제외합니다. ([11. 결정 필요 사항](#11-결정-필요-사항) D-8)

### PATCH `/api/users/me`

마이페이지 수정(`/mypage/edit`).

**Request**

```json
{ "bio": "새 소개글" }
```

| 필드 | 규칙 |
| --- | --- |
| `bio` | 0~200자 |

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

**Errors**: `400 FILE_TYPE_NOT_ALLOWED`, `400 FILE_TOO_LARGE`

### PATCH `/api/users/me/password`

로그인 상태에서 비밀번호 변경.

**Request**

```json
{ "currentPassword": "password123!", "newPassword": "newPassword1!" }
```

**Response** `204`

**Errors**: `400 VALIDATION_ERROR`, `400 PASSWORD_MISMATCH` (현재 비밀번호 불일치)

> 현재 화면에는 "현재 비밀번호" 입력란이 없습니다. D-4 참고.

### DELETE `/api/users/me`

회원 탈퇴(`/withdraw`).

**Request**

```json
{ "agreed": true }
```

**Response** `204`

- 회원 정보는 즉시 삭제(또는 개인정보 파기 후 비활성화)합니다.
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
    "bio": "안녕하세요! RPG와 FPS 게임을 주로 즐기는 게이머입니다.",
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
| `role` | O | X |

- 본인이 조회해도 이 API는 공개 항목만 보냅니다. 프론트엔드는 로그인한 회원의 `id`와 같으면 마이페이지(`/mypage`)로 보냅니다.
- 화면에서도 공개 프로필에는 아이디, 회원 코드, 수정하기 버튼을 표시하지 않습니다.
- 탈퇴했거나 없는 회원이면 `404`입니다.

**Errors**: `404 USER_NOT_FOUND`

### 회원 작성 목록

마이페이지와 공개 프로필 아래의 **질문 / 답변 / 게시글** 탭. 본인만 보는 목록이 아니라 다른 회원·비회원도 볼 수 있으므로, 회원 전용 API를 따로 두지 않고 각 목록 API에 `authorId` 조건을 붙여 재사용합니다.

| 탭 | API |
| --- | --- |
| 질문 | [`GET /api/questions?authorId=12`](#get-apiquestions) |
| 답변 | [`GET /api/answers?authorId=12`](#get-apianswers) |
| 게시글 | [`GET /api/posts?authorId=12`](#get-apiposts) |

- 마이페이지는 `GET /api/users/me`로 받은 `id`를 `authorId`로 씁니다.
- 숨김 처리된 글은 본인이 조회해도 목록에서 빠집니다.
- 탭 옆 숫자는 프로필의 `questionCount`, `answerCount`, `postCount`를 씁니다.

---

## 3. 질문

| 우선 | Method | Path | 설명 | 인증 | WBS |
| --- | --- | --- | --- | --- | --- |
| 필수 | GET | `/api/questions` | 질문 목록 (검색·필터·정렬·페이징) | 없음 | #72 |
| 필수 | POST | `/api/questions` | 질문 등록 | 필수 | #71 |
| 필수 | GET | `/api/questions/:questionId` | 질문 상세 (조회수 증가) | 선택 | #73 |
| 필수 | PATCH | `/api/questions/:questionId` | 질문 수정 | 필수 (작성자) | #71 |
| 필수 | DELETE | `/api/questions/:questionId` | 질문 삭제 | 필수 (작성자) | #71 |
| 필수 | GET | `/api/questions/:questionId/related` | 관련 질문 | 없음 | #73 |
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
| `scope` | string | `all` | 검색 대상: `all` / `title` / `tag` / `author` |
| `tag` | string | - | 태그 이름 정확히 일치 (빠른 태그, 태그 필터) |
| `hasAnswer` | boolean | - | `true`: 답변 있음 / `false`: 답변 없음 / 생략: 전체 |
| `isAccepted` | boolean | - | `true`: 채택 완료 / `false`: 채택 대기 / 생략: 전체 |
| `authorId` | number | - | 이 회원이 쓴 질문만 (프로필 작성 목록). `scope=author`는 닉네임 부분 검색이라 정확한 회원 구분에 쓰지 않습니다 |

- 숨김 처리된 질문은 목록에서 빠집니다.

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
  "tags": ["마인크래프트", "주민거래", "1.20.4"],
  "attachmentIds": [31, 32]
}
```

| 필드 | 규칙 |
| --- | --- |
| `title` | 필수, 1~100자 |
| `body` | 필수, 공백 제외 15자 이상 (Markdown) |
| `tags` | 필수, 1~5개, 중복 제거, 앞의 `#` 제거 |
| `attachmentIds` | 선택, [6. 첨부파일](#6-첨부파일)로 먼저 올린 파일 ID |

- 태그는 [5.1 태그 이름 규칙](#51-태그-이름-규칙)을 따르고, 없는 태그는 새로 만듭니다.
- 임시저장은 프론트엔드(localStorage)에서 처리하고 서버 API는 두지 않습니다.

**Response** `201`: `GET /api/questions/:questionId`와 같은 형식

**Errors**: `400 VALIDATION_ERROR`, `400 TAG_REQUIRED`, `400 TAG_LIMIT_EXCEEDED`, `400 ATTACHMENT_INVALID`

### GET `/api/questions/:questionId`

질문 상세(`/qna/questions/:id`). 조회수를 1 올립니다. 단, 같은 회원(비로그인은 IP)이 24시간 안에 다시 조회하면 올리지 않습니다.

**Response** `200`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "마인크래프트 주민 거래가 갱신되지 않아요",
    "body": "마인크래프트 자바 에디션 1.20.4 버전 싱글 플레이 중입니다. ...",
    "tags": ["마인크래프트", "주민거래", "버그_이슈", "자바에디션"],
    "attachments": [
      { "id": 31, "name": "error-screen.png", "url": "https://.../error-screen.png", "size": 1468006, "kind": "image" }
    ],
    "author": { "id": 12, "nickname": "호야", "profileImageUrl": null },
    "viewCount": 238,
    "answerCount": 2,
    "isAccepted": true,
    "isEdited": false,
    "isMine": false,
    "createdAt": "2026-11-10T05:22:00.000Z",
    "updatedAt": "2026-11-10T05:22:00.000Z"
  }
}
```

- `isMine`: 로그인한 회원이 작성자인지 (수정/삭제 버튼 노출용)
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
  "attachmentIds": [31, 32, 40],
  "editReason": "latest.log 디버그 파일 추가"
}
```

- 규칙은 등록과 같습니다. `editReason`은 선택, 최대 200자.
- `attachmentIds`를 보내면 그 목록으로 **교체**합니다. (빠진 파일은 연결 해제)
- 수정되면 `isEdited`가 `true`가 됩니다.

**Response** `200`: `GET /api/questions/:questionId`와 같은 형식

**Errors**: `400 VALIDATION_ERROR`, `403 FORBIDDEN` (작성자 아님), `404 QUESTION_NOT_FOUND`

### DELETE `/api/questions/:questionId`

**Response** `204`

**Errors**: `403 FORBIDDEN`, `404 QUESTION_NOT_FOUND`, `409 QUESTION_HAS_ANSWERS` (답변이 1개 이상이면 삭제 불가)

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
| 필수 | PATCH | `/api/answers/:answerId` | 답변 수정 | 필수 (작성자) | #74 |
| 필수 | DELETE | `/api/answers/:answerId` | 답변 삭제 | 필수 (작성자) | #74 |
| 필수 | POST | `/api/answers/:answerId/accept` | 답변 채택 | 필수 (질문 작성자) | #75 |
| 필수 | POST | `/api/answers/:answerId/votes` | 답변 추천 | 필수 | #76 |
| 필수 | DELETE | `/api/answers/:answerId/votes` | 답변 추천 취소 | 필수 | #76 |

### Answer 객체

```json
{
  "id": 8941,
  "questionId": 1,
  "body": "주민이 거래를 갱신하려면 두 가지 조건이 반드시 충족되어야 합니다: ...",
  "attachments": [],
  "author": { "id": 30, "nickname": "흐야", "profileImageUrl": null },
  "voteCount": 22,
  "isVoted": false,
  "isAccepted": true,
  "isEdited": false,
  "isMine": false,
  "canAccept": false,
  "createdAt": "2026-11-12T14:23:23.000Z",
  "updatedAt": "2026-11-12T14:23:23.000Z"
}
```

- `isVoted`, `isMine`, `canAccept`: 로그인하지 않았으면 `false`
- `canAccept`: 채택 버튼 노출 여부. 아래를 **모두** 만족할 때만 `true`
  - 로그인한 회원이 질문 작성자
  - 이 답변이 본인 답변이 아님
  - 질문에 채택된 답변이 아직 없음
- 프론트엔드는 `canAccept`가 `false`면 채택 버튼을 **표시하지 않습니다**. (비활성화가 아니라 숨김)

### GET `/api/questions/:questionId/answers`

**Query**

| 이름 | 기본값 | 설명 |
| --- | --- | --- |
| `sort` | `votes` | `votes`(추천순) / `latest`(최신순). 어느 쪽이든 **채택된 답변이 맨 위** |

페이지네이션 없이 전체를 반환합니다.

**Response** `200`: `Answer[]`

**Errors**: `404 QUESTION_NOT_FOUND`

### GET `/api/answers`

회원이 쓴 답변 목록 (프로필 "답변" 탭). 질문 상세의 답변 목록과 달리 여러 질문에 걸친 답변을 모아 봅니다.

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
{ "body": "답변 내용 (Markdown)", "attachmentIds": [] }
```

| 필드 | 규칙 |
| --- | --- |
| `body` | 필수, 1~5000자 |
| `attachmentIds` | 선택 |

**Response** `201`: `Answer`

**Errors**: `400 VALIDATION_ERROR`, `404 QUESTION_NOT_FOUND`

### GET `/api/answers/:answerId`

답변 수정 화면(`/qna/questions/:id/answers/:answerId/edit`). 화면 상단의 원본 질문 요약은 `GET /api/questions/:questionId`로 조회합니다.

**Response** `200`: `Answer`

**Errors**: `404 ANSWER_NOT_FOUND`

### PATCH `/api/answers/:answerId`

**Request**

```json
{ "body": "수정된 답변", "attachmentIds": [50], "editReason": "독서대 재설치 팁 보강" }
```

- `editReason`은 선택, 최대 200자
- 채택된 답변도 수정할 수 있습니다.

**Response** `200`: `Answer`

**Errors**: `400 VALIDATION_ERROR`, `403 FORBIDDEN`, `404 ANSWER_NOT_FOUND`

### DELETE `/api/answers/:answerId`

**Response** `204`

**Errors**: `403 FORBIDDEN`, `404 ANSWER_NOT_FOUND`, `409 ANSWER_ALREADY_ACCEPTED` (채택된 답변은 삭제 불가)

### POST `/api/answers/:answerId/accept`

질문 작성자만 호출할 수 있고, 질문당 1개만 채택할 수 있습니다. 채택은 취소할 수 없습니다.

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

추천 취소. 화면의 추천 버튼이 토글이므로, 취소 후 상태를 함께 돌려주기 위해 `204` 대신 `200`으로 응답합니다.

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
| 생성 | 질문 등록·수정 시 없는 태그는 자동 생성. 관리자는 태그 관리에서 직접 생성 |

```text
허용: 마인크래프트, 버그_이슈, 자바에디션, league-of-legends, elden-ring, 1-20-4
불가: 리그 오브 레전드 (공백), 1.20.4 (`.`), c++ (`+`)
```

규칙에 맞지 않으면 `400 VALIDATION_ERROR`로 응답합니다.

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
| 필수 | POST | `/api/attachments` | 파일 업로드 (질문·답변·신고 증빙) | 필수 |
| 필수 | DELETE | `/api/attachments/:attachmentId` | 아직 글에 연결되지 않은 파일 삭제 | 필수 (업로드한 회원) |

파일을 먼저 올리고, 받은 `id`를 질문/답변/신고 등록 요청의 `attachmentIds`에 넣는 방식입니다. 24시간 동안 어떤 글에도 연결되지 않은 파일은 서버가 정리합니다.

### POST `/api/attachments`

**Request**: `multipart/form-data`

| 필드 | 설명 |
| --- | --- |
| `file` | 필수, 파일 1개 |
| `purpose` | 필수, `post_content`(질문·답변) / `report_evidence`(신고 증빙) |

| purpose | 허용 형식 | 최대 크기 |
| --- | --- | --- |
| `post_content` | PNG, JPG, GIF, LOG, TXT | 20MB |
| `report_evidence` | PNG, JPG, WEBP | 10MB |

**Response** `201`: `Attachment`

**Errors**: `400 FILE_TYPE_NOT_ALLOWED`, `400 FILE_TOO_LARGE`

### DELETE `/api/attachments/:attachmentId`

**Response** `204`

**Errors**: `403 FORBIDDEN`, `404 ATTACHMENT_NOT_FOUND`, `409 ATTACHMENT_IN_USE` (이미 글에 연결됨 → 글 수정으로 빼야 함)

---

## 7. 자유게시판

| 우선 | Method | Path | 설명 | 인증 | WBS |
| --- | --- | --- | --- | --- | --- |
| 필수 | GET | `/api/posts` | 게시글 목록 (검색·정렬·페이징) | 선택 | #65 #68 #69 #70 |
| 필수 | POST | `/api/posts` | 게시글 작성 | 필수 | #64 |
| 필수 | GET | `/api/posts/:postId` | 게시글 상세 (조회수 증가) | 선택 | #65 |
| 필수 | PATCH | `/api/posts/:postId` | 게시글 수정 | 필수 (작성자) | #66 |
| 필수 | DELETE | `/api/posts/:postId` | 게시글 삭제 | 필수 (작성자) | #66 |
| 필수 | GET | `/api/posts/:postId/comments` | 댓글 목록 | 선택 | #67 |
| 필수 | POST | `/api/posts/:postId/comments` | 댓글 작성 | 필수 | #67 |
| 필수 | DELETE | `/api/comments/:commentId` | 댓글 삭제 | 필수 (작성자) | #67 |

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
| `authorId` | - | 이 회원이 쓴 게시글만 (내 게시글, 프로필 작성 목록) |

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
  "body": "내용",
  "links": ["https://youtu.be/sample-gameplay-highlight"]
}
```

| 필드 | 규칙 |
| --- | --- |
| `title` | 필수, 1~80자 |
| `body` | 필수, 1자 이상 |
| `links` | 선택, 최대 5개, `http(s)://` URL |

**Response** `201`: `GET /api/posts/:postId`와 같은 형식

**Errors**: `400 VALIDATION_ERROR`

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
    "links": ["https://guide.game-community.com/build/hoya-v2"],
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

**Errors**: `400 VALIDATION_ERROR`, `403 FORBIDDEN`, `404 POST_NOT_FOUND`

### DELETE `/api/posts/:postId`

**Response** `204`. 댓글도 함께 삭제됩니다.

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

**Errors**: `400 VALIDATION_ERROR`, `404 POST_NOT_FOUND`

### DELETE `/api/comments/:commentId`

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

신고 사유는 Q&A 화면과 관리자 화면 모두 위 7종을 사용합니다.

### POST `/api/reports`

신고 화면(`/qna/questions/:id/report`).

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
- 같은 회원이 같은 대상을 `pending` 상태로 두 번 신고할 수 없습니다.
- 다른 회원들이 같은 대상을 신고하면 관리자 화면에서 `duplicateCount`로 묶어 보여줍니다.

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

신고 완료 화면의 "접수 취소 (10초)". `pending` 상태이고 접수 후 10초 안에만 취소할 수 있습니다.

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

모든 API는 `ADMIN` 권한이 필요합니다 (#55). 회원 정지, 숨김, 삭제, 태그 병합, 신고 처리 등 **상태를 바꾸는 관리자 API는 모두 활동 로그를 남깁니다** (#63).

URL은 명사 복수형으로 쓰고 동작은 HTTP Method로 나타냅니다. 정지·해제, 숨김·복구, 신고 처리·반려처럼 상태를 바꾸는 작업은 `PATCH`로 상태 값을 보냅니다.

| 우선 | Method | Path | 설명 | WBS |
| --- | --- | --- | --- | --- |
| 필수 | GET | `/api/admin/stats` | 대시보드 현황 (`trend`, `topTags`는 선택) | #56 |
| 필수 | GET | `/api/admin/users` | 회원 목록 | #57 |
| 필수 | GET | `/api/admin/users/:userId` | 회원 상세 | #57 |
| 필수 | PATCH | `/api/admin/users/:userId` | 회원 정지 / 정지 해제 | #57 |
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

- 관리자 API는 모두 28개입니다. 태그 병합은 태그 삭제와 같은 경로에 `mergeInto`를 붙여 호출하지만 따로 셉니다.
- 권한 변경(USER ↔ ADMIN)은 이번 범위에서 제외합니다.

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
| `status` | - | `active` / `suspended`, 생략 시 전체 |
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
      "status": "suspended",
      "suspendedUntil": "2026-12-01T00:00:00.000Z",
      "createdAt": "2026-11-15T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "size": 20, "totalCount": 1248 }
}
```

- `suspendedUntil`: 정지 상태일 때만 값이 있고, 아니면 `null`

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
    "status": "suspended",
    "suspendedUntil": "2026-11-20T01:20:00.000Z",
    "createdAt": "2026-10-01T00:00:00.000Z",
    "activity": { "questionCount": 12, "answerCount": 40, "reportsReceivedCount": 3 },
    "sanctionHistory": [
      {
        "type": "suspend",
        "days": 7,
        "reason": "신고 처리: 욕설·비하 (신고 #12)",
        "admin": { "id": 1, "nickname": "운영자01", "profileImageUrl": null },
        "createdAt": "2026-11-13T01:20:00.000Z"
      },
      {
        "type": "unsuspend",
        "days": null,
        "reason": "오처리 정정",
        "admin": { "id": 1, "nickname": "운영자01", "profileImageUrl": null },
        "createdAt": "2026-11-12T09:05:00.000Z"
      }
    ]
  }
}
```

- `sanctionHistory`: 최신순

**Errors**: `404 USER_NOT_FOUND`

#### PATCH `/api/admin/users/:userId`

회원 정지와 정지 해제를 `status` 값으로 구분합니다.

**Request**

```json
// 정지
{ "status": "suspended", "days": 7, "reason": "욕설 및 비하 발언 반복" }

// 정지 해제
{ "status": "active", "reason": "오처리 정정" }
```

| 필드 | 규칙 |
| --- | --- |
| `status` | 필수, `suspended` / `active` |
| `days` | `status`가 `suspended`일 때 필수, `3` / `7` / `30`. `active`일 때는 보내지 않음 |
| `reason` | 필수, 1~200자 |

- 정지는 `SUSPEND_USER`, 해제는 `UNSUSPEND_USER`로 활동 로그와 회원 정지 이력에 남깁니다.

**Response** `200`: 회원 상세와 같은 형식

**Errors**: `400 VALIDATION_ERROR`, `403 CANNOT_SANCTION_ADMIN`, `404 USER_NOT_FOUND`, `409 USER_ALREADY_SUSPENDED` (정지 중인 회원 정지), `409 USER_NOT_SUSPENDED` (정지 상태가 아닌 회원 해제)

### 10.3 질문/답변 관리

숨김/복구 Request는 질문·답변·게시글·댓글 모두 같은 형식입니다.

```json
{ "isHidden": true, "reason": "스팸 광고" }
```

| 필드 | 규칙 |
| --- | --- |
| `isHidden` | 필수, `true`(숨김) / `false`(복구) |
| `reason` | 선택, 최대 200자 (활동 로그에 기록) |

#### GET `/api/admin/questions`

**Query**

| 이름 | 설명 |
| --- | --- |
| `page`, `size` | |
| `keyword` | 제목 또는 작성자 닉네임 |
| `tag` | 태그 이름 |
| `visibility` | `public` / `hidden`, 생략 시 전체 |

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
      "isHidden": true,
      "createdAt": "2026-11-16T04:02:00.000Z"
    }
  ],
  "meta": { "page": 1, "size": 20, "totalCount": 45890 }
}
```

#### PATCH `/api/admin/questions/:questionId`

질문 숨김/복구. Request는 위 숨김/복구 형식입니다.

**Response** `200`: 목록 항목 1개

**Errors**: `400 VALIDATION_ERROR`, `404 QUESTION_NOT_FOUND`

#### DELETE `/api/admin/questions/:questionId`

관리자는 답변이 있는 질문도 삭제할 수 있습니다. 답변도 함께 삭제됩니다.

**Response** `204`

**Errors**: `404 QUESTION_NOT_FOUND`

#### GET `/api/admin/answers`

**Query**

| 이름 | 설명 |
| --- | --- |
| `page`, `size` | |
| `keyword` | 본문 또는 작성자 닉네임 |
| `visibility` | `public` / `hidden`, 생략 시 전체 |

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
      "isHidden": true,
      "createdAt": "2026-11-16T04:30:00.000Z"
    }
  ],
  "meta": { "page": 1, "size": 20, "totalCount": 128402 }
}
```

- `preview`: 답변 본문 앞 60자

#### PATCH `/api/admin/answers/:answerId`

답변 숨김/복구. Request는 위 숨김/복구 형식입니다.

**Response** `200`: 목록 항목 1개

**Errors**: `400 VALIDATION_ERROR`, `404 ANSWER_NOT_FOUND`

#### DELETE `/api/admin/answers/:answerId`

채택된 답변을 삭제하면 질문의 채택 상태도 해제합니다.

**Response** `204`

**Errors**: `404 ANSWER_NOT_FOUND`

### 10.4 자유게시판 관리

#### GET `/api/admin/posts`

**Query**: `page`, `size`, `keyword`(제목 또는 작성자 닉네임), `visibility`

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
      "isHidden": false,
      "createdAt": "2026-11-14T07:30:00.000Z"
    }
  ],
  "meta": { "page": 1, "size": 20, "totalCount": 3240 }
}
```

#### PATCH `/api/admin/posts/:postId`

게시글 숨김/복구. Request는 [10.3](#103-질문답변-관리)의 숨김/복구 형식입니다.

```json
{ "isHidden": true, "reason": "욕설 포함" }
```

**Response** `200`: 목록 항목 1개

**Errors**: `400 VALIDATION_ERROR`, `404 POST_NOT_FOUND`

#### DELETE `/api/admin/posts/:postId`

댓글도 함께 삭제됩니다.

**Response** `204`

**Errors**: `404 POST_NOT_FOUND`

#### GET `/api/admin/comments`

**Query**: `page`, `size`, `keyword`(내용 또는 작성자 닉네임), `visibility`

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
      "isHidden": false,
      "createdAt": "2026-11-15T00:12:00.000Z"
    }
  ],
  "meta": { "page": 1, "size": 20, "totalCount": 18520 }
}
```

- `preview`: 댓글 내용 앞 60자
- 댓글은 숨김/복구만 하고, 관리자 삭제 API는 두지 않습니다.

#### PATCH `/api/admin/comments/:commentId`

댓글 숨김/복구. Request는 [10.3](#103-질문답변-관리)의 숨김/복구 형식입니다.

```json
{ "isHidden": true, "reason": "허위 정보" }
```

**Response** `200`: 목록 항목 1개

**Errors**: `400 VALIDATION_ERROR`, `404 COMMENT_NOT_FOUND`

### 10.5 태그 관리

**AdminTag 객체**

```json
{
  "id": 3,
  "name": "league-of-legends",
  "description": "리그 오브 레전드 관련 질문",
  "questionCount": 4120,
  "createdAt": "2026-01-02T00:00:00.000Z"
}
```

#### GET `/api/admin/tags`

**Query**: `page`, `size`, `keyword`(이름 부분 일치), `sort` = `usage_desc`(기본) / `name_asc` / `recent`

**Response** `200`: `AdminTag[]` + `meta`

#### POST `/api/admin/tags`

**Request**

```json
{ "name": "league-of-legends", "description": "리그 오브 레전드 관련 질문" }
```

- `name`: 필수, [5.1 태그 이름 규칙](#51-태그-이름-규칙)을 따름
- `description`: 선택, 최대 100자

**Response** `201`: `AdminTag`

**Errors**: `400 VALIDATION_ERROR`, `409 TAG_DUPLICATED`

#### PATCH `/api/admin/tags/:tagId`

**Request**: `POST`와 같은 필드 (보낸 필드만 수정)

**Response** `200`: `AdminTag`

**Errors**: `400 VALIDATION_ERROR`, `404 TAG_NOT_FOUND`, `409 TAG_DUPLICATED`

#### DELETE `/api/admin/tags/:tagId`

질문에서 사용 중인 태그도 삭제할 수 있습니다. 태그와 질문의 연결만 끊고 질문은 남깁니다.

- 프론트엔드는 삭제 확인 창에 목록의 `questionCount`로 "질문 N건에서 이 태그가 빠집니다."를 보여 줍니다.

**Response** `204`

**Errors**: `404 TAG_NOT_FOUND`

#### DELETE `/api/admin/tags/:tagId?mergeInto=:targetTagId`

태그 병합 (선택). `:tagId` 태그(원본)를 `mergeInto` 태그(대상)로 합칩니다. 원본을 쓰던 질문은 대상 태그로 옮겨지고(이미 대상 태그가 있으면 중복 제거), 원본 태그는 삭제됩니다.

```http
DELETE /api/admin/tags/9?mergeInto=3
```

- 활동 로그에는 `DELETE_TAG`가 아니라 `MERGE_TAG`로 남깁니다.

**Response** `200`: 병합 후 대상 태그(`AdminTag`)

**Errors**: `400 TAG_MERGE_SAME`, `404 TAG_NOT_FOUND` (원본 또는 대상 없음)

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
  "createdAt": "2026-11-16T05:02:00.000Z",
  "processedAt": null
}
```

- `duplicateCount`: 같은 대상에 대한 `pending` 신고 수 (자기 자신 포함)
- `preview`: 대상 본문 앞 60자
- 신고 대상이 삭제됐으면 `preview`, `fullText`, `targetAuthor`는 `null`입니다. 프론트엔드는 "삭제된 콘텐츠"로 표시합니다.

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
{ "status": "resolved", "hideTarget": true, "sanction": "ban_7" }

// 반려
{ "status": "rejected" }
```

| 필드 | 규칙 |
| --- | --- |
| `status` | 필수, `resolved` / `rejected` |
| `hideTarget` | `resolved`일 때 필수, 신고 대상 숨김 여부 |
| `sanction` | `resolved`일 때 필수, `none` / `ban_3` / `ban_7` / `ban_30` (대상 작성자 정지) |

- 같은 대상에 대한 다른 `pending` 신고도 함께 같은 상태로 바꿉니다.
- `sanction`이 `none`이 아니면 회원 정지 이력에 `신고 처리: <사유> (신고 #id)`로 남깁니다.
- 신고 대상이 이미 삭제됐으면 `hideTarget`·`sanction`은 무시하고 신고 상태만 `resolved`로 바꿉니다.
- 활동 로그에는 `RESOLVE_REPORT` / `REJECT_REPORT`로 남깁니다.

**Response** `200`: `AdminReport`

**Errors**: `400 VALIDATION_ERROR` (`status` 값 오류 등), `404 REPORT_NOT_FOUND`, `409 REPORT_ALREADY_PROCESSED`

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

- `title`: 필수, 1~100자 / `body`: 필수 / `isPinned`: 선택, 기본 `false`

**Response** `201`: `Notice`

**Errors**: `400 VALIDATION_ERROR`

#### PATCH `/api/admin/notices/:noticeId`

**Request**: `POST`와 같은 필드 (보낸 필드만 수정)

**Response** `200`: `Notice`

**Errors**: `400 VALIDATION_ERROR`, `404 NOTICE_NOT_FOUND`

#### DELETE `/api/admin/notices/:noticeId`

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

| action | 그룹 | 설명 |
| --- | --- | --- |
| `SUSPEND_USER` | - | 회원 정지 |
| `UNSUSPEND_USER` | - | 정지 해제 |
| `HIDE_QUESTION` / `HIDE_ANSWER` / `HIDE_POST` / `HIDE_COMMENT` | `HIDE` | 숨김 |
| `RESTORE_QUESTION` / `RESTORE_ANSWER` / `RESTORE_POST` / `RESTORE_COMMENT` | `RESTORE` | 숨김 복구 |
| `DELETE_QUESTION` / `DELETE_ANSWER` / `DELETE_POST` | `DELETE` | 삭제 |
| `CREATE_TAG` / `UPDATE_TAG` / `DELETE_TAG` | - | 태그 변경 |
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
- 화면의 이동 링크(`/admin/members/4` 등)는 `targetType`, `targetId`로 프론트엔드에서 만듭니다.

---

## 11. 결정 필요 사항

### 11.1 미정 / 범위 제외 항목

미정 항목은 아래 **기본안**으로 본문을 작성했습니다. 다르게 정하면 이 문서를 먼저 고칩니다. 확정된 항목은 표에서 지우고 본문에 반영합니다. (ID는 다시 매기지 않습니다.)

| ID | 항목 | 현재 상황 | 기본안 |
| --- | --- | --- | --- |
| D-4 | 로그인 상태 비밀번호 변경 | 화면에 "현재 비밀번호" 입력란 없음. **일단 현 상태 유지** | 보안을 위해 `currentPassword` 필수. 프론트엔드에 입력란 추가 필요 |
| D-8 | 레벨·경험치·매너온도 | 마이페이지·Q&A 화면에 표시 (레벨, EXP, 채택률, 매너온도, 응답률) | 이번 범위 제외. WBS #54 "차별화 기능"에서 정하면 추가 |
| D-11 | 질문 추천 | 질문 상세에 "추천" 버튼 있으나 WBS에 없음 | 이번 범위 제외 (답변 추천만 구현, #76) |
| D-13 | 게시글 카테고리 | 게시글 상세에 "공략" 카테고리 표시, 작성 화면에는 선택란 없음 | 이번 범위 제외 |
| D-14 | 알림 | 신고 결과·답변 알림 문구가 있음 | 이번 범위 제외 |

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
| 400 | `ATTACHMENT_INVALID` | 없는 첨부파일 또는 남의 첨부파일 |
| 400 | `FILE_TYPE_NOT_ALLOWED` | 허용하지 않는 파일 형식 |
| 400 | `FILE_TOO_LARGE` | 파일 크기 초과 |
| 400 | `CANNOT_ACCEPT_OWN_ANSWER` | 자기 답변 채택 |
| 400 | `CANNOT_VOTE_OWN_ANSWER` | 자기 답변 추천 |
| 400 | `CANNOT_REPORT_OWN_CONTENT` | 자기 글 신고 |
| 401 | `UNAUTHORIZED` | 로그인 필요 / 토큰 만료 |
| 401 | `INVALID_CREDENTIALS` | 아이디 또는 비밀번호 불일치 |
| 403 | `FORBIDDEN` | 권한 없음 (작성자 아님, 관리자 아님) |
| 403 | `USER_SUSPENDED` | 정지된 회원 |
| 403 | `CANNOT_SANCTION_ADMIN` | 관리자 계정 정지 시도 |
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
| 409 | `ANSWER_ALREADY_ACCEPTED` | 채택된 답변 삭제 |
| 409 | `ALREADY_VOTED` | 이미 추천함 |
| 409 | `ATTACHMENT_IN_USE` | 글에 연결된 첨부파일 직접 삭제 |
| 409 | `REPORT_DUPLICATED` | 같은 대상 중복 신고 |
| 409 | `REPORT_CANCEL_EXPIRED` | 신고 취소 가능 시간 지남 |
| 409 | `REPORT_ALREADY_PROCESSED` | 이미 처리된 신고 |
| 409 | `USER_ALREADY_SUSPENDED` | 이미 정지된 회원 |
| 409 | `USER_NOT_SUSPENDED` | 정지 상태가 아닌 회원 해제 |
| 409 | `TAG_DUPLICATED` | 태그 이름 중복 |
| 500 | `INTERNAL_SERVER_ERROR` | 서버 오류 |

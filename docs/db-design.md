# GAMERS DB 설계안 (MySQL 8)

- 상태: 초안 (2026-11-12)
- 근거: `docs/02-requirements.md`, `backend/docs/API_SPEC.md` (PR #83 `feature/requirements-api-sync` 기준)
- 문서에 정해지지 않은 규칙은 기본값을 정해 넣고 **(가정)**으로 표시했습니다. 팀 검토 후 확정합니다.
- SQL(DDL)은 이 설계가 확정된 뒤 작성합니다.

## 0. 공통 전제

| 항목 | 설계 | 이유 |
| --- | --- | --- |
| 문자셋 | `utf8mb4` / `utf8mb4_0900_ai_ci` | 한글·이모지 저장. `_ci`라서 "대소문자 구분 없이 비교" 규칙이 DB에서 바로 지켜짐 |
| 길이 단위 | `VARCHAR(n)`의 n은 **글자 수** | 명세의 "2~12자"를 그대로 옮길 수 있음 |
| 이름 규칙 | 테이블은 복수형 `snake_case`, 컬럼은 `snake_case` | API는 camelCase이므로 Repository에서 변환 |
| PK | `BIGINT UNSIGNED AUTO_INCREMENT` (가정) | 예시 ID가 12만 건대, 로그·조회 기록 테이블은 빠르게 늘어남 |
| 시간 | `DATETIME(3)`, UTC로 저장 | API가 ISO 8601 UTC를 밀리초까지(`.000Z`) 사용 |
| Boolean | `TINYINT(1)`, 컬럼명은 `is_` 접두어 | 코드 컨벤션의 Boolean 규칙 |
| Enum 값 | `VARCHAR` + `CHECK` 제약 | 명세가 role을 "문자열 enum"으로 정함. 나중에 `MODERATOR` 등을 추가하기 쉬움 |
| 숨김 | `is_hidden` + `hidden_at` | 관리자 숨김/복구 (REQ-ADMIN-008의 soft delete) |
| 삭제 | 글은 **물리 삭제** (가정) | 명세가 숨김(복구 가능)과 영구 삭제를 따로 둠. 영구 삭제는 되돌릴 필요가 없음 |
| 회원 | **물리 삭제하지 않음** | 소프트 탈퇴로 확정됨. 그래서 users를 참조하는 FK는 모두 `RESTRICT` |

### 0.1 미정 규칙에 넣은 기본값 (가정)

| 미정 항목 | 설계에 넣은 값 |
| --- | --- |
| email / password 최대 길이 | 255 / 해시를 `VARCHAR(255)`에 저장 (bcrypt는 60자이지만 알고리즘을 바꿀 여지를 둠) |
| 질문·게시글·공지 본문 최대 길이 | 10,000자, `TEXT` 타입 (10,000자 × 4바이트가 TEXT 한도 64KB 안에 들어감) |
| 탈퇴 회원의 아이디·닉네임 | 계속 점유하고 재사용 불가 (탈퇴 회원 사칭 방지) |
| 질문당 채택 1개 | `questions.accepted_answer_id` |
| pending 신고 중복 방지 | 생성 컬럼 + UNIQUE 조합 (2.12 참고) |
| 신고 접수번호 | 저장하지 않고 `created_at`과 `id`로 조회할 때 만듦 |
| 신고 접수 취소 | 물리 삭제 |
| 영구정지 | `status='suspended'` + `suspended_until IS NULL`. 기간이 끝났는지는 조회할 때 계산 |
| 태그 병합이 연쇄될 때 | B를 C로 합치면 B를 가리키던 태그도 C를 가리키게 바꿔 항상 한 단계만 따라가게 함 |
| editReason | 마지막 값만 컬럼에 저장 (수정 이력 테이블 없음) |
| 게시글 링크 | `JSON` 컬럼 (최대 5개, 링크로 검색하지 않음) |
| 첨부 연결 방식 | 부모별 nullable FK 컬럼 + `ON DELETE SET NULL` |
| 집계 값 | 컬럼에 저장하고 숨김·복구·삭제할 때 함께 갱신 |
| 조회수 중복 방지 | `content_views` 테이블 (현재 기술 스택에 Redis 없음) |

## 1. 테이블 목록과 관계

| 테이블 | 용도 | 주요 관계 |
| --- | --- | --- |
| `users` | 회원 | (기준 테이블) |
| `password_reset_tokens` | 비밀번호 재설정 토큰 | users 1:N |
| `user_sanctions` | 정지·해제 이력 | users 1:N (대상), users 1:N (처리한 관리자), reports 1:N |
| `questions` | 질문 | users 1:N, answers 1:1 (채택된 답변) |
| `answers` | 답변 | questions 1:N, users 1:N |
| `answer_votes` | 답변 추천 | answers N:M users |
| `tags` | 태그 | tags 1:N (자기 참조, 병합 대상) |
| `question_tags` | 질문-태그 연결 | questions N:M tags |
| `posts` | 자유게시판 글 | users 1:N |
| `comments` | 댓글 | posts 1:N, users 1:N |
| `attachments` | 첨부파일 | users 1:N, questions·answers·reports 1:N |
| `reports` | 신고 | users 1:N (신고자), 대상은 다형 참조 (FK 없음) |
| `notices` | 공지 | users 1:N |
| `admin_activity_logs` | 관리자 활동 로그 | users 1:N, 대상은 다형 참조 (FK 없음) |
| `content_views` | 조회수 중복 방지 기록 | 대상은 다형 참조 (FK 없음) |

### 1.1 FK 삭제 동작

| FK | ON DELETE | 이유 |
| --- | --- | --- |
| users를 참조하는 모든 FK | RESTRICT | 회원은 물리 삭제하지 않음. 실수로 지우려 해도 DB가 막음 |
| answers.question_id, comments.post_id | CASCADE | 관리자가 질문을 지우면 답변도, 게시글을 지우면 댓글도 함께 삭제 (명세 규칙) |
| answer_votes.answer_id, question_tags.question_id | CASCADE | 부모가 없어지면 의미 없는 연결 데이터 |
| questions.accepted_answer_id | SET NULL | 채택된 답변을 관리자가 지우면 채택 해제 (명세 규칙)를 DB가 처리 |
| attachments.question_id / answer_id / report_id | SET NULL | 행을 바로 지우면 실제 파일이 남음. 연결이 끊긴 첨부는 "24시간 미연결 정리" 배치가 파일까지 삭제 |
| question_tags.tag_id, tags.merged_into_id | RESTRICT | 태그는 지우지 않고 `blocked` 처리 |
| user_sanctions.report_id | SET NULL | 신고가 지워져도 정지 이력은 남겨야 함 |

> CASCADE로 지워질 때는 앱 코드가 실행되지 않습니다. `tags.question_count` 같은 집계 값은 **삭제하기 전에 앱에서 먼저 갱신**해야 합니다.

## 2. 테이블별 설계

### 2.1 `users`

| 컬럼 | 타입 | NULL | 제약/기본값 | 설명 |
| --- | --- | --- | --- | --- |
| id | BIGINT UNSIGNED | N | PK | |
| username | VARCHAR(20) | N | UNIQUE | 4~20자, 영문 소문자·숫자·`_` |
| password_hash | VARCHAR(255) | Y | | 탈퇴하면 NULL |
| name | VARCHAR(20) | Y | | 실명. 탈퇴하면 NULL |
| nickname | VARCHAR(12) | N | UNIQUE | 2~12자 |
| email | VARCHAR(255) | Y | UNIQUE | 탈퇴하면 NULL (UNIQUE에도 NULL은 여러 개 가능) |
| role | VARCHAR(20) | N | `'USER'`, CHECK | `USER` / `ADMIN` (추후 `MODERATOR`) |
| status | VARCHAR(20) | N | `'active'`, CHECK | `active` / `suspended` / `withdrawn` |
| suspended_until | DATETIME(3) | Y | | 기간 정지일 때만 값 있음. `suspended`인데 NULL이면 영구정지 |
| profile_image_url | VARCHAR(500) | Y | | |
| bio | VARCHAR(200) | Y | | |
| withdrawn_at | DATETIME(3) | Y | | 탈퇴 시각 |
| created_at / updated_at | DATETIME(3) | N | | |

| 인덱스 | 컬럼 | 이유 |
| --- | --- | --- |
| UNIQUE | username | 중복 확인, 아이디로 로그인 |
| UNIQUE | nickname | 중복 확인 |
| UNIQUE | email | 중복 확인, 이메일로 로그인, 아이디 찾기 |
| INDEX | (status, created_at) | 관리자 회원 목록의 상태 필터와 가입일 정렬 |
| INDEX | (role) | 관리자 선택 목록 (`role=ADMIN`) |
| INDEX | (created_at) | 대시보드의 오늘 가입 수와 7일 추이 |

### 2.2 `password_reset_tokens`

| 컬럼 | 타입 | NULL | 제약 | 설명 |
| --- | --- | --- | --- | --- |
| id | BIGINT UNSIGNED | N | PK | |
| user_id | BIGINT UNSIGNED | N | FK → users | |
| token_hash | CHAR(64) | N | UNIQUE | 토큰 원문이 아니라 SHA-256 해시 저장 (DB가 유출돼도 토큰을 쓸 수 없게) |
| expires_at | DATETIME(3) | N | | 발급 후 10분 |
| used_at | DATETIME(3) | Y | | 값이 있으면 이미 사용한 토큰 (1회만 사용) |
| created_at | DATETIME(3) | N | | |

| 인덱스 | 컬럼 | 이유 |
| --- | --- | --- |
| UNIQUE | token_hash | 재설정 요청 시 토큰으로 바로 조회 |
| INDEX | (user_id) | FK, 새 토큰 발급 시 이전 토큰 무효화 |

### 2.3 `user_sanctions`

| 컬럼 | 타입 | NULL | 제약 | 설명 |
| --- | --- | --- | --- | --- |
| id | BIGINT UNSIGNED | N | PK | |
| user_id | BIGINT UNSIGNED | N | FK → users | 정지 대상 |
| admin_id | BIGINT UNSIGNED | N | FK → users | 처리한 관리자 |
| type | VARCHAR(20) | N | CHECK | `suspend` / `unsuspend` |
| days | SMALLINT UNSIGNED | Y | | 3 / 7 / 30. 영구정지와 해제는 NULL |
| reason | VARCHAR(200) | N | | |
| report_id | BIGINT UNSIGNED | Y | FK → reports, SET NULL | 신고 처리로 정지된 경우 |
| created_at | DATETIME(3) | N | | |

| 인덱스 | 컬럼 | 이유 |
| --- | --- | --- |
| INDEX | (user_id, created_at) | 회원 상세의 정지 이력 (최신순) |

### 2.4 `questions`

| 컬럼 | 타입 | NULL | 제약/기본값 | 설명 |
| --- | --- | --- | --- | --- |
| id | BIGINT UNSIGNED | N | PK | |
| author_id | BIGINT UNSIGNED | N | FK → users | |
| title | VARCHAR(100) | N | | |
| body | TEXT | N | | 공백 제외 15자 이상, 최대 10,000자 (가정) |
| accepted_answer_id | BIGINT UNSIGNED | Y | FK → answers, SET NULL | 질문당 채택 1개를 구조로 보장 |
| answer_count | INT UNSIGNED | N | 0 | 숨김을 뺀 답변 수 |
| view_count | INT UNSIGNED | N | 0 | |
| is_hidden | TINYINT(1) | N | 0 | |
| hidden_at | DATETIME(3) | Y | | |
| is_edited | TINYINT(1) | N | 0 | |
| edit_reason | VARCHAR(200) | Y | | 마지막 수정 사유 |
| created_at / updated_at | DATETIME(3) | N | | |

| 인덱스 | 컬럼 | 이유 |
| --- | --- | --- |
| INDEX | (is_hidden, created_at) | 기본 목록 (숨김 제외, 최신순) |
| INDEX | (is_hidden, view_count) | 조회순 정렬 |
| INDEX | (author_id, created_at) | 프로필 작성 목록 (`authorId`) |
| INDEX | (accepted_answer_id) | FK, 채택 여부 필터 |
| FULLTEXT (선택) | (title) WITH PARSER ngram | 제목 부분 검색. `LIKE '%검색어%'`는 인덱스를 쓰지 못해 데이터가 많아지면 필요 |

`answers`와 서로 참조하므로 `accepted_answer_id` FK는 두 테이블을 만든 뒤 추가합니다.

### 2.5 `answers`

| 컬럼 | 타입 | NULL | 제약/기본값 | 설명 |
| --- | --- | --- | --- | --- |
| id | BIGINT UNSIGNED | N | PK | |
| question_id | BIGINT UNSIGNED | N | FK → questions, CASCADE | |
| author_id | BIGINT UNSIGNED | N | FK → users | |
| body | TEXT | N | | 1~5000자 |
| vote_count | INT UNSIGNED | N | 0 | 추천순 정렬용 |
| is_hidden / hidden_at | | | | questions와 같음 |
| is_edited / edit_reason | | | | questions와 같음 |
| created_at / updated_at | DATETIME(3) | N | | |

채택 여부는 컬럼을 따로 두지 않고 `questions.accepted_answer_id = answers.id`로 판단합니다. 같은 정보를 두 곳에 두면 어긋날 수 있기 때문입니다.

| 인덱스 | 컬럼 | 이유 |
| --- | --- | --- |
| INDEX | (question_id, is_hidden, vote_count) | 질문 상세의 답변 목록 (추천순), FK |
| INDEX | (author_id, created_at) | 프로필 답변 탭 (최신순) |

### 2.6 `answer_votes`

| 컬럼 | 타입 | NULL | 제약 | 설명 |
| --- | --- | --- | --- | --- |
| answer_id | BIGINT UNSIGNED | N | PK①, FK → answers, CASCADE | |
| user_id | BIGINT UNSIGNED | N | PK②, FK → users | |
| created_at | DATETIME(3) | N | | |

| 인덱스 | 컬럼 | 이유 |
| --- | --- | --- |
| PK | (answer_id, user_id) | 1인 1회 추천 보장 (`ALREADY_VOTED`), `isVoted` 조회 |
| INDEX | (user_id) | FK |

### 2.7 `tags`

| 컬럼 | 타입 | NULL | 제약/기본값 | 설명 |
| --- | --- | --- | --- | --- |
| id | BIGINT UNSIGNED | N | PK | |
| name | VARCHAR(30) | N | UNIQUE | 정규화한 값 (`#` 제거, 영문 소문자) |
| description | VARCHAR(100) | Y | | |
| status | VARCHAR(10) | N | `'active'`, CHECK | `active` / `blocked` |
| merged_into_id | BIGINT UNSIGNED | Y | FK → tags, RESTRICT | 병합으로 blocked된 경우 대상 태그 |
| question_count | INT UNSIGNED | N | 0 | 인기순 정렬, 삭제 확인 창 문구 |
| created_at / updated_at | DATETIME(3) | N | | |

| 인덱스 | 컬럼 | 이유 |
| --- | --- | --- |
| UNIQUE | name | blocked 태그까지 포함한 중복 방지, 앞부분 일치 자동완성 (`LIKE '마인%'`) |
| INDEX | (status, question_count) | 인기 태그 목록 (active만) |
| INDEX | (merged_into_id) | FK, 연쇄 병합 갱신 |

### 2.8 `question_tags`

| 컬럼 | 타입 | NULL | 제약 | 설명 |
| --- | --- | --- | --- | --- |
| question_id | BIGINT UNSIGNED | N | PK①, FK → questions, CASCADE | |
| tag_id | BIGINT UNSIGNED | N | PK②, FK → tags | |
| sort_order | TINYINT UNSIGNED | N | | 입력 순서. 목록에 `tags[0]`을 보여 주기 때문에 필요 |

| 인덱스 | 컬럼 | 이유 |
| --- | --- | --- |
| PK | (question_id, tag_id) | 같은 태그 중복 방지, 질문의 태그 조회 |
| INDEX | (tag_id, question_id) | 태그 필터, 관련 질문 (태그 겹침 수), 태그 병합 |

### 2.9 `posts`

| 컬럼 | 타입 | NULL | 제약/기본값 | 설명 |
| --- | --- | --- | --- | --- |
| id | BIGINT UNSIGNED | N | PK | |
| author_id | BIGINT UNSIGNED | N | FK → users | |
| title | VARCHAR(80) | N | | |
| body | TEXT | N | | 최대 10,000자 (가정) |
| links | JSON | Y | | URL 최대 5개, URL 하나는 최대 2048자 (앱에서 검증) |
| view_count / comment_count | INT UNSIGNED | N | 0 | `comment_count`는 숨김 제외 |
| is_hidden / hidden_at / is_edited | | | | questions와 같음 |
| created_at / updated_at | DATETIME(3) | N | | |

| 인덱스 | 컬럼 | 이유 |
| --- | --- | --- |
| INDEX | (is_hidden, created_at) | 목록 (최신순/오래된순 모두) |
| INDEX | (author_id, created_at) | 내 게시글, 프로필 게시글 탭 |
| FULLTEXT (선택) | (title) ngram | 제목 검색 |

### 2.10 `comments`

| 컬럼 | 타입 | NULL | 제약/기본값 | 설명 |
| --- | --- | --- | --- | --- |
| id | BIGINT UNSIGNED | N | PK | |
| post_id | BIGINT UNSIGNED | N | FK → posts, CASCADE | |
| author_id | BIGINT UNSIGNED | N | FK → users | |
| body | VARCHAR(500) | N | | |
| is_hidden / hidden_at | | | | |
| created_at / updated_at | DATETIME(3) | N | | |

| 인덱스 | 컬럼 | 이유 |
| --- | --- | --- |
| INDEX | (post_id, is_hidden, created_at) | 게시글의 댓글 목록 (오래된순), FK |
| INDEX | (author_id) | FK |

### 2.11 `attachments`

| 컬럼 | 타입 | NULL | 제약 | 설명 |
| --- | --- | --- | --- | --- |
| id | BIGINT UNSIGNED | N | PK | |
| uploader_id | BIGINT UNSIGNED | N | FK → users | 업로드한 사람만 삭제 가능 |
| purpose | VARCHAR(20) | N | CHECK | `post_content` / `report_evidence` |
| kind | VARCHAR(10) | N | CHECK | `image` / `log` |
| original_name | VARCHAR(255) | N | | |
| url | VARCHAR(500) | N | | |
| size_bytes | INT UNSIGNED | N | | 최대 20MB |
| question_id / answer_id / report_id | BIGINT UNSIGNED | Y | 각각 FK, SET NULL | 셋 중 하나만 값 있음 (CHECK). 모두 NULL이면 미연결 |
| created_at | DATETIME(3) | N | | |

| 인덱스 | 컬럼 | 이유 |
| --- | --- | --- |
| INDEX | (question_id), (answer_id), (report_id) | FK, 글의 첨부 목록 조회 |
| INDEX | (created_at) | 24시간 미연결 파일 정리 배치 |
| INDEX | (uploader_id) | FK |

다형 FK(`target_type` + `target_id`) 대신 nullable FK를 고른 이유: 실제 FK가 걸려 없는 글에 연결되는 일을 DB가 막아 줍니다.

### 2.12 `reports`

| 컬럼 | 타입 | NULL | 제약/기본값 | 설명 |
| --- | --- | --- | --- | --- |
| id | BIGINT UNSIGNED | N | PK | |
| reporter_id | BIGINT UNSIGNED | N | FK → users | |
| target_type | VARCHAR(10) | N | CHECK | `question` / `answer` / `post` / `comment` |
| target_id | BIGINT UNSIGNED | N | **FK 없음** | 대상이 삭제돼도 신고는 남아야 함 |
| target_author_id | BIGINT UNSIGNED | N | FK → users | 접수할 때 저장. 처리 시 정지 대상, 회원 상세의 받은 신고 수 |
| reason | VARCHAR(20) | N | CHECK | 7종 |
| detail | VARCHAR(1000) | Y | | `etc`면 필수 (앱에서 검증) |
| status | VARCHAR(10) | N | `'pending'`, CHECK | `pending` / `resolved` / `rejected` |
| pending_flag | TINYINT | Y | 생성 컬럼: `pending`이면 1, 아니면 NULL | 부분 UNIQUE 대체 |
| hide_target / sanction | TINYINT(1) / VARCHAR(20) | Y | | 처리 결과 |
| processed_by | BIGINT UNSIGNED | Y | FK → users | |
| processed_at | DATETIME(3) | Y | | |
| created_at | DATETIME(3) | N | | |

| 인덱스 | 컬럼 | 이유 |
| --- | --- | --- |
| UNIQUE | (reporter_id, target_type, target_id, pending_flag) | pending 신고만 중복 방지. 처리된 신고는 `pending_flag`가 NULL이라 걸리지 않아 반려 후 재신고 가능 |
| INDEX | (status, created_at) | 관리자 신고 목록 (기본 pending), 상태별 개수, 대시보드 |
| INDEX | (target_type, target_id, status) | `duplicateCount`, 같은 대상의 pending 신고 일괄 처리 |
| INDEX | (reporter_id, created_at) | 내 신고 내역 |
| INDEX | (target_author_id) | FK, 받은 신고 수 |

### 2.13 `notices`

| 컬럼 | 타입 | NULL | 제약/기본값 | 설명 |
| --- | --- | --- | --- | --- |
| id | BIGINT UNSIGNED | N | PK | |
| author_id | BIGINT UNSIGNED | N | FK → users | |
| title | VARCHAR(100) | N | | |
| body | TEXT | N | | |
| is_pinned | TINYINT(1) | N | 0 | |
| created_at / updated_at | DATETIME(3) | N | | |

| 인덱스 | 컬럼 | 이유 |
| --- | --- | --- |
| INDEX | (is_pinned, created_at) | "고정 공지 먼저, 그다음 최신순" 정렬, 헤더 롤링 5건 |

### 2.14 `admin_activity_logs`

| 컬럼 | 타입 | NULL | 제약 | 설명 |
| --- | --- | --- | --- | --- |
| id | BIGINT UNSIGNED | N | PK | |
| admin_id | BIGINT UNSIGNED | N | FK → users | 처리한 사람 (추후 MODERATOR도 그대로 사용) |
| action | VARCHAR(30) | N | | `SUSPEND_USER`, `HIDE_POST` 등 |
| target_type | VARCHAR(20) | N | | |
| target_id | BIGINT UNSIGNED | N | **FK 없음** | 대상이 삭제돼도 로그는 남아야 함 |
| target_label | VARCHAR(100) | N | | 기록할 때의 대상 이름 (예: "신고 #12") |
| detail | VARCHAR(500) | Y | | |
| created_at | DATETIME(3) | N | | |

추가만 하고 수정·삭제하지 않습니다 (가정). 앱에 UPDATE/DELETE 코드를 두지 않습니다.

| 인덱스 | 컬럼 | 이유 |
| --- | --- | --- |
| INDEX | (created_at) | 기본 목록, 기간 필터 |
| INDEX | (admin_id, created_at) | 관리자별 필터 |
| INDEX | (action, created_at) | action 필터. 그룹 필터 (`HIDE` → `LIKE 'HIDE_%'`)도 앞부분 일치라 이 인덱스 사용 |

### 2.15 `content_views`

| 컬럼 | 타입 | NULL | 제약 | 설명 |
| --- | --- | --- | --- | --- |
| id | BIGINT UNSIGNED | N | PK | |
| target_type | VARCHAR(10) | N | | `question` / `post` |
| target_id | BIGINT UNSIGNED | N | | |
| viewer_key | VARCHAR(64) | N | | 회원이면 `u:<id>`, 비회원이면 IP 해시 (IP 원문은 저장하지 않음) |
| viewed_at | DATETIME(3) | N | | 마지막으로 조회수가 오른 시각 |

| 인덱스 | 컬럼 | 이유 |
| --- | --- | --- |
| UNIQUE | (target_type, target_id, viewer_key) | 사람마다 행 하나. `viewed_at`이 24시간보다 오래됐을 때만 조회수를 올리고 시각 갱신 |
| INDEX | (viewed_at) | 오래된 기록 정리 배치 |

## 3. 따로 테이블을 두지 않은 것

| 기능 | 처리 방법 |
| --- | --- |
| 대시보드 KPI·추이·인기 태그 | users, questions, reports의 `created_at`·`status` 인덱스와 `tags.question_count`로 조회 |
| 질문 통계 (선택 기능) | questions와 answers에서 조회. 느리면 나중에 캐시 |
| 신고 접수번호 | `REP-` + `created_at` 날짜 + `id`로 조회할 때 만듦 |
| 관심 태그 상위 5개 | `question_tags` JOIN `questions` (`author_id`)로 집계 |

## 4. 확정 전 확인할 것

- (가정) 표시 항목 전체에 대한 팀 검토
- `feature/spec-gap-review` 브랜치는 "모든 삭제를 status 기반 소프트 삭제로 통일", "글쓰기·댓글 기능별 제한"을 결정했습니다. 그쪽으로 정해지면 모든 글 테이블에 `status` 또는 `deleted_at` 컬럼이 추가되고, CASCADE FK가 줄어들고, users에 제한 관련 컬럼이 추가됩니다.

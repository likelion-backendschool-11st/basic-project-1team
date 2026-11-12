# 요구사항 명세 · API 명세 비교 결과

- 작성일: 2026-11-12
- 비교 대상: `docs/02-requirements.md`, `backend/docs/API_SPEC.md`
- 기준 커밋: `ecbd663` (`feature/requirements-api-sync` 브랜치, 3차 수정 반영 후)
- 수정 내역은 [requirements-api-sync-changes.md](requirements-api-sync-changes.md) 참고

## 1. 서로 안 맞는 부분

세 차례 수정 후, 요구사항과 API 명세 사이에 내용이 다른 곳은 없습니다.

| 구분 | 항목 | 상태 |
| --- | --- | --- |
| 요구사항 문서 안 | 새로 추가한 요구사항 9개(REQ-MYPAGE-004·005, REQ-QNA-013~018, REQ-BOARD-010)의 담당자 칸이 비어 있음 | 팀에서 담당자를 정한 뒤 기입 |

## 2. DB 설계에 필요한데 정해지지 않은 규칙

이미 정해져서 표에서 뺀 것:

- 탈퇴는 소프트 탈퇴 (`status=withdrawn`, 개인정보 파기)
- 태그 삭제·병합은 `blocked` 처리, blocked 태그와 이름이 같으면 중복
- 숨김 답변은 `answerCount`에서 빼고, 질문 삭제 제한에는 포함

### 2.1 필드 길이

| 테이블.필드 | 현재 정해진 것 | 정해야 할 것 |
| --- | --- | --- |
| users.email | 이메일 형식만 | 최대 길이 (예: 255) |
| users.password | 8자 이상만 | 최대 길이 (bcrypt 72바이트 제한), 해시 컬럼 길이 |
| users.name / nickname / username | 1~20 / 2~12 / 4~20자 | 글자 수 기준인지 바이트 기준인지, DB 문자셋 (utf8mb4 등) |
| questions.body | 공백 제외 15자 이상만 | 최대 길이 (답변은 5000자) |
| posts.body, notices.body | 1자 이상 / 필수만 | 최대 길이 |
| posts.links | 최대 5개 | URL 하나의 최대 길이, 저장 방식(JSON 컬럼인지 별도 테이블인지) |
| profile_image_url, attachments.url, attachments.name | 없음 | 최대 길이 |
| editReason | 최대 200자 | 저장할 곳: 마지막 값만 컬럼에 둘지, 수정 이력 테이블을 둘지 |
| activity_logs.detail, target_label | 없음 | 최대 길이 |
| 숫자 PK | 없음 | INT / BIGINT 중 무엇을 쓸지 |

### 2.2 중복 불가 (UNIQUE)

| 대상 | 현재 정해진 것 | 정해야 할 것 |
| --- | --- | --- |
| users.username / nickname / email | 중복 불가, 대소문자 구분 없이 비교 | 대소문자 무시 collation을 쓸지 정규화 컬럼을 둘지. 탈퇴 회원의 아이디·닉네임을 계속 점유할지, 재사용할 수 있는지 (이메일은 파기되므로 NULL 허용 UNIQUE) |
| answer_votes (answer_id, user_id) | `ALREADY_VOTED`로 암시만 됨 | 복합 UNIQUE 명시 |
| question_tags (question_id, tag_id) | "중복 제거" | 복합 UNIQUE 명시 |
| 질문당 채택 1개 | 규칙은 있음 | `questions.accepted_answer_id`로 할지 `answers.is_accepted` + 제약으로 할지 |
| reports (신고자, 대상, pending) | pending일 때만 중복 불가 | 부분 UNIQUE가 필요함 (MySQL은 지원하지 않아 앱에서 검사하거나 생성 컬럼 사용). 반려된 뒤 다시 신고할 수 있는지 |
| reports.receipt_number | 형식 `REP-YYYYMMDD-id` | 컬럼으로 저장할지 조회할 때 만들지 |
| 조회수 중복 방지 | 회원/IP 기준 24시간 | 기록 테이블을 둘지 캐시를 쓸지, UNIQUE 키 구성 |
| 비밀번호 재설정 토큰 | 10분, 1회만 사용 | 저장 테이블을 둘지 JWT를 쓸지, 사용 여부 컬럼 |

### 2.3 삭제·상태 정책

| 대상 | 현재 정해진 것 | 정해야 할 것 |
| --- | --- | --- |
| 숨김 vs 삭제 | `isHidden`으로 숨김 | 숨김과 소프트 삭제(`deleted_at`)를 따로 둘지. REQ-ADMIN-008의 "영구 삭제"가 물리 삭제인지 |
| 질문·답변·게시글 삭제 | 작성자는 답변 없는 질문만 삭제, 관리자는 답변까지 함께 삭제, 게시글은 댓글도 함께 삭제 | 물리/소프트 여부. 추천·태그 연결·첨부·조회 기록을 CASCADE할지 |
| 댓글 삭제 (작성자, 관리자) | 둘 다 API 있음 | 물리 삭제할지, "삭제된 댓글입니다" 표시를 남길지 |
| 신고·활동 로그의 대상 | 대상이 삭제되면 `preview`를 null로 보냄 | 다형 대상(targetType + targetId)에 FK를 걸지 않는다는 것 명시 |
| 신고 접수 취소 | 10초 안, pending일 때만 | 물리 삭제할지 `cancelled` 상태를 추가할지 |
| 영구정지 저장 방식 | `status=suspended` + `suspendedUntil=null` | `is_permanent` 컬럼을 둘지 null을 영구로 해석할지. 기간 정지가 끝나면 `active`로 자동 전환하는 방식 (조회할 때 계산할지 배치로 바꿀지) |
| 태그 병합이 연쇄될 때 | 원본에 `merged_into_id` 기록 | A를 B로 합친 뒤 B를 C로 합치면 A의 대상을 C로 바꿀지. 자기 참조 FK에 대한 ON DELETE |
| 첨부파일 | 24시간 동안 미연결이면 정리 | 글이 삭제될 때 파일도 지울지, 프로필 사진을 바꿀 때 이전 파일 처리, 연결 구조 (다형 FK인지 연결 테이블인지) |
| 공지 삭제 | `DELETE` 204 | 물리/소프트 여부 |
| 정지 이력·활동 로그 | 남긴다 | 보존 기간, 삭제할 수 없게 할지 |
| 집계 값 | `answerCount`·`commentCount`는 숨김 제외, `voteCount`, 태그 `questionCount` | 컬럼에 저장해 두고 갱신할지 (숨김·복구·삭제할 때마다 함께 갱신), 조회할 때 COUNT할지 |

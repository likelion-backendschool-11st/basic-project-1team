-- =====================================================================
-- GAMERS DB 스키마 (MySQL 8.0.16 이상, CHECK 제약을 검사하는 버전)
--
-- 근거: docs/04-db-design.md (테이블 번호는 설계서 4장 번호)
-- 실행: 빈 DB에 한 번 실행합니다. 테이블이 이미 있으면 오류가 납니다.
--   DB·계정은 db/create-user.sql 로 먼저 만듭니다 (DB gamers_db, 계정 gamers).
--   mysql -u gamers -p gamers_db < db/schema.sql
--
-- - 문자셋·정렬 규칙은 모든 테이블에 utf8mb4 / utf8mb4_0900_as_cs 를 명시합니다.
--   (대소문자 구분, 명세 1.10. MySQL 기본값 ai_ci 는 대소문자를 구분하지 않음)
-- - 시각은 DATETIME(3) UTC 로 저장합니다. 기본값(CURRENT_TIMESTAMP)도 UTC 가 되도록
--   앱의 DB 연결은 time_zone = '+00:00' 으로 맞춥니다.
-- - 행을 지우지 않으므로(soft delete, 명세 1.7) 외래키는 모두 RESTRICT 입니다.
-- - target_type + target_id 다형 참조(신고, 첨부 연결, 조회 기록, 활동 로그)는 FK 를 걸 수 없어
--   대상 존재 여부를 앱에서 확인합니다.
-- - 상태·종류 값은 VARCHAR + CHECK 로 명세 Enum 값만 받습니다.
--   CHECK·외래키 이름은 DB 전체에서 겹치면 안 되므로 테이블 이름을 넣습니다.
-- =====================================================================

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- 4.1 users: 회원. 탈퇴하면 가입 정보를 NULL 로 비운 행으로 남는다
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username          VARCHAR(20)     NULL COMMENT '로그인 아이디. 탈퇴 시 NULL',
  email             VARCHAR(128)    NULL COMMENT '탈퇴 시 NULL',
  nickname          VARCHAR(16)     NULL COMMENT '탈퇴 시 NULL',
  name              VARCHAR(16)     NULL COMMENT '실명. 탈퇴 시 NULL',
  password_hash     VARCHAR(255)    NULL COMMENT 'Argon2id 해시. 탈퇴 시 NULL',
  profile_image_url VARCHAR(512)    NULL COMMENT '저장소 URL. 탈퇴 시 NULL',
  bio               VARCHAR(1000)   NULL COMMENT '소개글 HTML. 탈퇴 시 NULL',
  role              VARCHAR(10)     NOT NULL DEFAULT 'USER',
  status            VARCHAR(20)     NOT NULL DEFAULT 'active',
  withdrawn_at      DATETIME(3)     NULL,
  created_at        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '가입일',
  updated_at        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  -- NULL 은 unique 에 걸리지 않아 탈퇴 회원의 값을 다시 쓸 수 있다
  UNIQUE KEY uk_users_username (username),
  UNIQUE KEY uk_users_email (email),
  UNIQUE KEY uk_users_nickname (nickname),
  KEY idx_users_status_created (status, created_at),
  KEY idx_users_role_status (role, status),
  CONSTRAINT chk_users_role CHECK (role IN ('USER', 'ADMIN')),
  CONSTRAINT chk_users_status CHECK (status IN ('active', 'withdrawn'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '회원';

-- ---------------------------------------------------------------------
-- 4.2 user_permissions: 관리자가 준 추가 권한. 회수하면 revoked, 다시 주면 같은 행을 active 로
-- ---------------------------------------------------------------------
CREATE TABLE user_permissions (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  permission VARCHAR(32)     NOT NULL,
  status     VARCHAR(20)     NOT NULL DEFAULT 'active',
  granted_by BIGINT UNSIGNED NOT NULL COMMENT '권한을 준 관리자',
  granted_at DATETIME(3)     NOT NULL,
  revoked_by BIGINT UNSIGNED NULL,
  revoked_at DATETIME(3)     NULL,
  created_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_permissions (user_id, permission),
  KEY idx_user_permissions_granted_by (granted_by),
  KEY idx_user_permissions_revoked_by (revoked_by),
  CONSTRAINT fk_user_permissions_user FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_user_permissions_granted_by FOREIGN KEY (granted_by) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_user_permissions_revoked_by FOREIGN KEY (revoked_by) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_user_permissions_permission CHECK (permission IN ('content_manage')),
  CONSTRAINT chk_user_permissions_status CHECK (status IN ('active', 'revoked'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '회원 추가 권한';

-- ---------------------------------------------------------------------
-- 4.4 password_reset_tokens: 비밀번호 재설정 토큰 (10분, 1회). 원문 대신 SHA-256 해시
-- ---------------------------------------------------------------------
CREATE TABLE password_reset_tokens (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64)        NOT NULL COMMENT 'resetToken 의 SHA-256',
  expires_at DATETIME(3)     NOT NULL,
  used_at    DATETIME(3)     NULL COMMENT '값이 있으면 다시 쓸 수 없음',
  created_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_password_reset_tokens_hash (token_hash),
  KEY idx_password_reset_tokens_user (user_id),
  CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '비밀번호 재설정 토큰';

-- ---------------------------------------------------------------------
-- 4.5 questions: 질문. answerCount·isAccepted 는 answers 로 계산한다
-- ---------------------------------------------------------------------
CREATE TABLE questions (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  author_id  BIGINT UNSIGNED NOT NULL,
  title      VARCHAR(100)    NOT NULL,
  body       MEDIUMTEXT      NOT NULL COMMENT '본문 HTML. 저장 최대 100,000자',
  view_count INT UNSIGNED    NOT NULL DEFAULT 0,
  status     VARCHAR(20)     NOT NULL DEFAULT 'active',
  hidden_at  DATETIME(3)     NULL,
  deleted_at DATETIME(3)     NULL,
  edited_at  DATETIME(3)     NULL COMMENT '제목·본문·태그 마지막 수정. NULL 이면 수정 안 함',
  created_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_questions_status_created (status, created_at),
  KEY idx_questions_status_views (status, view_count),
  KEY idx_questions_author_status_created (author_id, status, created_at),
  CONSTRAINT fk_questions_author FOREIGN KEY (author_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_questions_status CHECK (status IN ('active', 'hidden', 'deleted'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '질문';

-- ---------------------------------------------------------------------
-- 4.6 question_edit_histories: 질문 수정 이력 (시각·수정자·사유만, 수정 전 본문은 저장 안 함)
-- ---------------------------------------------------------------------
CREATE TABLE question_edit_histories (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  question_id BIGINT UNSIGNED NOT NULL,
  editor_id   BIGINT UNSIGNED NOT NULL COMMENT '작성자 또는 content_manage 회원',
  edit_reason VARCHAR(200)    NULL,
  edited_at   DATETIME(3)     NOT NULL COMMENT 'questions.edited_at 과 같은 값',
  created_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_question_edit_histories_question (question_id, edited_at),
  KEY idx_question_edit_histories_editor (editor_id),
  CONSTRAINT fk_question_edit_histories_question FOREIGN KEY (question_id) REFERENCES questions (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_question_edit_histories_editor FOREIGN KEY (editor_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '질문 수정 이력';

-- ---------------------------------------------------------------------
-- 4.7 answers: 답변. 질문당 채택 1개는 앱이 질문 행을 잠그고 검사한다(명세 1.10)
-- ---------------------------------------------------------------------
CREATE TABLE answers (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  question_id BIGINT UNSIGNED NOT NULL,
  author_id   BIGINT UNSIGNED NOT NULL,
  body        MEDIUMTEXT      NOT NULL COMMENT '본문 HTML. 저장 최대 100,000자',
  is_accepted TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '관리자가 숨기거나 삭제하면 0 으로 풀림',
  accepted_at DATETIME(3)     NULL,
  status      VARCHAR(20)     NOT NULL DEFAULT 'active',
  hidden_at   DATETIME(3)     NULL,
  deleted_at  DATETIME(3)     NULL,
  edited_at   DATETIME(3)     NULL,
  created_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_answers_question_status_accepted (question_id, status, is_accepted),
  KEY idx_answers_author_status_created (author_id, status, created_at, question_id),
  KEY idx_answers_status_created (status, created_at),
  KEY idx_answers_accepted_at (accepted_at),
  CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES questions (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_answers_author FOREIGN KEY (author_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_answers_status CHECK (status IN ('active', 'hidden', 'deleted'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '답변';

-- ---------------------------------------------------------------------
-- 4.8 answer_edit_histories: 답변 수정 이력 (question_edit_histories 와 같은 구조)
-- ---------------------------------------------------------------------
CREATE TABLE answer_edit_histories (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  answer_id   BIGINT UNSIGNED NOT NULL,
  editor_id   BIGINT UNSIGNED NOT NULL COMMENT '작성자 또는 content_manage 회원',
  edit_reason VARCHAR(200)    NULL,
  edited_at   DATETIME(3)     NOT NULL COMMENT 'answers.edited_at 과 같은 값',
  created_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_answer_edit_histories_answer (answer_id, edited_at),
  KEY idx_answer_edit_histories_editor (editor_id),
  CONSTRAINT fk_answer_edit_histories_answer FOREIGN KEY (answer_id) REFERENCES answers (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_answer_edit_histories_editor FOREIGN KEY (editor_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '답변 수정 이력';

-- ---------------------------------------------------------------------
-- 4.9 answer_votes: 답변 추천. 취소하면 canceled, 다시 추천하면 같은 행을 active 로
-- ---------------------------------------------------------------------
CREATE TABLE answer_votes (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  answer_id  BIGINT UNSIGNED NOT NULL,
  user_id    BIGINT UNSIGNED NOT NULL COMMENT '추천한 회원',
  status     VARCHAR(20)     NOT NULL DEFAULT 'active',
  created_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_answer_votes (answer_id, user_id),
  KEY idx_answer_votes_answer_status (answer_id, status),
  KEY idx_answer_votes_user (user_id),
  CONSTRAINT fk_answer_votes_answer FOREIGN KEY (answer_id) REFERENCES answers (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_answer_votes_user FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_answer_votes_status CHECK (status IN ('active', 'canceled'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '답변 추천';

-- ---------------------------------------------------------------------
-- 4.10 tags: 태그. 이름은 상태와 관계없이 1개 (차단·병합된 이름도 다시 만들 수 없음)
-- ---------------------------------------------------------------------
CREATE TABLE tags (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name           VARCHAR(30)     NOT NULL COMMENT '정규화한 이름 (# 제거, 영문 소문자)',
  description    VARCHAR(100)    NULL,
  status         VARCHAR(20)     NOT NULL DEFAULT 'active',
  merged_into_id BIGINT UNSIGNED NULL COMMENT 'merged 일 때 병합 대상 태그',
  blocked_at     DATETIME(3)     NULL,
  merged_at      DATETIME(3)     NULL,
  created_by     BIGINT UNSIGNED NULL COMMENT '질문 작성 중 자동 생성이면 그 회원, 아니면 관리자',
  created_at     DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at     DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_tags_name (name),
  KEY idx_tags_status (status, name),
  KEY idx_tags_merged_into (merged_into_id),
  KEY idx_tags_created_by (created_by),
  CONSTRAINT fk_tags_merged_into FOREIGN KEY (merged_into_id) REFERENCES tags (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_tags_created_by FOREIGN KEY (created_by) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_tags_status CHECK (status IN ('active', 'blocked', 'merged'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '태그';

-- ---------------------------------------------------------------------
-- 4.11 question_tags: 질문-태그 연결. 끊긴 행도 unique 에 포함되므로
--      연결은 INSERT ... ON DUPLICATE KEY UPDATE deleted_at = NULL 로 넣는다
-- ---------------------------------------------------------------------
CREATE TABLE question_tags (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  question_id BIGINT UNSIGNED NOT NULL,
  tag_id      BIGINT UNSIGNED NOT NULL,
  deleted_at  DATETIME(3)     NULL COMMENT '연결 해제 시각 (질문 수정, 태그 차단·병합)',
  created_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_question_tags (question_id, tag_id),
  KEY idx_question_tags_tag (tag_id, deleted_at, question_id),
  CONSTRAINT fk_question_tags_question FOREIGN KEY (question_id) REFERENCES questions (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_question_tags_tag FOREIGN KEY (tag_id) REFERENCES tags (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '질문-태그 연결';

-- ---------------------------------------------------------------------
-- 4.12 attachments: 업로드한 파일 (에디터 이미지, 신고 증빙). URL 을 그대로 저장
-- ---------------------------------------------------------------------
CREATE TABLE attachments (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  uploader_id   BIGINT UNSIGNED NOT NULL,
  purpose       VARCHAR(20)     NOT NULL,
  kind          VARCHAR(10)     NOT NULL,
  original_name VARCHAR(15)     NOT NULL COMMENT '15자 넘으면 확장자 유지하고 줄여 저장',
  url           VARCHAR(512)    NOT NULL COMMENT '저장소 URL',
  mime_type     VARCHAR(100)    NOT NULL,
  size          INT UNSIGNED    NOT NULL COMMENT '바이트 (최대 10MB)',
  status        VARCHAR(20)     NOT NULL DEFAULT 'active',
  deleted_at    DATETIME(3)     NULL COMMENT '이때 저장소 파일도 지움',
  created_at    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  -- 글 저장 시 본문 <img src> 의 URL 로 파일을 찾는다. 512자 utf8mb4 = 2,048바이트로 인덱스 한도(3,072) 안
  UNIQUE KEY uk_attachments_url (url),
  KEY idx_attachments_status_created (status, created_at),
  KEY idx_attachments_uploader (uploader_id),
  CONSTRAINT fk_attachments_uploader FOREIGN KEY (uploader_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_attachments_purpose CHECK (purpose IN ('editor_image', 'report_evidence')),
  CONSTRAINT chk_attachments_kind CHECK (kind IN ('image')),
  CONSTRAINT chk_attachments_status CHECK (status IN ('active', 'deleted'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '첨부파일';

-- ---------------------------------------------------------------------
-- 4.13 attachment_links: 첨부파일-글 연결. 에디터 이미지는 여러 글에 연결될 수 있고,
--      신고 증빙은 신고 1건에만 연결한다(앱 검사). target 은 다형 참조라 FK 없음
-- ---------------------------------------------------------------------
CREATE TABLE attachment_links (
  id            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  attachment_id BIGINT UNSIGNED  NOT NULL,
  target_type   VARCHAR(20)      NOT NULL,
  target_id     BIGINT UNSIGNED  NOT NULL,
  sort_order    TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '신고 증빙 순서. 에디터 이미지는 0',
  deleted_at    DATETIME(3)      NULL COMMENT '연결 해제 시각 (글 수정에서 뺌, 글 삭제)',
  created_at    DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_attachment_links_target (target_type, target_id, deleted_at),
  KEY idx_attachment_links_attachment (attachment_id, deleted_at),
  CONSTRAINT fk_attachment_links_attachment FOREIGN KEY (attachment_id) REFERENCES attachments (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_attachment_links_target_type
    CHECK (target_type IN ('question', 'answer', 'post', 'notice', 'report'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '첨부파일-글 연결';

-- ---------------------------------------------------------------------
-- 4.14 posts: 자유게시판 게시글
-- ---------------------------------------------------------------------
CREATE TABLE posts (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  author_id  BIGINT UNSIGNED NOT NULL,
  title      VARCHAR(80)     NOT NULL,
  body       MEDIUMTEXT      NOT NULL COMMENT '본문 HTML. 저장 최대 100,000자',
  view_count INT UNSIGNED    NOT NULL DEFAULT 0,
  status     VARCHAR(20)     NOT NULL DEFAULT 'active',
  hidden_at  DATETIME(3)     NULL,
  deleted_at DATETIME(3)     NULL,
  edited_at  DATETIME(3)     NULL COMMENT '마지막 수정 시각. isEdited 계산',
  created_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_posts_status_created (status, created_at),
  KEY idx_posts_author_status_created (author_id, status, created_at),
  CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_posts_status CHECK (status IN ('active', 'hidden', 'deleted'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '자유게시판 게시글';

-- ---------------------------------------------------------------------
-- 4.15 comments: 자유게시판 댓글 (수정 API 가 없어 edited_at 없음)
-- ---------------------------------------------------------------------
CREATE TABLE comments (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  post_id    BIGINT UNSIGNED NOT NULL,
  author_id  BIGINT UNSIGNED NOT NULL,
  body       VARCHAR(500)    NOT NULL COMMENT '일반 텍스트',
  status     VARCHAR(20)     NOT NULL DEFAULT 'active',
  hidden_at  DATETIME(3)     NULL,
  deleted_at DATETIME(3)     NULL,
  created_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_comments_post_status_created (post_id, status, created_at),
  KEY idx_comments_status_created (status, created_at),
  KEY idx_comments_author (author_id),
  CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_comments_status CHECK (status IN ('active', 'hidden', 'deleted'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '자유게시판 댓글';

-- ---------------------------------------------------------------------
-- 4.16 reports: 신고. target 은 다형 참조라 FK 없음.
--      같은 회원·같은 대상 pending 중복은 앱이 신고자 행을 잠그고 검사한다
-- ---------------------------------------------------------------------
CREATE TABLE reports (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reporter_id      BIGINT UNSIGNED NOT NULL,
  target_type      VARCHAR(20)     NOT NULL,
  target_id        BIGINT UNSIGNED NOT NULL,
  target_author_id BIGINT UNSIGNED NOT NULL COMMENT '신고 시점의 대상 작성자',
  reason           VARCHAR(20)     NOT NULL,
  detail           VARCHAR(1000)   NULL COMMENT 'reason = etc 이면 앱에서 필수 검사',
  status           VARCHAR(20)     NOT NULL DEFAULT 'pending',
  hide_target      TINYINT(1)      NULL COMMENT '처리할 때 고른 대상 숨김 여부',
  processed_by     BIGINT UNSIGNED NULL COMMENT '처리·반려한 관리자',
  processed_at     DATETIME(3)     NULL,
  canceled_at      DATETIME(3)     NULL COMMENT '신고자 접수 취소 시각',
  created_at       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_reports_target_status (target_type, target_id, status),
  KEY idx_reports_reporter_target (reporter_id, target_type, target_id, status),
  KEY idx_reports_reporter_created (reporter_id, created_at),
  KEY idx_reports_status_created (status, created_at),
  KEY idx_reports_target_author (target_author_id),
  KEY idx_reports_processed_by (processed_by),
  CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_reports_target_author FOREIGN KEY (target_author_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_reports_processed_by FOREIGN KEY (processed_by) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_reports_target_type CHECK (target_type IN ('question', 'answer', 'post', 'comment')),
  CONSTRAINT chk_reports_reason
    CHECK (reason IN ('spam', 'abuse', 'illegal', 'spoiler', 'misinformation', 'privacy', 'etc')),
  CONSTRAINT chk_reports_status CHECK (status IN ('pending', 'resolved', 'rejected', 'canceled'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '신고';

-- ---------------------------------------------------------------------
-- 4.3 user_sanctions: 회원 제재 1건 = 1행 (제재·해제 이력 겸용). reports 를 참조해 여기서 만든다.
--     걸려 있는 제재 = released_at IS NULL AND (ends_at IS NULL OR ends_at > 현재)
-- ---------------------------------------------------------------------
CREATE TABLE user_sanctions (
  id             BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id        BIGINT UNSIGNED  NOT NULL COMMENT '제재 대상',
  type           VARCHAR(20)      NOT NULL,
  days           TINYINT UNSIGNED NULL COMMENT '3 / 7 / 30, NULL 이면 영구',
  reason         VARCHAR(200)     NOT NULL COMMENT '신고 처리면 "신고 처리: <사유> (신고 #id)"',
  starts_at      DATETIME(3)      NOT NULL,
  ends_at        DATETIME(3)      NULL COMMENT 'starts_at + days. NULL 이면 영구',
  applied_by     BIGINT UNSIGNED  NOT NULL COMMENT '제재한 관리자',
  report_id      BIGINT UNSIGNED  NULL COMMENT '신고 처리로 건 제재일 때',
  released_at    DATETIME(3)      NULL COMMENT '관리자가 해제한 시각. 기간 만료는 기록하지 않음',
  released_by    BIGINT UNSIGNED  NULL,
  release_reason VARCHAR(200)     NULL,
  created_at     DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at     DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_user_sanctions_active (user_id, type, released_at, ends_at),
  KEY idx_user_sanctions_user_created (user_id, created_at),
  KEY idx_user_sanctions_status_filter (type, released_at, ends_at),
  KEY idx_user_sanctions_applied_by (applied_by),
  KEY idx_user_sanctions_released_by (released_by),
  KEY idx_user_sanctions_report (report_id),
  CONSTRAINT fk_user_sanctions_user FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_user_sanctions_applied_by FOREIGN KEY (applied_by) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_user_sanctions_released_by FOREIGN KEY (released_by) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_user_sanctions_report FOREIGN KEY (report_id) REFERENCES reports (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_user_sanctions_type CHECK (type IN ('suspend', 'write_ban', 'comment_ban')),
  CONSTRAINT chk_user_sanctions_days CHECK (days IN (3, 7, 30))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '회원 제재';

-- ---------------------------------------------------------------------
-- 4.17 notices: 공지
-- ---------------------------------------------------------------------
CREATE TABLE notices (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  author_id  BIGINT UNSIGNED NOT NULL COMMENT '작성한 관리자',
  title      VARCHAR(100)    NOT NULL,
  body       MEDIUMTEXT      NOT NULL COMMENT '본문 HTML. 저장 최대 100,000자',
  is_pinned  TINYINT(1)      NOT NULL DEFAULT 0,
  status     VARCHAR(20)     NOT NULL DEFAULT 'active',
  deleted_at DATETIME(3)     NULL,
  created_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_notices_status_pinned_created (status, is_pinned, created_at),
  KEY idx_notices_author (author_id),
  CONSTRAINT fk_notices_author FOREIGN KEY (author_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_notices_status CHECK (status IN ('active', 'deleted'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '공지';

-- ---------------------------------------------------------------------
-- 4.18 view_histories: 조회수 중복 방지 (대상·조회자별 1행, 마지막 조회 시각만 갱신)
-- ---------------------------------------------------------------------
CREATE TABLE view_histories (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  target_type    VARCHAR(20)     NOT NULL,
  target_id      BIGINT UNSIGNED NOT NULL,
  viewer_key     VARCHAR(50)     NOT NULL COMMENT '회원이면 u:<회원 id>, 비로그인이면 ip:<IP 주소>',
  last_viewed_at DATETIME(3)     NOT NULL COMMENT '마지막으로 조회수를 올린 시각',
  created_at     DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at     DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_view_histories (target_type, target_id, viewer_key),
  CONSTRAINT chk_view_histories_target_type CHECK (target_type IN ('question', 'post'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '조회 기록';

-- ---------------------------------------------------------------------
-- 4.19 activity_logs: 관리자 활동 로그 (5년 지나면 expired). action 은 명세 10.8 목록
-- ---------------------------------------------------------------------
CREATE TABLE activity_logs (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_id     BIGINT UNSIGNED NOT NULL COMMENT '관리자 또는 content_manage 회원',
  action       VARCHAR(32)     NOT NULL,
  target_type  VARCHAR(20)     NOT NULL,
  target_id    BIGINT UNSIGNED NOT NULL,
  target_label VARCHAR(16)     NOT NULL COMMENT '<종류> #<id> (예: 질문 #128)',
  detail       VARCHAR(256)    NULL COMMENT '사유·처리 요약. 넘으면 잘라서 저장',
  status       VARCHAR(20)     NOT NULL DEFAULT 'active',
  expired_at   DATETIME(3)     NULL,
  created_at   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_activity_logs_status_created (status, created_at),
  KEY idx_activity_logs_admin_created (admin_id, created_at),
  KEY idx_activity_logs_action_created (action, created_at),
  KEY idx_activity_logs_target (target_type, target_id),
  CONSTRAINT fk_activity_logs_admin FOREIGN KEY (admin_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_activity_logs_action CHECK (action IN (
    'SANCTION_USER', 'RELEASE_SANCTION',
    'GRANT_PERMISSION', 'REVOKE_PERMISSION',
    'MODERATE_EDIT', 'MODERATE_DELETE',
    'HIDE_QUESTION', 'HIDE_ANSWER', 'HIDE_POST', 'HIDE_COMMENT',
    'RESTORE_QUESTION', 'RESTORE_ANSWER', 'RESTORE_POST', 'RESTORE_COMMENT',
    'DELETE_QUESTION', 'DELETE_ANSWER', 'DELETE_POST', 'DELETE_COMMENT',
    'CREATE_TAG', 'UPDATE_TAG', 'DELETE_TAG', 'RESTORE_TAG', 'MERGE_TAG',
    'RESOLVE_REPORT', 'REJECT_REPORT',
    'CREATE_NOTICE', 'UPDATE_NOTICE', 'DELETE_NOTICE'
  )),
  CONSTRAINT chk_activity_logs_target_type
    CHECK (target_type IN ('user', 'question', 'answer', 'post', 'comment', 'tag', 'report', 'notice')),
  CONSTRAINT chk_activity_logs_status CHECK (status IN ('active', 'expired'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '관리자 활동 로그';

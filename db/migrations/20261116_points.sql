-- =====================================================================
-- 포인트·등급 기능(D-8) 추가: 이미 db/schema.sql 로 만든 로컬 DB에 한 번 실행합니다.
--   mysql -u gamers -p gamers_db < db/migrations/20261116_points.sql
-- 새로 만드는 DB는 db/schema.sql 에 이미 들어 있으므로 실행하지 않습니다.
-- 근거: docs/04-db-design.md 4.1, 4.20 / API 명세 11장
-- =====================================================================

SET NAMES utf8mb4;

ALTER TABLE users
  ADD COLUMN points INT UNSIGNED NOT NULL DEFAULT 0
    COMMENT '현재 포인트. point_histories 와 같은 트랜잭션에서 변경' AFTER status,
  ADD KEY idx_users_points (points);

-- ---------------------------------------------------------------------
-- 4.20 point_histories: 포인트 지급·차감 내역 (명세 11장). 지급 1건 = 1행, 고치거나 지우지 않는다
--     grant_key 로 같은 이유의 중복 지급을 막는다 (예: daily_visit:2026-11-16, answer_accepted:<답변 id>)
-- ---------------------------------------------------------------------
CREATE TABLE point_histories (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  reason      VARCHAR(20)     NOT NULL,
  amount      INT             NOT NULL COMMENT '지급 +, 차감 -',
  target_type VARCHAR(20)     NULL COMMENT 'question / answer / report. 하루 첫 접속은 NULL',
  target_id   BIGINT UNSIGNED NULL,
  grant_key   VARCHAR(64)     NOT NULL COMMENT '중복 지급 방지 키',
  detail      VARCHAR(100)    NULL COMMENT '차감 내용 요약',
  created_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_point_histories_grant (user_id, grant_key),
  KEY idx_point_histories_user_created (user_id, created_at),
  KEY idx_point_histories_user_reason (user_id, reason),
  CONSTRAINT fk_point_histories_user FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_point_histories_reason CHECK (reason IN (
    'daily_visit', 'question_create', 'accept_give', 'answer_accepted', 'report_penalty'
  )),
  CONSTRAINT chk_point_histories_target_type
    CHECK (target_type IS NULL OR target_type IN ('question', 'answer', 'report')),
  CONSTRAINT chk_point_histories_amount CHECK (amount <> 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '포인트 내역';

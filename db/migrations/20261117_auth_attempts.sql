-- =====================================================================
-- 시도 횟수 제한 기록 추가: 이미 db/schema.sql 로 만든 로컬 DB에 한 번 실행합니다.
--   mysql -u gamers -p gamers_db < db/migrations/20261117_auth_attempts.sql
-- 새로 만드는 DB는 db/schema.sql 에 이미 들어 있으므로 실행하지 않습니다.
-- 근거: docs/04-db-design.md 4.26 / API 명세 1.11, 1.7
-- =====================================================================

SET NAMES utf8mb4;

CREATE TABLE auth_attempts (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  scope           VARCHAR(32)     NOT NULL,
  key_hash        CHAR(64)        NOT NULL COMMENT '세는 기준 값(IP·loginId·회원 id)의 SHA-256',
  attempt_count   INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '실패 수 + 확인 중인 요청 수',
  last_attempt_at DATETIME(3)     NOT NULL,
  locked_until    DATETIME(3)     NULL COMMENT '잠금이 풀리는 시각',
  created_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_auth_attempts_scope_key (scope, key_hash),
  CONSTRAINT chk_auth_attempts_scope
    CHECK (scope IN ('login', 'find_username', 'password_reset_verify', 'current_password'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_bin COMMENT = '시도 횟수 제한 기록' /*T![auto_id_cache] AUTO_ID_CACHE = 1 */;

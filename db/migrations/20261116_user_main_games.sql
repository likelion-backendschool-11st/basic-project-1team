-- =====================================================================
-- 주력 게임 추가 (회원 주력 게임 테이블): 이미 db/schema.sql 로 만든 로컬 DB에 한 번 실행합니다.
--   mysql -u gamers -p gamers_db < db/migrations/20261116_user_main_games.sql
-- 새로 만드는 DB는 db/schema.sql 에 이미 들어 있으므로 실행하지 않습니다.
-- 근거: docs/04-db-design.md 4.24 / API 명세 2장 GET·PATCH /api/users/me
-- =====================================================================

SET NAMES utf8mb4;

CREATE TABLE user_main_games (
  id         BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED  NOT NULL,
  tag_id     BIGINT UNSIGNED  NOT NULL,
  sort_order TINYINT UNSIGNED NOT NULL COMMENT '고른 순서 (0부터)',
  deleted_at DATETIME(3)      NULL COMMENT '뺀 시각. NULL 이면 지금 주력 게임',
  created_at DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_main_games (user_id, tag_id),
  KEY idx_user_main_games_tag (tag_id),
  CONSTRAINT fk_user_main_games_user FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_user_main_games_tag FOREIGN KEY (tag_id) REFERENCES tags (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '회원 주력 게임';

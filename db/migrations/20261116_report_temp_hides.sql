-- =====================================================================
-- 긴급 신고 임시 숨김 추가: 이미 db/schema.sql 로 만든 로컬 DB에 한 번 실행합니다.
--   mysql -u gamers -p gamers_db < db/migrations/20261116_report_temp_hides.sql
-- 새로 만드는 DB는 db/schema.sql 에 이미 들어 있으므로 실행하지 않습니다.
-- 근거: docs/04-db-design.md 4.24 / API 명세 8장 POST /api/reports, 10.3, 10.6
-- =====================================================================

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- 4.24 report_temp_hides: 긴급 신고 임시 숨김 (명세 8장). 대상 하나에 active 는 최대 1행.
--   처리자가 없어 활동 로그 대신 여기 남긴다. target 은 다형 참조라 FK 없음
-- ---------------------------------------------------------------------
CREATE TABLE report_temp_hides (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  target_type VARCHAR(20)     NOT NULL,
  target_id   BIGINT UNSIGNED NOT NULL,
  status      VARCHAR(20)     NOT NULL DEFAULT 'active',
  ended_by    BIGINT UNSIGNED NULL COMMENT '확정·해제한 관리자',
  ended_at    DATETIME(3)     NULL,
  created_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_report_temp_hides_target (target_type, target_id, status),
  KEY idx_report_temp_hides_ended_by (ended_by),
  CONSTRAINT fk_report_temp_hides_ended_by FOREIGN KEY (ended_by) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_report_temp_hides_target_type
    CHECK (target_type IN ('question', 'answer', 'post', 'comment')),
  CONSTRAINT chk_report_temp_hides_status CHECK (status IN ('active', 'confirmed', 'released'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '긴급 신고 임시 숨김';

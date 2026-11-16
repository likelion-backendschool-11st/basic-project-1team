-- =====================================================================
-- 태그 병합 취소 추가 (병합 이력 테이블, 활동 로그 UNMERGE_TAG): 이미 db/schema.sql 로 만든 로컬 DB에 한 번 실행합니다.
--   mysql -u gamers -p gamers_db < db/migrations/20261116_tag_unmerge.sql
-- 새로 만드는 DB는 db/schema.sql 에 이미 들어 있으므로 실행하지 않습니다.
-- 근거: docs/04-db-design.md 4.22, 4.23 / API 명세 10.5 PATCH /api/admin/tags/:tagId, 10.8
-- 이 마이그레이션 전에 한 병합은 기록이 없어 병합 취소할 수 없습니다.
-- =====================================================================

SET NAMES utf8mb4;

-- 활동 로그 action 에 UNMERGE_TAG 추가 (CHECK 는 고칠 수 없어 지우고 다시 만든다)
ALTER TABLE activity_logs DROP CHECK chk_activity_logs_action;
ALTER TABLE activity_logs ADD CONSTRAINT chk_activity_logs_action CHECK (action IN (
  'SANCTION_USER', 'RELEASE_SANCTION',
  'GRANT_PERMISSION', 'REVOKE_PERMISSION',
  'MODERATE_EDIT', 'MODERATE_DELETE',
  'HIDE_QUESTION', 'HIDE_ANSWER', 'HIDE_POST', 'HIDE_COMMENT',
  'RESTORE_QUESTION', 'RESTORE_ANSWER', 'RESTORE_POST', 'RESTORE_COMMENT',
  'DELETE_QUESTION', 'DELETE_ANSWER', 'DELETE_POST', 'DELETE_COMMENT',
  'CREATE_TAG', 'UPDATE_TAG', 'DELETE_TAG', 'RESTORE_TAG', 'MERGE_TAG', 'UNMERGE_TAG',
  'RESOLVE_REPORT', 'REJECT_REPORT',
  'CREATE_NOTICE', 'UPDATE_NOTICE', 'DELETE_NOTICE'
));

-- ---------------------------------------------------------------------
-- 4.22 tag_merges: 태그 병합 1건 = 1행 (명세 10.5). 병합 취소하면 undone. 원본 태그 하나에 active 는 최대 1행
-- ---------------------------------------------------------------------
CREATE TABLE tag_merges (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  source_tag_id BIGINT UNSIGNED NOT NULL COMMENT '병합된 원본 태그',
  target_tag_id BIGINT UNSIGNED NOT NULL COMMENT '병합 대상 태그',
  merged_by     BIGINT UNSIGNED NOT NULL COMMENT '병합한 관리자',
  status        VARCHAR(20)     NOT NULL DEFAULT 'active',
  undone_by     BIGINT UNSIGNED NULL COMMENT '병합을 취소한 관리자',
  undone_at     DATETIME(3)     NULL,
  created_at    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_tag_merges_source_status (source_tag_id, status),
  KEY idx_tag_merges_target (target_tag_id),
  KEY idx_tag_merges_merged_by (merged_by),
  KEY idx_tag_merges_undone_by (undone_by),
  CONSTRAINT fk_tag_merges_source FOREIGN KEY (source_tag_id) REFERENCES tags (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_tag_merges_target FOREIGN KEY (target_tag_id) REFERENCES tags (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_tag_merges_merged_by FOREIGN KEY (merged_by) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_tag_merges_undone_by FOREIGN KEY (undone_by) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_tag_merges_status CHECK (status IN ('active', 'undone'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '태그 병합 이력';

-- ---------------------------------------------------------------------
-- 4.23 tag_merge_questions: 병합할 때 옮긴 질문 (병합 취소에 씀)
-- ---------------------------------------------------------------------
CREATE TABLE tag_merge_questions (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  merge_id        BIGINT UNSIGNED NOT NULL,
  question_id     BIGINT UNSIGNED NOT NULL,
  is_target_added TINYINT(1)      NOT NULL COMMENT '병합 때문에 대상 태그를 새로 붙였으면 1',
  created_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_tag_merge_questions (merge_id, question_id),
  KEY idx_tag_merge_questions_question (question_id),
  CONSTRAINT fk_tag_merge_questions_merge FOREIGN KEY (merge_id) REFERENCES tag_merges (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_tag_merge_questions_question FOREIGN KEY (question_id) REFERENCES questions (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_as_cs COMMENT = '태그 병합 때 옮긴 질문';

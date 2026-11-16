-- =====================================================================
-- 댓글 수정(REQ-BOARD-016) 추가: 이미 db/schema.sql 로 만든 로컬 DB에 한 번 실행합니다.
--   mysql -u gamers -p gamers_db < db/migrations/20261116_comments_edited_at.sql
-- 새로 만드는 DB는 db/schema.sql 에 이미 들어 있으므로 실행하지 않습니다.
-- 근거: docs/04-db-design.md 4.15 / API 명세 7장 PATCH /api/comments/:commentId
-- =====================================================================

SET NAMES utf8mb4;

ALTER TABLE comments
  ADD COLUMN edited_at DATETIME(3) NULL COMMENT '마지막 수정 시각. isEdited 계산' AFTER deleted_at;

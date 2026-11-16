-- =====================================================================
-- 비밀번호 변경·재설정 시 기존 토큰 무효화: 이미 db/schema.sql 로 만든 로컬 DB에 한 번 실행합니다.
--   mysql -u gamers -p gamers_db < db/migrations/20261116_password_changed_at.sql
-- 새로 만드는 DB는 db/schema.sql 에 이미 들어 있으므로 실행하지 않습니다.
-- 두 번 실행하면 "Duplicate column name" 오류가 나며, 이미 반영된 것이므로 무시해도 됩니다.
-- 근거: docs/04-db-design.md 4.1 / API 명세 1.2
-- =====================================================================

SET NAMES utf8mb4;

-- 기존 회원은 바꾼 기록이 없으므로 NULL 로 두고, NULL 이면 토큰 발급 시각을 비교하지 않는다
ALTER TABLE users
  ADD COLUMN password_changed_at DATETIME(3) NULL
    COMMENT '비밀번호 변경·재설정 시각. 이보다 먼저 발급된 토큰은 거절' AFTER password_hash;

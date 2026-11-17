-- =====================================================================
-- GAMERS DB·계정 만들기 (로컬 개발용)
--
-- 관리자 계정(root)으로 한 번 실행합니다. 다시 실행해도 이미 있는 DB·계정은 그대로 둡니다.
--   mysql -u root -p < db/create-user.sql
-- 그다음 만든 계정으로 테이블을 만듭니다. (비밀번호: gamers)
--   mysql -u gamers -p gamers_db < db/schema.sql
-- 테스트 데이터(db/seed.sql)는 NODE_ENV=development 로 백엔드를 실행하면 자동으로 한 번 들어갑니다.
--
-- - DB 기본 문자셋·정렬 규칙은 utf8mb4 / utf8mb4_0900_as_cs 입니다 (docs/04-db-design.md 1장).
-- - 비밀번호가 단순하므로 로컬 개발용으로만 씁니다. 이 PC(localhost)에서만 접속할 수 있습니다.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS gamers_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_as_cs;

CREATE USER IF NOT EXISTS 'gamers'@'localhost' IDENTIFIED BY 'gamers';

-- gamers_db 안에서만 모든 권한 (테이블 생성·변경 포함). 다른 DB 에는 접근할 수 없다
GRANT ALL PRIVILEGES ON gamers_db.* TO 'gamers'@'localhost';

-- =====================================================================
-- GAMERS 로컬 개발용 테스트 데이터: 주력 게임 (API 명세 2장 mainGames)
--
-- db/seed.sql 다음에 넣습니다. 서버가 뜰 때 seed_ 회원의 주력 게임이 없으면 한 번 넣습니다
-- (backend/src/config/dev-seed.js). 직접 넣을 때: mysql -u gamers -p gamers_db < db/seed-main-games.sql
-- 기존 로컬 DB는 db/migrations/20261116_user_main_games.sql 을 먼저 실행해야 합니다.
--
-- - 답변·채택 수는 저장하지 않고 seed.sql 의 답변으로 계산되어 보입니다.
-- - 뺐다가 다시 고를 수 있는지 보도록 seed_hoya 는 뺀 행(deleted_at)도 하나 넣습니다.
-- =====================================================================

SET NAMES utf8mb4 COLLATE utf8mb4_0900_as_cs;

INSERT INTO user_main_games (user_id, tag_id, sort_order, deleted_at)
SELECT u.id, t.id, picks.sort_order, picks.deleted_at
FROM (
  SELECT 'seed_hoya' AS username, '마인크래프트' AS tag_name, 0 AS sort_order, NULL AS deleted_at
  UNION ALL SELECT 'seed_hoya', '스타듀밸리', 1, NULL
  UNION ALL SELECT 'seed_hoya', '엘든링', 2, NOW(3) - INTERVAL 3 DAY
  UNION ALL SELECT 'seed_speed', '리그오브레전드', 0, NULL
  UNION ALL SELECT 'seed_speed', '발로란트', 1, NULL
  UNION ALL SELECT 'seed_heal', '발로란트', 0, NULL
  UNION ALL SELECT 'seed_heal', '로스트아크', 1, NULL
  UNION ALL SELECT 'seed_modder', '마인크래프트', 0, NULL
) AS picks
JOIN users u ON u.username = picks.username AND u.status = 'active'
JOIN tags t ON t.name = picks.tag_name AND t.status = 'active';

-- =====================================================================
-- GAMERS 로컬 개발용 테스트 데이터: 순위 등급 (API 명세 11.2, 12.1 rank_achieved)
--
-- db/seed.sql, db/seed-points.sql 다음에 넣습니다. 서버가 뜰 때 seed_rank_001 계정이 없으면 한 번 넣습니다
-- (backend/src/config/dev-seed.js). 직접 넣을 때: mysql -u gamers -p gamers_db < db/seed-rankings.sql
--
-- Master 레벨(Lv70 이상) 회원 330명(seed_rank_001 ~ seed_rank_330, 비밀번호 gamers12!)을 넣어
-- Challenger(1~100위) / Grandmaster(101~300위) / Master(301위~)가 모두 보이게 합니다.
--
-- - 순위 점수 = 포인트 × (1 + 답변 채택률). 이 회원들은 답변이 없어 점수 = 포인트입니다.
--   seed_rank_k 의 포인트는 9000 - (k - 1) × 6 (9,000 ~ 7,026)으로 한 칸에 6점씩 차이가 납니다.
-- - seed_speed(6,800 × 채택률 1.5 = 10,200)가 1위라 seed_rank_k 는 (k + 1)위입니다.
--   seed_hoya(5,200 × 1.33 ≒ 6,934)는 모든 순위 회원보다 낮아 Master 로 보입니다.
-- - 경계 계정 (답변을 하나 채택하면 +20점이라 위 칸을 넘습니다)
--     seed_rank_099: 100위 Challenger 마지막 / seed_rank_100: 101위 Grandmaster 첫 번째
--     seed_rank_299: 300위 Grandmaster 마지막 / seed_rank_300: 301위 Master 첫 번째
--   seed_rank_100, seed_rank_300 은 채택하지 않은 답변이 달린 질문이 하나씩 있습니다.
--   로그인해서 답변을 채택하면 다음 순위 계산(기본 10분, RANKING_INTERVAL_MINUTES) 때 한 단계 오르고
--   rank_achieved 알림·축하 모달을 받습니다. 밀려난 seed_rank_099·299 는 내려가며 알림이 없습니다.
-- - 포인트는 직접 정한 값이라 포인트 내역은 없습니다. 첫 순위 계산 때 300명이 한꺼번에 달성 알림을 받습니다.
-- =====================================================================

SET NAMES utf8mb4 COLLATE utf8mb4_0900_bin;
SET time_zone = '+00:00';

-- 순위 회원 330명. 닉네임은 영문만 써야 해서 Ranker + 두 글자(AA, AB, ...)로 만든다
INSERT INTO users (username, email, nickname, name, password_hash, bio, role, points, created_at)
WITH RECURSIVE seq (k) AS (SELECT 1 UNION ALL SELECT k + 1 FROM seq WHERE k < 330)
SELECT
  CONCAT('seed_rank_', LPAD(k, 3, '0')),
  CONCAT('seed_rank_', LPAD(k, 3, '0'), '@gamers.test'),
  CONCAT('Ranker', CHAR(65 + (k - 1) DIV 26), CHAR(65 + (k - 1) MOD 26)),
  '랭커',
  '$argon2id$v=19$m=65536,t=3,p=4$wNLxDnafHz9N2rc01sc/xw$2rbiJMlXVkjkZXN962wkRSzAkWK+UNIwI9z2BqqMZEc',
  CONCAT('<p>순위 테스트용 계정 ', k, '번입니다.</p>'),
  'USER',
  9000 - (k - 1) * 6,
  NOW(3) - INTERVAL (200 - k DIV 2) DAY
FROM seq;

-- 경계 계정의 질문과 채택하지 않은 답변 (seed_tank 가 답변)
SET @t_mc = (SELECT id FROM tags WHERE name = '마인크래프트' LIMIT 1);
SET @u_tank = (SELECT id FROM users WHERE username = 'seed_tank');

SET @u_r100 = (SELECT id FROM users WHERE username = 'seed_rank_100');
INSERT INTO questions (author_id, title, body, created_at)
VALUES (@u_r100, '레드스톤 반복기 딜레이가 1틱씩 밀립니다', '<p>반복기 4개를 연결했는데 마지막 신호가 1틱 늦게 들어옵니다. 청크 경계 때문일까요?</p>', NOW(3) - INTERVAL 300 MINUTE);
SET @q_r100 = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_r100, @t_mc, NOW(3) - INTERVAL 300 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at)
VALUES (@q_r100, @u_tank, '<p>청크 경계에 걸친 반복기는 업데이트 순서가 달라질 수 있어요. 회로를 한 청크 안으로 옮겨 보세요.</p>', NOW(3) - INTERVAL 240 MINUTE);

SET @u_r300 = (SELECT id FROM users WHERE username = 'seed_rank_300');
INSERT INTO questions (author_id, title, body, created_at)
VALUES (@u_r300, '자동 사탕수수 농장 수확량이 너무 적어요', '<p>관찰자 + 피스톤으로 만들었는데 한 시간에 100개도 안 나옵니다. 배치를 어떻게 바꾸면 좋을까요?</p>', NOW(3) - INTERVAL 200 MINUTE);
SET @q_r300 = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_r300, @t_mc, NOW(3) - INTERVAL 200 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at)
VALUES (@q_r300, @u_tank, '<p>관찰자 하나에 피스톤 여러 개를 묶고, 줄을 길게 늘리면 수확량이 크게 늘어요.</p>', NOW(3) - INTERVAL 150 MINUTE);

-- =====================================================================
-- GAMERS 로컬 개발용 테스트 데이터: 포인트·등급 (API 명세 11장)
--
-- db/seed.sql 다음에 넣습니다. 서버가 뜰 때 seed_ 회원의 포인트 내역이 없으면 한 번 넣습니다
-- (backend/src/config/dev-seed.js). 직접 넣을 때: mysql -u gamers -p gamers_db < db/seed-points.sql
-- 기존 로컬 DB는 db/migrations/20261116_points.sql 을 먼저 실행해야 합니다.
--
-- - seed.sql 의 활동(질문 작성, 채택, 신고 처리)으로 내역을 만들고, 최근 7일(오늘 제외)의 하루 첫 접속을 넣습니다.
--   오늘 첫 접속 +1 은 로그인해서 직접 확인할 수 있도록 넣지 않습니다.
-- - 등급 배지를 고르게 보도록 일부 회원은 마지막에 포인트를 직접 정합니다 (seed 이전 활동이 있었다고 보는 값).
--   이 회원들은 포인트 내역 합계와 현재 포인트가 다릅니다.
-- - Master 레벨 회원이 300명보다 적어 Master 레벨 회원은 모두 순위 100위 안 → Challenger 로 보입니다.
-- =====================================================================

SET NAMES utf8mb4 COLLATE utf8mb4_0900_as_cs;
SET time_zone = '+00:00';

-- 질문 작성 +2
INSERT INTO point_histories (user_id, reason, amount, target_type, target_id, grant_key, created_at)
SELECT q.author_id, 'question_create', 2, 'question', q.id, CONCAT('question_create:', q.id), q.created_at
FROM questions q
JOIN users u ON u.id = q.author_id
WHERE u.username LIKE 'seed\_%' AND u.role = 'USER' AND u.status = 'active';

-- 답변 채택: 질문자 +20
INSERT INTO point_histories (user_id, reason, amount, target_type, target_id, grant_key, created_at)
SELECT q.author_id, 'accept_give', 20, 'question', q.id, CONCAT('accept_give:', q.id), a.accepted_at
FROM answers a
JOIN questions q ON q.id = a.question_id
JOIN users u ON u.id = q.author_id
WHERE a.is_accepted = 1 AND u.username LIKE 'seed\_%' AND u.role = 'USER' AND u.status = 'active';

-- 답변 채택: 답변자 +50
INSERT INTO point_histories (user_id, reason, amount, target_type, target_id, grant_key, created_at)
SELECT a.author_id, 'answer_accepted', 50, 'answer', a.id, CONCAT('answer_accepted:', a.id), a.accepted_at
FROM answers a
JOIN users u ON u.id = a.author_id
WHERE a.is_accepted = 1 AND u.username LIKE 'seed\_%' AND u.role = 'USER' AND u.status = 'active';

-- 하루 첫 접속 +1: 어제부터 7일 (grant_key 는 한국 날짜)
INSERT INTO point_histories (user_id, reason, amount, target_type, target_id, grant_key, created_at)
WITH RECURSIVE days (d) AS (SELECT 1 UNION ALL SELECT d + 1 FROM days WHERE d < 7)
SELECT
  u.id, 'daily_visit', 1, NULL, NULL,
  CONCAT('daily_visit:', DATE_FORMAT(NOW(3) + INTERVAL 9 HOUR - INTERVAL days.d DAY, '%Y-%m-%d')),
  NOW(3) - INTERVAL days.d DAY
FROM users u
CROSS JOIN days
WHERE u.username LIKE 'seed\_%' AND u.role = 'USER' AND u.status = 'active';

-- 신고 처리 차감: seed.sql 의 처리된 신고 2건 (숨김 + 7일 글쓰기 제한 25%, 숨김 + 이전 1회 15%)
INSERT INTO point_histories (user_id, reason, amount, target_type, target_id, grant_key, detail, created_at)
SELECT
  r.target_author_id, 'report_penalty',
  IF(s.id IS NULL, -1, -2),
  'report', r.id, CONCAT('report_penalty:', r.id),
  IF(s.id IS NULL, '대상 숨김 · 15%', '대상 숨김 + 7일 글쓰기 제한 · 25%'),
  r.processed_at
FROM reports r
JOIN users u ON u.id = r.target_author_id
LEFT JOIN user_sanctions s ON s.report_id = r.id
WHERE r.status = 'resolved' AND u.username LIKE 'seed\_%' AND u.role = 'USER' AND u.status = 'active';

-- 현재 포인트 = 내역 합계
UPDATE users u
JOIN (SELECT user_id, SUM(amount) AS total FROM point_histories GROUP BY user_id) h ON h.user_id = u.id
SET u.points = GREATEST(h.total, 0)
WHERE u.username LIKE 'seed\_%' AND u.role = 'USER';

-- 등급별로 보이도록 직접 정하는 포인트 (레벨: API 명세 11.2)
UPDATE users SET points = 6800 WHERE username = 'seed_speed';  -- Lv79 Challenger (순위 1위)
UPDATE users SET points = 5200 WHERE username = 'seed_hoya';   -- Lv72 Challenger (순위 2위)
UPDATE users SET points = 3600 WHERE username = 'seed_modder'; -- Lv62 Diamond
UPDATE users SET points = 2250 WHERE username = 'seed_raid';   -- Lv51 Emerald
UPDATE users SET points = 1450 WHERE username = 'seed_build';  -- Lv42 Platinum
UPDATE users SET points = 760 WHERE username = 'seed_tank';    -- Lv31 Gold
UPDATE users SET points = 420 WHERE username = 'seed_heal';    -- Lv22 Silver
-- 나머지는 내역 합계 그대로: seed_newbie Bronze, seed_mod·seed_suspended·seed_commentban Unranked 등

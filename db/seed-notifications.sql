-- =====================================================================
-- GAMERS 로컬 개발용 테스트 데이터: 알림 (API 명세 12장)
--
-- db/seed.sql 다음에 넣습니다. 서버가 뜰 때 seed_ 회원의 알림이 없으면 한 번 넣습니다
-- (backend/src/config/dev-seed.js). 직접 넣을 때: mysql -u gamers -p gamers_db < db/seed-notifications.sql
-- 기존 로컬 DB는 db/migrations/20261116_notifications.sql 을 먼저 실행해야 합니다.
--
-- - seed.sql 의 활동(답변, 채택, 댓글, 공지, 신고 처리)으로 알림을 만듭니다. 시각은 그 활동 시각입니다.
-- - 3일이 지난 알림은 읽은 것으로, 최근 3일 안의 알림은 읽지 않은 것으로 넣어 읽지 않은 수가 보이게 합니다.
-- =====================================================================

SET NAMES utf8mb4 COLLATE utf8mb4_0900_as_cs;
SET time_zone = '+00:00';

-- 내 질문에 새 답변 (내가 단 답변 제외)
INSERT INTO notifications (user_id, type, actor_id, target_type, target_id, sub_target_id, title, created_at)
SELECT q.author_id, 'answer_created', a.author_id, 'question', q.id, a.id, LEFT(q.title, 100), a.created_at
FROM answers a
JOIN questions q ON q.id = a.question_id
JOIN users u ON u.id = q.author_id
WHERE a.author_id <> q.author_id AND u.username LIKE 'seed\_%' AND u.status = 'active';

-- 내 답변이 채택됨
INSERT INTO notifications (user_id, type, actor_id, target_type, target_id, sub_target_id, title, created_at)
SELECT a.author_id, 'answer_accepted', q.author_id, 'question', q.id, a.id, LEFT(q.title, 100), a.accepted_at
FROM answers a
JOIN questions q ON q.id = a.question_id
JOIN users u ON u.id = a.author_id
WHERE a.is_accepted = 1 AND u.username LIKE 'seed\_%' AND u.status = 'active';

-- 내 게시글에 새 댓글 (내가 단 댓글 제외)
INSERT INTO notifications (user_id, type, actor_id, target_type, target_id, sub_target_id, title, created_at)
SELECT p.author_id, 'comment_created', c.author_id, 'post', p.id, c.id, LEFT(p.title, 100), c.created_at
FROM comments c
JOIN posts p ON p.id = c.post_id
JOIN users u ON u.id = p.author_id
WHERE c.author_id <> p.author_id AND u.username LIKE 'seed\_%' AND u.status = 'active';

-- 공지 등록: 일반 회원 전체
INSERT INTO notifications (user_id, type, actor_id, target_type, target_id, sub_target_id, title, created_at)
SELECT u.id, 'notice_created', NULL, 'notice', n.id, NULL, LEFT(n.title, 100), n.created_at
FROM notices n
CROSS JOIN users u
WHERE u.role = 'USER' AND u.status = 'active' AND u.username LIKE 'seed\_%';

-- 신고 처리로 숨김·제재됨 (seed.sql 의 처리된 신고 2건, 포인트 차감은 seed-points.sql 과 같은 값)
INSERT INTO notifications (user_id, type, actor_id, target_type, target_id, sub_target_id, title, detail, created_at)
SELECT
  r.target_author_id, 'report_action', NULL, r.target_type, r.target_id, NULL,
  LEFT(COALESCE(q.title, p.title), 100),
  IF(s.id IS NULL,
     '불법 프로그램 · 대상 숨김 · 포인트 15% 차감(-1)',
     '스팸·홍보 · 대상 숨김 + 7일 글쓰기 제한 · 포인트 25% 차감(-2)'),
  r.processed_at
FROM reports r
JOIN users u ON u.id = r.target_author_id
LEFT JOIN questions q ON r.target_type = 'question' AND q.id = r.target_id
LEFT JOIN posts p ON r.target_type = 'post' AND p.id = r.target_id
LEFT JOIN user_sanctions s ON s.report_id = r.id
WHERE r.status = 'resolved' AND r.hide_target = 1 AND u.username = 'seed_writeban' AND u.status = 'active';

-- 신고자에게 처리 결과 (seed.sql 의 처리·반려된 신고)
INSERT INTO notifications (user_id, type, actor_id, target_type, target_id, sub_target_id, title, detail, created_at)
SELECT
  r.reporter_id, 'report_processed', NULL, 'report', r.id, NULL,
  LEFT(COALESCE(q.title, p.title, CONCAT('신고 #', r.id)), 100),
  IF(r.status = 'resolved', '처리 완료', '반려'),
  r.processed_at
FROM reports r
JOIN users u ON u.id = r.reporter_id
LEFT JOIN questions q ON r.target_type = 'question' AND q.id = r.target_id
LEFT JOIN posts p ON r.target_type = 'post' AND p.id = r.target_id
WHERE r.status IN ('resolved', 'rejected') AND r.processed_at IS NOT NULL
  AND u.username LIKE 'seed\_%' AND u.status = 'active'
  AND r.id IN (SELECT id FROM (SELECT r2.id FROM reports r2 JOIN users w ON w.id = r2.target_author_id
                               WHERE w.username IN ('seed_writeban', 'seed_tank')) seed_reports);

-- 3일이 지난 알림은 읽은 것으로
UPDATE notifications n
JOIN users u ON u.id = n.user_id
SET n.read_at = n.created_at + INTERVAL 1 HOUR
WHERE u.username LIKE 'seed\_%' AND n.created_at < NOW(3) - INTERVAL 3 DAY;

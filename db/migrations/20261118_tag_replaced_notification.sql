-- =====================================================================
-- 태그 차단 시 대체 태그 알림 추가 (알림 type 에 tag_replaced): 이미 db/schema.sql 로 만든 DB에 한 번 실행합니다.
--   mysql -u gamers -p gamers_db < db/migrations/20261118_tag_replaced_notification.sql
-- 새로 만드는 DB는 db/schema.sql 에 이미 들어 있으므로 실행하지 않습니다.
-- 운영 DB(TiDB)에는 대체 태그 기능을 배포하기 전에 먼저 적용합니다. (docs/05-deployment.md 5.4)
-- 근거: docs/04-db-design.md 4.21 / API 명세 10.5 DELETE /api/admin/tags/:tagId, 12.1
-- =====================================================================

SET NAMES utf8mb4;

-- 알림 type 에 tag_replaced 추가 (CHECK 는 고칠 수 없어 지우고 다시 만든다)
ALTER TABLE notifications DROP CHECK chk_notifications_type;
ALTER TABLE notifications ADD CONSTRAINT chk_notifications_type CHECK (type IN (
  'answer_created', 'answer_accepted', 'comment_created', 'notice_created',
  'question_edited', 'answer_edited', 'report_processed', 'rank_achieved', 'report_action',
  'tag_replaced'
));

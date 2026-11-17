-- =====================================================================
-- 알림 기능 추가 (알림 테이블, 순위 등급 컬럼): 이미 db/schema.sql 로 만든 로컬 DB에 한 번 실행합니다.
--   mysql -u gamers -p gamers_db < db/migrations/20261116_notifications.sql
-- 새로 만드는 DB는 db/schema.sql 에 이미 들어 있으므로 실행하지 않습니다.
-- 근거: docs/04-db-design.md 4.21 / API 명세 12장
-- =====================================================================

SET NAMES utf8mb4;

-- 순위 등급(Grandmaster·Challenger)을 저장해 오를 때만 알린다 (명세 11.2)
ALTER TABLE users
  ADD COLUMN ranked_tier VARCHAR(20) NULL
    COMMENT '마지막으로 계산한 순위 등급 grandmaster / challenger. 순위 밖이면 NULL' AFTER points,
  ADD CONSTRAINT chk_users_ranked_tier
    CHECK (ranked_tier IS NULL OR ranked_tier IN ('grandmaster', 'challenger'));

-- ---------------------------------------------------------------------
-- 4.21 notifications: 회원 알림 (명세 12장). 받는 회원 1명 = 1행. 지우지 않고 읽음(read_at)만 남긴다
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL COMMENT '받는 회원',
  type          VARCHAR(20)     NOT NULL,
  actor_id      BIGINT UNSIGNED NULL COMMENT '답변·댓글 작성자, 채택·수정한 회원. 공지·신고·순위 알림은 NULL',
  target_type   VARCHAR(20)     NOT NULL,
  target_id     BIGINT UNSIGNED NOT NULL COMMENT '이동할 대상 id. 신고 조치는 글 id, 신고 결과는 신고 id, 순위는 회원 id',
  sub_target_id BIGINT UNSIGNED NULL COMMENT '답변·댓글 id',
  title         VARCHAR(100)    NOT NULL COMMENT '알림을 만든 시점의 글 제목',
  detail        VARCHAR(200)    NULL COMMENT '신고 조치 내용',
  read_at       DATETIME(3)     NULL,
  created_at    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_notifications_user_created (user_id, created_at),
  KEY idx_notifications_user_read (user_id, read_at),
  KEY idx_notifications_actor (actor_id),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_notifications_actor FOREIGN KEY (actor_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_notifications_type CHECK (type IN (
    'answer_created', 'answer_accepted', 'comment_created', 'notice_created',
    'question_edited', 'answer_edited', 'report_processed', 'rank_achieved', 'report_action'
  )),
  CONSTRAINT chk_notifications_target_type
    CHECK (target_type IN ('question', 'answer', 'post', 'comment', 'notice', 'report', 'user'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_bin COMMENT = '알림';

import { getExecutor } from '../../config/database.js';

const TITLE_MAX_LENGTH = 100;

// 알림 만들기는 모두 INSERT ... SELECT 한 문장이다. 받는 회원이 탈퇴했거나 본인이 한 일이면
// SELECT 결과가 없어 행이 생기지 않는다 (DB 설계서 4.21)
const INSERT_COLUMNS = `INSERT INTO notifications
  (user_id, type, actor_id, target_type, target_id, sub_target_id, title, detail)`;

// 내 질문에 새 답변 (답변 작성자 = 질문 작성자면 만들지 않음)
export const createAnswerCreatedNotification = async ({ questionId, answerId, actorId }) => {
  await getExecutor().query(
    `${INSERT_COLUMNS}
     SELECT q.author_id, 'answer_created', ?, 'question', q.id, ?, LEFT(q.title, ?), NULL
     FROM questions q
     JOIN users u ON u.id = q.author_id
     WHERE q.id = ? AND q.author_id <> ? AND u.status = 'active'`,
    [actorId, answerId, TITLE_MAX_LENGTH, questionId, actorId],
  );
};

// 내 답변이 채택됨 (채택한 질문 작성자가 actor)
export const createAnswerAcceptedNotification = async ({ answerId, actorId }) => {
  await getExecutor().query(
    `${INSERT_COLUMNS}
     SELECT a.author_id, 'answer_accepted', ?, 'question', q.id, a.id, LEFT(q.title, ?), NULL
     FROM answers a
     JOIN questions q ON q.id = a.question_id
     JOIN users u ON u.id = a.author_id
     WHERE a.id = ? AND a.author_id <> ? AND u.status = 'active'`,
    [actorId, TITLE_MAX_LENGTH, answerId, actorId],
  );
};

// 내 게시글에 새 댓글 (댓글 작성자 = 게시글 작성자면 만들지 않음)
export const createCommentCreatedNotification = async ({ postId, commentId, actorId }) => {
  await getExecutor().query(
    `${INSERT_COLUMNS}
     SELECT p.author_id, 'comment_created', ?, 'post', p.id, ?, LEFT(p.title, ?), NULL
     FROM posts p
     JOIN users u ON u.id = p.author_id
     WHERE p.id = ? AND p.author_id <> ? AND u.status = 'active'`,
    [actorId, commentId, TITLE_MAX_LENGTH, postId, actorId],
  );
};

// 공지 등록: 그 시점의 일반 회원 전체 (관리자 제외)
export const createNoticeCreatedNotifications = async ({ noticeId, title }) => {
  const [result] = await getExecutor().query(
    `${INSERT_COLUMNS}
     SELECT u.id, 'notice_created', NULL, 'notice', ?, NULL, LEFT(?, ?), NULL
     FROM users u
     WHERE u.role = 'USER' AND u.status = 'active'`,
    [noticeId, title, TITLE_MAX_LENGTH],
  );

  return result.affectedRows;
};

// 신고 조치 알림의 제목: 질문·게시글은 제목, 답변·댓글은 상위 글 제목 (API 명세 12.1)
const REPORT_TARGET_TITLES = {
  question: 'SELECT title FROM questions WHERE id = ?',
  post: 'SELECT title FROM posts WHERE id = ?',
  answer: `SELECT CONCAT('답변: ', q.title) AS title
           FROM answers a JOIN questions q ON q.id = a.question_id
           WHERE a.id = ?`,
  comment: `SELECT CONCAT('댓글: ', p.title) AS title
            FROM comments c JOIN posts p ON p.id = c.post_id
            WHERE c.id = ?`,
};

// 내 글이 신고 처리로 숨김·제재됨 (actor 없음: 신고자·처리자를 알리지 않는다)
export const createReportActionNotification = async ({ userId, targetType, targetId, detail }) => {
  await getExecutor().query(
    `${INSERT_COLUMNS}
     SELECT u.id, 'report_action', NULL, ?, ?, NULL, LEFT(t.title, ?), ?
     FROM users u
     JOIN (${REPORT_TARGET_TITLES[targetType]}) t
     WHERE u.id = ? AND u.status = 'active'`,
    [targetType, targetId, TITLE_MAX_LENGTH, detail, targetId, userId],
  );
};

export const findNotificationsByUserId = async (userId, { limit, offset }) => {
  const [rows] = await getExecutor().query(
    `SELECT
       n.id,
       n.type,
       n.title,
       n.detail,
       n.target_type,
       n.target_id,
       n.sub_target_id,
       n.read_at,
       n.created_at,
       n.actor_id,
       a.nickname AS actor_nickname,
       a.profile_image_url AS actor_profile_image_url,
       a.status AS actor_status
     FROM notifications n
     LEFT JOIN users a ON a.id = n.actor_id
     WHERE n.user_id = ?
     ORDER BY n.created_at DESC, n.id DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset],
  );

  return rows;
};

export const countNotificationsByUserId = async (userId) => {
  const [rows] = await getExecutor().query(
    'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ?',
    [userId],
  );

  return Number(rows[0].count);
};

export const countUnreadNotificationsByUserId = async (userId) => {
  const [rows] = await getExecutor().query(
    'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND read_at IS NULL',
    [userId],
  );

  return Number(rows[0].count);
};

export const existsNotificationOfUser = async (userId, notificationId) => {
  const [rows] = await getExecutor().query(
    'SELECT 1 FROM notifications WHERE id = ? AND user_id = ?',
    [notificationId, userId],
  );

  return rows.length > 0;
};

// 이미 읽은 알림은 읽은 시각을 바꾸지 않는다
export const updateNotificationRead = async (userId, notificationId) => {
  await getExecutor().query(
    'UPDATE notifications SET read_at = NOW(3) WHERE id = ? AND user_id = ? AND read_at IS NULL',
    [notificationId, userId],
  );
};

export const updateAllNotificationsRead = async (userId) => {
  await getExecutor().query(
    'UPDATE notifications SET read_at = NOW(3) WHERE user_id = ? AND read_at IS NULL',
    [userId],
  );
};

import { getExecutor } from '../../config/database.js';

// 날짜는 UTC로 저장하므로 한국 날짜로 묶을 때 9시간을 더한다 (API 명세 10.1)
const KST_DATE = (column) => `DATE_FORMAT(${column} + INTERVAL 9 HOUR, '%Y-%m-%d')`;

/** 회원·질문 현황. 공개(active) 질문만 세고, 미해결은 채택된 답변이 없는 공개 질문이다 */
export const countDashboardKpis = async (todayStartAt) => {
  const [rows] = await getExecutor().query(
    `SELECT
       (SELECT COUNT(*) FROM users WHERE status = 'active') AS total_members,
       (SELECT COUNT(*) FROM users WHERE created_at >= ?) AS today_signups,
       (SELECT COUNT(*) FROM questions WHERE status = 'active') AS total_questions,
       (SELECT COUNT(*) FROM questions q
        WHERE q.status = 'active'
          AND NOT EXISTS (
            SELECT 1 FROM answers a WHERE a.question_id = q.id AND a.is_accepted = 1
          )) AS unresolved_questions`,
    [todayStartAt],
  );

  return rows[0];
};

// 한국 날짜별 공개 질문 수 (그날 올라온 질문 중 지금 공개인 것)
export const countQuestionsByDate = async (startAt) => {
  const [rows] = await getExecutor().query(
    `SELECT ${KST_DATE('created_at')} AS date, COUNT(*) AS count
     FROM questions
     WHERE status = 'active' AND created_at >= ?
     GROUP BY date`,
    [startAt],
  );

  return rows;
};

// 한국 날짜별 가입 수. 나중에 탈퇴한 회원도 그날 가입한 것으로 센다
export const countSignupsByDate = async (startAt) => {
  const [rows] = await getExecutor().query(
    `SELECT ${KST_DATE('created_at')} AS date, COUNT(*) AS count
     FROM users
     WHERE created_at >= ?
     GROUP BY date`,
    [startAt],
  );

  return rows;
};

// 공개 질문에 연결이 살아 있는 태그의 질문 수 상위. 차단·병합된 태그는 뺀다 (태그 questionCount와 같은 기준)
export const findTopTags = async (limit) => {
  const [rows] = await getExecutor().query(
    `SELECT t.name, COUNT(*) AS question_count
     FROM tags t
     JOIN question_tags qt ON qt.tag_id = t.id AND qt.deleted_at IS NULL
     JOIN questions q ON q.id = qt.question_id AND q.status = 'active'
     WHERE t.status = 'active'
     GROUP BY t.id, t.name
     ORDER BY question_count DESC, t.name ASC
     LIMIT ?`,
    [limit],
  );

  return rows;
};

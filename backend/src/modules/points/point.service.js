import { withTransaction } from '../../config/database.js';
import * as notificationService from '../notifications/notification.service.js';

import * as pointRepository from './point.repository.js';

// 포인트 지급량 (API 명세 11.1). 작성 < 질문자 채택 < 답변자 채택
const AMOUNTS = {
  daily_visit: 1,
  question_create: 2,
  accept_give: 20,
  answer_accepted: 50,
};
const QUESTION_CREATE_DAILY_LIMIT = 5;

// 신고 처리 차감 비율(%) = 조치 비율 + 기간 가산 + 이전 처리 1회당 5%p, 최대 80% (API 명세 11.1)
const PENALTY_NO_ACTION_RATE = 5;
const PENALTY_HIDE_RATE = 10;
const PENALTY_SANCTION_RATES = { comment_ban: 15, write_ban: 20, suspend: 30 };
const PENALTY_DAYS_BONUS = { 3: 0, 7: 5, 30: 10 };
const PENALTY_PERMANENT_BONUS = 20;
const PENALTY_REPEAT_BONUS = 5;
const PENALTY_MAX_RATE = 80;

// 등급별 레벨 범위와 레벨당 필요 포인트 (API 명세 11.2). Lv0은 unranked
const TIERS = [
  { tier: 'iron', fromLevel: 1, toLevel: 9, pointsPerLevel: 10 },
  { tier: 'bronze', fromLevel: 10, toLevel: 19, pointsPerLevel: 20 },
  { tier: 'silver', fromLevel: 20, toLevel: 29, pointsPerLevel: 35 },
  { tier: 'gold', fromLevel: 30, toLevel: 39, pointsPerLevel: 55 },
  { tier: 'platinum', fromLevel: 40, toLevel: 49, pointsPerLevel: 80 },
  { tier: 'emerald', fromLevel: 50, toLevel: 59, pointsPerLevel: 110 },
  { tier: 'diamond', fromLevel: 60, toLevel: 69, pointsPerLevel: 150 },
  { tier: 'master', fromLevel: 70, toLevel: 79, pointsPerLevel: 200 },
];
const MAX_LEVEL = 79;
const MASTER_LEVEL = 70;
const CHALLENGER_COUNT = 100;
const GRANDMASTER_COUNT = 200;

// LEVEL_START_POINTS[n] = Lv n이 시작하는 포인트 (Lv0 = 0, Lv1 = 10, ... Lv79 = 6590)
const LEVEL_START_POINTS = TIERS.reduce(
  (starts, { fromLevel, toLevel, pointsPerLevel }) => {
    for (let level = fromLevel; level <= toLevel; level += 1) {
      starts.push(starts[level - 1] + pointsPerLevel);
    }

    return starts;
  },
  [0],
);

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// 한국 날짜 'YYYY-MM-DD'와 그 날 0시의 UTC 시각
const toKstDay = (now) => {
  const date = new Date(now.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);

  return { date, startAt: new Date(`${date}T00:00:00+09:00`) };
};

const toLevel = (points) => {
  let level = 0;

  while (level < MAX_LEVEL && points >= LEVEL_START_POINTS[level + 1]) {
    level += 1;
  }

  return level;
};

const toBaseTier = (level) =>
  level === 0 ? 'unranked' : TIERS.find(({ toLevel: last }) => level <= last).tier;

// Master 레벨 회원의 순위 등급. 10분마다 refreshRankings가 바꾼다 (API 명세 11.2)
let rankedTiers = new Map();

/**
 * 레벨과 등급 (API 명세 11.2). 관리자·탈퇴 회원은 대상이 아니라 null.
 * Master 레벨 아래로 내려가면 순위와 상관없이 그 레벨의 등급이다.
 */
export const toUserLevel = ({ id, role, status, points }) => {
  if (id === null || role !== 'USER' || status !== 'active') {
    return { level: null, tier: null };
  }

  const level = toLevel(points);
  const tier = level >= MASTER_LEVEL ? (rankedTiers.get(id) ?? 'master') : toBaseTier(level);

  return { level, tier };
};

/** 질문·답변 author(UserSummary)에 level·tier를 붙인다. row의 <prefix>_role·_status·_points를 읽는다 */
export const withUserLevel = (summary, row, prefix) => ({
  ...summary,
  ...toUserLevel({
    id: summary.id,
    role: row[`${prefix}_role`],
    status: row[`${prefix}_status`],
    points: row[`${prefix}_points`],
  }),
});

/** 회원 프로필의 포인트·레벨. 내 프로필이면 레벨 구간(진행 막대)도 준다 (API 명세 2장) */
export const toProfilePoints = (user, { withRange }) => {
  const isTarget = user.role === 'USER';
  // 프로필은 탈퇴하지 않은 회원만 조회한다
  const { level, tier } = toUserLevel({ ...user, status: 'active' });
  const profilePoints = { points: isTarget ? user.points : 0, level, tier };

  if (!withRange) {
    return profilePoints;
  }

  return {
    ...profilePoints,
    currentLevelPoints: level === null ? null : LEVEL_START_POINTS[level],
    nextLevelPoints: level === null || level === MAX_LEVEL ? null : LEVEL_START_POINTS[level + 1],
  };
};

/**
 * 포인트를 바꾸고 내역을 남긴다. 호출한 쪽의 트랜잭션 안에서 부른다.
 * 관리자·탈퇴 회원이거나 같은 grantKey가 이미 있거나 바뀔 값이 0이면 아무것도 하지 않는다.
 * changeOf(현재 포인트)가 바꿀 양과 내역 detail을 정한다. 바뀐 양을 돌려준다 (안 바뀌면 0)
 */
const changePoints = async (userId, { reason, changeOf, targetType, targetId, grantKey }) => {
  const user = await pointRepository.findUserPointsByIdForUpdate(userId);

  if (
    user === null ||
    user.role !== 'USER' ||
    user.status !== 'active' ||
    (await pointRepository.existsPointHistory(userId, grantKey))
  ) {
    return 0;
  }

  const { amount, detail = null } = await changeOf(user.points);

  if (amount === 0) {
    return 0;
  }

  await pointRepository.createPointHistory({
    userId,
    reason,
    amount,
    targetType,
    targetId,
    grantKey,
    detail,
  });
  await pointRepository.updateUserPoints(userId, Math.max(user.points + amount, 0));

  return amount;
};

/** 하루 첫 접속 +1 (API 명세 11.1). 혼자 트랜잭션을 연다 */
export const grantDailyVisit = async (userId, now = new Date()) =>
  withTransaction(() =>
    changePoints(userId, {
      reason: 'daily_visit',
      changeOf: () => ({ amount: AMOUNTS.daily_visit }),
      targetType: null,
      targetId: null,
      grantKey: `daily_visit:${toKstDay(now).date}`,
    }),
  );

/** 질문 작성 +2, 하루 5개까지 (API 명세 11.1). 질문 등록 트랜잭션 안에서 부른다 */
export const grantQuestionCreate = async (userId, questionId, now = new Date()) =>
  changePoints(userId, {
    reason: 'question_create',
    changeOf: async () => {
      const todayCount = await pointRepository.countPointHistoriesSince(
        userId,
        'question_create',
        toKstDay(now).startAt,
      );

      return { amount: todayCount < QUESTION_CREATE_DAILY_LIMIT ? AMOUNTS.question_create : 0 };
    },
    targetType: 'question',
    targetId: questionId,
    grantKey: `question_create:${questionId}`,
  });

/**
 * 답변 채택: 질문자 +20(질문당 1회), 답변자 +50(답변당 1회) (API 명세 11.1).
 * 채택 트랜잭션 안에서 부른다. 교착을 피하려고 회원 행은 id 순서로 잠근다
 */
export const grantAcceptance = async ({
  questionId,
  questionAuthorId,
  answerId,
  answerAuthorId,
}) => {
  const grants = [
    {
      userId: questionAuthorId,
      reason: 'accept_give',
      targetType: 'question',
      targetId: questionId,
      grantKey: `accept_give:${questionId}`,
    },
    {
      userId: answerAuthorId,
      reason: 'answer_accepted',
      targetType: 'answer',
      targetId: answerId,
      grantKey: `answer_accepted:${answerId}`,
    },
  ].sort((a, b) => a.userId - b.userId);

  for (const { userId, ...grant } of grants) {
    await changePoints(userId, { ...grant, changeOf: () => ({ amount: AMOUNTS[grant.reason] }) });
  }
};

const toPenaltyRate = ({ hideTarget, sanction }, previousCount) => {
  const actionRate = Math.max(
    hideTarget ? PENALTY_HIDE_RATE : 0,
    sanction ? PENALTY_SANCTION_RATES[sanction.type] : 0,
  );
  const daysBonus = sanction ? (PENALTY_DAYS_BONUS[sanction.days] ?? PENALTY_PERMANENT_BONUS) : 0;
  const rate =
    (actionRate || PENALTY_NO_ACTION_RATE) + daysBonus + previousCount * PENALTY_REPEAT_BONUS;

  return Math.min(rate, PENALTY_MAX_RATE);
};

/**
 * 신고 처리(resolved) 차감 (API 명세 11.1). 신고 처리 트랜잭션 안에서 부른다.
 * actionLabel은 처리 내용 요약(예: '대상 숨김 + 7일 정지'). 차감했으면 { rate, amount }, 아니면 null
 */
export const deductForReport = async (userId, { reportId, hideTarget, sanction, actionLabel }) => {
  let rate = 0;
  const amount = await changePoints(userId, {
    reason: 'report_penalty',
    changeOf: async (points) => {
      const previousCount = await pointRepository.countPointHistoriesByReason(
        userId,
        'report_penalty',
      );
      rate = toPenaltyRate({ hideTarget, sanction }, previousCount);

      return { amount: -Math.floor((points * rate) / 100), detail: `${actionLabel} · ${rate}%` };
    },
    targetType: 'report',
    targetId: reportId,
    grantKey: `report_penalty:${reportId}`,
  });

  return amount === 0 ? null : { rate, amount };
};

// 순위 등급의 높이와 알림 제목. 오를 때만 알린다 (API 명세 11.2, 12.1)
const RANK_TIERS = {
  grandmaster: { order: 1, label: 'Grandmaster' },
  challenger: { order: 2, label: 'Challenger' },
};

/**
 * 계산한 순위 등급을 users.ranked_tier에 저장하고, 한 단계 오른 회원에게 알린다.
 * 서버를 다시 켜도 저장한 값과 비교하므로 같은 달성을 다시 알리지 않는다.
 */
const saveRankedTiers = async (rankedRows) =>
  withTransaction(async () => {
    const stored = new Map(
      (await pointRepository.findRankedTiers()).map((row) => [row.id, row.ranked_tier]),
    );

    for (const [index, row] of rankedRows.entries()) {
      const tier = rankedTiers.get(row.id);
      const before = stored.get(row.id) ?? null;
      stored.delete(row.id);

      if (tier === before) {
        continue;
      }

      await pointRepository.updateRankedTier(row.id, tier);

      if (before === null || RANK_TIERS[tier].order > RANK_TIERS[before].order) {
        await notificationService.notifyRankAchieved({
          userId: row.id,
          tierLabel: RANK_TIERS[tier].label,
          rank: index + 1,
        });
      }
    }

    // 순위 밖으로 떨어진 회원은 비운다. 다시 오르면 다시 알린다
    for (const userId of stored.keys()) {
      await pointRepository.updateRankedTier(userId, null);
    }
  });

/**
 * Grandmaster·Challenger 순위를 다시 계산한다 (API 명세 11.2). server.js가 10분마다 부른다.
 * 순위 점수 = 포인트 × (1 + 답변 채택률), 같으면 포인트 많은 순, 가입 빠른 순
 */
export const refreshRankings = async () => {
  const candidates = await pointRepository.findRankingCandidates(LEVEL_START_POINTS[MASTER_LEVEL]);
  const ranked = candidates
    .map((row) => {
      const answerCount = Number(row.answer_count);
      const acceptRate = answerCount === 0 ? 0 : Number(row.accepted_count) / answerCount;

      return { ...row, score: row.points * (1 + acceptRate) };
    })
    .sort(
      (a, b) =>
        b.score - a.score || b.points - a.points || a.created_at - b.created_at || a.id - b.id,
    );

  const rankedRows = ranked.slice(0, CHALLENGER_COUNT + GRANDMASTER_COUNT);

  rankedTiers = new Map(
    rankedRows.map((row, index) => [
      row.id,
      index < CHALLENGER_COUNT ? 'challenger' : 'grandmaster',
    ]),
  );
  await saveRankedTiers(rankedRows);

  return rankedTiers.size;
};

const toPointHistory = (row) => ({
  id: row.id,
  reason: row.reason,
  amount: row.amount,
  targetType: row.target_type,
  targetId: row.target_id,
  detail: row.detail,
  createdAt: row.created_at,
});

/** 내 포인트 내역 (API 명세 11장 GET /api/users/me/point-histories). 최신순 */
export const getMyPointHistories = async (userId, { page, size }) => {
  const [rows, totalCount] = await Promise.all([
    pointRepository.findPointHistoriesByUserId(userId, { limit: size, offset: (page - 1) * size }),
    pointRepository.countPointHistoriesByUserId(userId),
  ]);

  return { pointHistories: rows.map(toPointHistory), meta: { page, size, totalCount } };
};

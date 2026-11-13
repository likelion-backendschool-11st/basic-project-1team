import * as adminDashboardRepository from './admin-dashboard.repository.js';
import * as adminReportService from './admin-report.service.js';

const TREND_DAYS = 7;
const TOP_TAG_COUNT = 10;
const RECENT_REPORT_COUNT = 5;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// 한국 날짜 'YYYY-MM-DD' (서버 시간대와 관계없이 UTC에 9시간을 더해 계산)
const toKstDate = (date) => new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);

// 한국 시간 오늘 0시를 UTC 시각으로 (예: KST 11-16 00:00 = UTC 11-15 15:00)
const getKstTodayStart = (now) => new Date(`${toKstDate(now)}T00:00:00+09:00`);

// 오늘 포함 최근 7일. 질문·가입이 없던 날도 0으로 채운다 (API 명세 10.1)
const buildTrend = (todayStart, questionRows, signupRows) => {
  const questionsByDate = new Map(questionRows.map((row) => [row.date, row.count]));
  const signupsByDate = new Map(signupRows.map((row) => [row.date, row.count]));

  return Array.from({ length: TREND_DAYS }, (_, index) => {
    const date = toKstDate(new Date(todayStart.getTime() + (index - TREND_DAYS + 1) * ONE_DAY_MS));

    return {
      date,
      questions: questionsByDate.get(date) ?? 0,
      signups: signupsByDate.get(date) ?? 0,
    };
  });
};

// share: 전체 공개 질문 대비 비율(%), 소수 첫째 자리 (질문이 없으면 0)
const toTopTags = (rows, totalQuestions) =>
  rows.map((row, index) => ({
    rank: index + 1,
    name: row.name,
    questionCount: row.question_count,
    share: totalQuestions === 0 ? 0 : Math.round((row.question_count / totalQuestions) * 1000) / 10,
  }));

/**
 * 대시보드 현황 (API 명세 10.1). 날짜는 한국 날짜, 질문은 공개(active) 질문만 센다.
 * 처리 대기 신고 수와 최근 5건은 신고 관리 목록과 같은 함수로 만들어 기준이 어긋나지 않게 한다.
 */
export const getDashboardStats = async (now = new Date()) => {
  const todayStart = getKstTodayStart(now);
  const trendStart = new Date(todayStart.getTime() - (TREND_DAYS - 1) * ONE_DAY_MS);

  const [kpis, questionRows, signupRows, tagRows, pendingReports] = await Promise.all([
    adminDashboardRepository.countDashboardKpis(todayStart),
    adminDashboardRepository.countQuestionsByDate(trendStart),
    adminDashboardRepository.countSignupsByDate(trendStart),
    adminDashboardRepository.findTopTags(TOP_TAG_COUNT),
    adminReportService.getReports({ page: 1, size: RECENT_REPORT_COUNT, status: 'pending' }),
  ]);

  return {
    kpis: {
      totalMembers: kpis.total_members,
      todaySignups: kpis.today_signups,
      totalQuestions: kpis.total_questions,
      unresolvedQuestions: kpis.unresolved_questions,
      pendingReports: pendingReports.meta.statusCounts.pending,
    },
    trend: buildTrend(todayStart, questionRows, signupRows),
    topTags: toTopTags(tagRows, kpis.total_questions),
    recentPendingReports: pendingReports.reports.map((report) => ({
      id: report.id,
      targetType: report.targetType,
      targetId: report.targetId,
      // 대상이 삭제됐으면 null (API 명세 10.1)
      preview: report.preview,
      reason: report.reason,
      reporter: report.reporter,
      createdAt: report.createdAt,
    })),
  };
};

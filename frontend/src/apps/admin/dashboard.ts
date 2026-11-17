import type { DashboardStats } from './api/stats';
import { dashboardCopy, kpiDefinitions, reportReasonLabels } from './data/mockData';
import type { Kpi, PendingReportSummary, TrendPoint } from './types';

/** 대시보드 응답을 화면 값으로 바꾼다 (숫자 표기, 날짜 라벨, 강조점 등은 프론트엔드가 계산, API_SPEC 10.1) */

export function toKpis(kpis: DashboardStats['kpis']): readonly Kpi[] {
  return kpiDefinitions.map((definition) => ({
    ...definition,
    value: kpis[definition.field].toLocaleString(),
  }));
}

const pad = (n: number) => String(n).padStart(2, '0');

/** 'YYYY-MM-DD' → '11/15', 마지막 날은 '오늘(16)'. 질문이 가장 많은 날(오늘 제외)을 peak 로 강조 */
export function toTrendPoints(trend: DashboardStats['trend']): readonly TrendPoint[] {
  const lastIndex = trend.length - 1;
  const peakValue = Math.max(0, ...trend.slice(0, lastIndex).map((d) => d.questions));
  const peakIndex = peakValue > 0 ? trend.findIndex((d) => d.questions === peakValue) : -1;

  return trend.map((d, index) => {
    const [, month, day] = d.date.split('-');
    if (index === lastIndex) {
      return {
        label: dashboardCopy.todayLabel(Number(day)),
        questions: d.questions,
        signups: d.signups,
        emphasis: 'today',
      };
    }
    return {
      label: `${month}/${day}`,
      questions: d.questions,
      signups: d.signups,
      ...(index === peakIndex ? { emphasis: 'peak' as const } : {}),
    };
  });
}

/** y축 눈금 5개 (위에서 아래로). 가장 큰 값을 덮는 깔끔한 단위로 올린다 */
export function trendTicks(trend: DashboardStats['trend']): readonly number[] {
  const max = Math.max(0, ...trend.flatMap((d) => [d.questions, d.signups]));
  const rawStep = Math.max(1, max / 4);
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 10].map((n) => n * magnitude).find((n) => n >= rawStep) ?? rawStep;
  const niceStep = Math.max(1, Math.ceil(step));
  return [4, 3, 2, 1, 0].map((i) => i * niceStep);
}

/** 신고일은 보는 사람의 현지 시각 'MM-DD', 'HH:mm' */
export function toPendingSummaries(
  reports: DashboardStats['recentPendingReports'],
): readonly PendingReportSummary[] {
  return reports.map((r) => {
    const d = new Date(r.createdAt);
    return {
      id: r.id,
      date: `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
      contentId: r.targetId,
      title: r.preview,
      reason: reportReasonLabels[r.reason],
      reporter: r.reporter.nickname,
    };
  });
}

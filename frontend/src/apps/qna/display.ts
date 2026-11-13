import { communityStatsCopy as C, questionDetailLabels } from './data/mockData';
import type { CommunityStat, QuestionStats } from './data/types';

/**
 * Q&A 화면 표시용 가공. 서버는 원래 값(ISO 시각, 숫자)을 내려 주고 가공은 프론트엔드가 한다 (API_SPEC 1.4)
 */

const pad = (n: number) => String(n).padStart(2, '0');

/** HOT 배지 기준 조회수. 배지는 프론트엔드가 viewCount 로 정한다 (API_SPEC 3장) */
const HOT_VIEW_COUNT = 200;

/** "2026.11.10" (보는 사람의 현지 날짜) */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

/** "2026.11.10 14:23" (보는 사람의 현지 시각) */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${formatDate(iso)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "2,334" */
export function formatCount(count: number): string {
  return count.toLocaleString('ko-KR');
}

export function isHotQuestion(viewCount: number): boolean {
  return viewCount >= HOT_VIEW_COUNT;
}

/** 커뮤니티 통계 카드 4개. 값이 없으면(불러오기 전·실패·해당 데이터 없음) '-' */
export function toCommunityStats(stats: QuestionStats | null): CommunityStat[] {
  const average = stats?.averageFirstAnswerMinutes ?? null;
  const trending = stats?.trendingTag ?? null;

  return [
    {
      label: C.todayAccepted.label,
      value: stats ? C.todayAccepted.value(formatCount(stats.todayAcceptedCount)) : C.empty,
      valueTone: 'secondary',
      note: stats ? C.todayAccepted.note(stats.acceptRate) : '',
      noteTone: 'subtle',
    },
    {
      label: C.firstAnswer.label,
      value: average === null ? C.empty : C.firstAnswer.value(formatCount(average)),
      valueTone: 'ink',
      note: C.firstAnswer.note,
      noteTone: 'subtle',
    },
    {
      label: C.trendingTag.label,
      value: trending ? C.trendingTag.value(trending.name) : C.empty,
      valueTone: 'primary',
      note: trending ? C.trendingTag.note(formatCount(trending.questionCount)) : '',
      noteTone: 'subtle',
    },
    {
      label: C.unanswered.label,
      value: stats ? C.unanswered.value(formatCount(stats.unansweredCount)) : C.empty,
      valueTone: 'tertiary',
      note: C.unanswered.note,
      noteTone: 'link',
    },
  ];
}

/** 질문 상태 배지: 채택 완료 / 답변 접수중 / 답변 대기 */
export function questionStatusLabel(question: {
  readonly isAccepted: boolean;
  readonly answerCount: number;
}): string {
  const { status } = questionDetailLabels;
  if (question.isAccepted) return status.accepted;
  return question.answerCount > 0 ? status.answered : status.waiting;
}

import { useParams, useSearchParams } from 'react-router-dom';
import { htmlToText } from '../../../shared/editor/richText';
import { answers, questionDetail, reportTargetKinds, reportTargetMocks } from '../data/mockData';
import type { ReportTarget, ReportTargetType } from '../data/types';
import { routes } from '../routes';

const TYPES: readonly ReportTargetType[] = ['question', 'answer', 'post', 'comment'];

/** 신고 화면 문맥. 경로는 모두 모듈 prefix 를 포함한 전체 경로다 */
export interface ReportContext {
  readonly target: ReportTarget;
  /** 신고를 취소하거나 닫으면 돌아갈 곳 (대상 글) */
  readonly backHref: string;
  /** 신고 완료 후 '목록으로' 이동할 곳 */
  readonly listHref: string;
  readonly listLabel: string;
  /** 이 대상의 신고 화면 / 신고 완료 화면 (qna 모듈 안 경로) */
  readonly reportPath: string;
  readonly completePath: string;
}

// 다른 사이트로 보내는 주소는 받지 않는다
const safePath = (value: string | null) =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : null;

/**
 * 신고 대상과 돌아갈 곳. 질문·답변·게시글·댓글 모두 같은 신고 화면을 쓴다 (API_SPEC 8장).
 * 경로: /qna/report/:targetType/:targetId?from=<돌아갈 전체 경로>. 질문은 /qna/questions/:id/report 도 쓴다.
 * TODO: 대상 요약은 대상 종류별 상세 API 로 받는다.
 */
export function useReportTarget(): ReportContext {
  const params = useParams();
  const [search] = useSearchParams();
  const rawType = params.targetType as ReportTargetType | undefined;
  const type: ReportTargetType = rawType && TYPES.includes(rawType) ? rawType : 'question';
  const id = params.targetId ?? params.id ?? '1';
  const from = safePath(search.get('from'));
  const isLegacyQuestion = params.targetId === undefined;
  const reportPath = isLegacyQuestion ? routes.report(id) : routes.reportTarget(type, id, from);
  const completePath = isLegacyQuestion
    ? routes.reportComplete(id)
    : routes.reportTargetComplete(type, id, from);

  if (type === 'answer') {
    const answer = answers.find((a) => a.id === id);
    return {
      target: {
        type,
        id,
        kindLabel: reportTargetKinds.answer,
        title: questionDetail.title,
        tags: questionDetail.tags,
        excerpt: answer ? `"${htmlToText(answer.body).slice(0, 120)}..."` : '',
        author: answer
          ? { initial: answer.author.initial, name: answer.author.name, title: answer.author.level }
          : { initial: '?', name: '' },
        date: answer?.answeredAt ?? '',
      },
      backHref: from ?? `/qna${routes.question(questionDetail.id)}`,
      listHref: `/qna${routes.questions()}`,
      listLabel: '질문 목록으로 이동',
      reportPath,
      completePath,
    };
  }
  if (type === 'post' || type === 'comment') {
    return {
      target: { ...reportTargetMocks[type], id },
      backHref: from ?? (type === 'post' ? `/board/posts/${id}` : '/board'),
      listHref: '/board',
      listLabel: '자유게시판으로 이동',
      reportPath,
      completePath,
    };
  }
  return {
    target: { ...reportTargetMocks.question, id },
    backHref: from ?? `/qna${routes.question(id)}`,
    listHref: `/qna${routes.questions()}`,
    listLabel: '질문 목록으로 이동',
    reportPath,
    completePath,
  };
}

/**
 * Q&A 화면 경로. Q&A·자유게시판은 라우터 하나(site 모듈)를 같이 쓰므로 `/qna` 를 포함한 전체 경로다.
 */
const Q = '/qna';

export const routes = {
  home: () => Q,
  questions: () => `${Q}/questions`,
  questionsByTag: (tag: string) => `${Q}/questions?tag=${encodeURIComponent(tag)}`,
  newQuestion: () => `${Q}/questions/new`,
  question: (id: number | string) => `${Q}/questions/${id}`,
  editQuestion: (id: number | string) => `${Q}/questions/${id}/edit`,
  editAnswer: (id: number | string, answerId: number | string) =>
    `${Q}/questions/${id}/answers/${answerId}/edit`,
  /** 프로필 답변 목록에서 들어오는 주소. 상세 화면이 이 답변으로 스크롤한다 */
  answerAnchor: (answerId: number | string) => `answer-${answerId}`,
  report: (id: number | string) => `${Q}/questions/${id}/report`,
  reportComplete: (id: number | string) => `${Q}/questions/${id}/report/complete`,
  /** 질문·답변·게시글·댓글 공통 신고 화면. `from` 은 돌아갈 전체 경로 */
  reportTarget: (type: string, id: number | string, from?: string | null) =>
    `${Q}/report/${type}/${id}${from ? `?from=${encodeURIComponent(from)}` : ''}`,
  reportTargetComplete: (type: string, id: number | string, from?: string | null) =>
    `${Q}/report/${type}/${id}/complete${from ? `?from=${encodeURIComponent(from)}` : ''}`,
  notices: () => `${Q}/notices`,
  notice: (id: number | string) => `${Q}/notices/${id}`,
} as const;

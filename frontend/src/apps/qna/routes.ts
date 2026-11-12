/** Central route builders so every Stitch `href="#"` maps to a real path. */
export const routes = {
  home: () => '/',
  questions: () => '/questions',
  questionsByTag: (tag: string) => `/questions?tag=${encodeURIComponent(tag)}`,
  newQuestion: () => '/questions/new',
  question: (id: number | string) => `/questions/${id}`,
  editQuestion: (id: number | string) => `/questions/${id}/edit`,
  editAnswer: (id: number | string, answerId: string) => `/questions/${id}/answers/${answerId}/edit`,
  /** 프로필 답변 목록에서 들어오는 주소. 상세 화면이 이 답변으로 스크롤한다 */
  answerAnchor: (answerId: string) => `answer-${answerId}`,
  report: (id: number | string) => `/questions/${id}/report`,
  reportComplete: (id: number | string) => `/questions/${id}/report/complete`,
  notices: () => '/notices',
  notice: (id: number | string) => `/notices/${id}`,
} as const;

/** Central route builders so every Stitch `href="#"` maps to a real path. */
export const routes = {
  home: () => '/',
  questions: () => '/questions',
  questionsByTag: (tag: string) => `/questions?tag=${encodeURIComponent(tag)}`,
  newQuestion: () => '/questions/new',
  question: (id: number | string) => `/questions/${id}`,
  editQuestion: (id: number | string) => `/questions/${id}/edit`,
  editAnswer: (id: number | string, answerId: string) => `/questions/${id}/answers/${answerId}/edit`,
  report: (id: number | string) => `/questions/${id}/report`,
  reportComplete: (id: number | string) => `/questions/${id}/report/complete`,
} as const;

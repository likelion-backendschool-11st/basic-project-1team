/**
 * mock: 삭제 상태(deleted)로 바꾼 질문·답변 id.
 * 삭제는 행을 지우지 않고 상태만 바꾸는 soft delete 이며(API_SPEC 1.7), 삭제된 글은 목록·상세에서 빠진다.
 * TODO: API 연동 후에는 서버 응답(목록에서 빠짐, 상세 404)을 그대로 쓰고 이 파일은 지운다.
 */
const deletedQuestionIds = new Set<string>();
const deletedAnswerIds = new Set<string>();

export const markQuestionDeleted = (id: number | string) => deletedQuestionIds.add(String(id));
export const isQuestionDeleted = (id: number | string) => deletedQuestionIds.has(String(id));
export const markAnswerDeleted = (id: string) => deletedAnswerIds.add(id);
export const isAnswerDeleted = (id: string) => deletedAnswerIds.has(id);

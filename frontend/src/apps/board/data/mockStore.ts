/**
 * mock: 삭제 상태(deleted)로 바꾼 게시글·댓글 id.
 * 삭제는 행을 지우지 않고 상태만 바꾸는 soft delete 이며(API_SPEC 1.7), 삭제된 글은 목록·상세에서 빠진다.
 * TODO: API 연동 후에는 서버 응답(목록에서 빠짐, 상세 404)을 그대로 쓰고 이 파일은 지운다.
 */
const deletedPostIds = new Set<number>();
const deletedCommentIds = new Set<number>();

export const markPostDeleted = (id: number) => deletedPostIds.add(id);
export const isPostDeleted = (id: number) => deletedPostIds.has(id);
export const markCommentDeleted = (id: number) => deletedCommentIds.add(id);
export const isCommentDeleted = (id: number) => deletedCommentIds.has(id);

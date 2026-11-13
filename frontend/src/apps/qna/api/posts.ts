import { apiPageRequest, apiRequest, toQueryString, type PageResult } from '../../../shared/api';
import type { CommentSummary, PostSummary } from '../data/types';

/** GET /api/posts/:postId (API_SPEC 7장). 게시글·댓글 신고 화면의 대상 요약에 쓴다 */
export function getPost(postId: number | string): Promise<PostSummary> {
  return apiRequest<PostSummary>(`/posts/${postId}`);
}

/** GET /api/posts/:postId/comments (API_SPEC 7장). 오래된 순서 */
export function getPostComments(
  postId: number | string,
  page: number,
  size: number,
): Promise<PageResult<CommentSummary>> {
  return apiPageRequest<CommentSummary>(
    `/posts/${postId}/comments${toQueryString({ page, size })}`,
  );
}

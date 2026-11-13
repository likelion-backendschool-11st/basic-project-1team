import { apiPageRequest, apiRequest, toQueryString, type PageResult } from '../../../shared/api';
import type { Comment, PostDetail, PostInput, PostSort, PostSummary } from '../data/types';

export interface PostListQuery {
  readonly page: number;
  readonly size: number;
  readonly sort?: PostSort;
  /** 제목 검색어 (대소문자 구분, API_SPEC 1.10) */
  readonly keyword?: string;
  /** 이 회원이 쓴 글만 (내 게시글, 프로필 "전체 보기") */
  readonly authorId?: number;
}

/** GET /api/posts (API_SPEC 7장) */
export function getPosts(query: PostListQuery): Promise<PageResult<PostSummary>> {
  return apiPageRequest<PostSummary>(`/posts${toQueryString({ ...query })}`);
}

/** GET /api/posts/:postId. 서버가 조회수를 올린다 (같은 회원·IP는 24시간에 한 번) */
export function getPost(postId: number): Promise<PostDetail> {
  return apiRequest<PostDetail>(`/posts/${postId}`);
}

/** POST /api/posts */
export function createPost(input: PostInput): Promise<PostDetail> {
  return apiRequest<PostDetail>('/posts', { method: 'POST', body: input });
}

/** PATCH /api/posts/:postId */
export function updatePost(postId: number, input: Partial<PostInput>): Promise<PostDetail> {
  return apiRequest<PostDetail>(`/posts/${postId}`, { method: 'PATCH', body: input });
}

/** DELETE /api/posts/:postId. 댓글도 함께 삭제된다 */
export function deletePost(postId: number): Promise<void> {
  return apiRequest<void>(`/posts/${postId}`, { method: 'DELETE' });
}

/** GET /api/posts/:postId/comments. 오래된 순 */
export function getComments(
  postId: number,
  page: number,
  size: number,
): Promise<PageResult<Comment>> {
  return apiPageRequest<Comment>(`/posts/${postId}/comments${toQueryString({ page, size })}`);
}

/** POST /api/posts/:postId/comments */
export function createComment(postId: number, body: string): Promise<Comment> {
  return apiRequest<Comment>(`/posts/${postId}/comments`, { method: 'POST', body: { body } });
}

/** DELETE /api/comments/:commentId */
export function deleteComment(commentId: number): Promise<void> {
  return apiRequest<void>(`/comments/${commentId}`, { method: 'DELETE' });
}

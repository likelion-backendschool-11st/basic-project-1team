import { apiPageRequest, apiRequest, toQueryString, type PageResult } from '../../../shared/api';
import type { Answer, Comment, ContentStatus, ContentType, Post, Question } from '../types';

/** 종류별 응답 항목 */
export interface ContentItemMap {
  readonly question: Question;
  readonly answer: Answer;
  readonly post: Post;
  readonly comment: Comment;
}

const PATHS: Readonly<Record<ContentType, string>> = {
  question: '/admin/questions',
  answer: '/admin/answers',
  post: '/admin/posts',
  comment: '/admin/comments',
};

export interface ContentListQuery {
  readonly page: number;
  readonly size: number;
  /** 질문·게시글은 제목, 답변·댓글은 본문, 그리고 작성자 닉네임 */
  readonly keyword?: string;
  /** 생략하면 삭제된 항목을 뺀 전체 */
  readonly status?: ContentStatus;
  /** 질문·답변만 */
  readonly authorId?: number;
  /** 질문만 */
  readonly tag?: string;
}

/** GET /api/admin/{questions,answers,posts,comments} (API_SPEC 10.3·10.4) */
export function getContents<T extends ContentType>(
  type: T,
  query: ContentListQuery,
): Promise<PageResult<ContentItemMap[T]>> {
  return apiPageRequest<ContentItemMap[T]>(`${PATHS[type]}${toQueryString({ ...query })}`);
}

/** PATCH 숨김(hidden) / 복구(active). 사유는 선택이고 활동 로그에 남는다 */
export function updateContentStatus<T extends ContentType>(
  type: T,
  id: number,
  status: 'hidden' | 'active',
  reason: string,
): Promise<ContentItemMap[T]> {
  return apiRequest<ContentItemMap[T]>(`${PATHS[type]}/${id}`, {
    method: 'PATCH',
    body: { status, reason: reason.trim() || undefined },
  });
}

/** DELETE 삭제 (soft delete, 되돌릴 수 없음) */
export function deleteContent(type: ContentType, id: number): Promise<void> {
  return apiRequest<void>(`${PATHS[type]}/${id}`, { method: 'DELETE' });
}

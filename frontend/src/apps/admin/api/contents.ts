import { apiPageRequest, apiRequest, toQueryString, type PageResult } from '../../../shared/api';
import type {
  Answer,
  AnswerDetail,
  Comment,
  CommentDetail,
  ContentStatus,
  ContentType,
  Post,
  PostDetail,
  Question,
  QuestionDetail,
} from '../types';

/** 종류별 응답 항목 */
export interface ContentItemMap {
  readonly question: Question;
  readonly answer: Answer;
  readonly post: Post;
  readonly comment: Comment;
}

/** 종류별 관리자 상세 */
export interface ContentDetailMap {
  readonly question: QuestionDetail;
  readonly answer: AnswerDetail;
  readonly post: PostDetail;
  readonly comment: CommentDetail;
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

/** GET .../:id 관리자 상세. 숨김·삭제된 글도 본문까지 받는다 (API_SPEC 10.3·10.4) */
export function getContentDetail<T extends ContentType>(
  type: T,
  id: number,
): Promise<ContentDetailMap[T]> {
  return apiRequest<ContentDetailMap[T]>(`${PATHS[type]}/${id}`);
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

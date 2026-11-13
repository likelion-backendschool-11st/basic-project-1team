/** 작성자 정보. 탈퇴한 회원은 id 가 null 이고 닉네임이 '탈퇴한 회원'이다 (API_SPEC 1.6) */
export interface UserSummary {
  readonly id: number | null;
  readonly nickname: string;
  readonly profileImageUrl: string | null;
}

/** 목록 정렬 (API_SPEC 7장 GET /api/posts) */
export type PostSort = 'latest' | 'oldest';

/** 게시글 목록 항목 (GET /api/posts) */
export interface PostSummary {
  readonly id: number;
  readonly title: string;
  readonly author: UserSummary;
  readonly viewCount: number;
  readonly commentCount: number;
  readonly isMine: boolean;
  /** ISO 8601 (UTC) */
  readonly createdAt: string;
}

/** 게시글 상세 (GET /api/posts/:postId). body 는 에디터가 만든 HTML */
export interface PostDetail extends PostSummary {
  readonly body: string;
  readonly isEdited: boolean;
  readonly updatedAt: string;
}

/** 작성·수정 요청 (POST·PATCH /api/posts). 수정은 보낸 필드만 바뀐다 */
export interface PostInput {
  readonly title: string;
  readonly body: string;
}

/** 댓글 (GET /api/posts/:postId/comments). body 는 일반 텍스트 */
export interface Comment {
  readonly id: number;
  readonly body: string;
  readonly author: UserSummary;
  readonly isMine: boolean;
  readonly createdAt: string;
}

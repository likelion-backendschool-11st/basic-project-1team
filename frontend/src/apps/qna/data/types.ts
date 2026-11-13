/** 다른 객체 안의 회원 정보. 탈퇴 회원은 id 가 null, 닉네임은 '탈퇴한 회원' (API_SPEC 1.6) */
export interface UserSummary {
  readonly id: number | null;
  readonly nickname: string;
  readonly profileImageUrl: string | null;
}

/** GET /api/questions 의 항목 (API_SPEC 3장). 표시용 가공(날짜·천 단위·HOT)은 화면에서 한다 */
export interface QuestionListItem {
  readonly id: number;
  readonly title: string;
  /** 목록의 태그 칸에는 tags[0] 을 보여 준다 */
  readonly tags: readonly string[];
  readonly answerCount: number;
  readonly isAccepted: boolean;
  readonly viewCount: number;
  readonly author: UserSummary;
  readonly createdAt: string;
}

export type QuestionSort = 'latest' | 'views';
export type QuestionSearchScope = 'all' | 'title' | 'tag' | 'author';

/** GET /api/questions 의 query (API_SPEC 3장). undefined 인 조건은 보내지 않는다 */
export interface QuestionListQuery {
  readonly page: number;
  readonly size: number;
  readonly sort: QuestionSort;
  readonly scope: QuestionSearchScope;
  readonly keyword?: string;
  readonly tag?: string;
  readonly hasAnswer?: boolean;
  readonly isAccepted?: boolean;
  readonly authorId?: number;
  readonly answerAuthorId?: number;
}

/** 질문 상세 객체. GET /api/questions/:questionId, 등록·수정 응답 (API_SPEC 3장) */
export interface Question {
  readonly id: number;
  readonly title: string;
  /** 서버가 정리(sanitize)한 본문 HTML */
  readonly body: string;
  readonly tags: readonly string[];
  readonly author: UserSummary;
  readonly viewCount: number;
  readonly answerCount: number;
  readonly isAccepted: boolean;
  readonly isEdited: boolean;
  /** 로그인한 회원이 작성자인지 (수정·삭제 버튼) */
  readonly isMine: boolean;
  readonly createdAt: string;
  /** 제목·본문·태그를 마지막으로 수정한 시각. 수정한 적이 없으면 null */
  readonly editedAt: string | null;
  readonly updatedAt: string;
}

/** POST /api/questions 요청 (API_SPEC 3장) */
export interface QuestionInput {
  readonly title: string;
  readonly body: string;
  readonly tags: readonly string[];
}

/** PATCH /api/questions/:questionId 요청. 보낸 필드만 수정한다 (API_SPEC 3장) */
export interface QuestionUpdateInput extends Partial<QuestionInput> {
  /** 수정 사유 (선택, 최대 200자) */
  readonly editReason?: string;
}

export type AnswerSort = 'latest' | 'votes';

/** 답변 객체 (API_SPEC 4장). isVoted·isMine·canAccept 는 로그인하지 않았으면 false */
export interface Answer {
  readonly id: number;
  readonly questionId: number;
  /** 서버가 정리(sanitize)한 본문 HTML */
  readonly body: string;
  readonly author: UserSummary;
  readonly voteCount: number;
  readonly isVoted: boolean;
  readonly isAccepted: boolean;
  readonly isEdited: boolean;
  readonly isMine: boolean;
  /** 질문 작성자이고, 본인 답변이 아니고, 채택된 답변이 없을 때만 true */
  readonly canAccept: boolean;
  readonly createdAt: string;
  /** 본문을 마지막으로 수정한 시각. 수정한 적이 없으면 null */
  readonly editedAt: string | null;
  readonly updatedAt: string;
}

/** 답변 추천·추천 취소 응답 (API_SPEC 4장) */
export interface VoteResult {
  readonly answerId: number;
  readonly voteCount: number;
  readonly isVoted: boolean;
}

/** GET /api/tags 의 항목 (API_SPEC 5장) */
export interface TagSummary {
  readonly id: number;
  readonly name: string;
  readonly questionCount: number;
}

/** GET /api/questions/stats (API_SPEC 3장). 값이 없으면 평균·트렌딩 태그는 null */
export interface QuestionStats {
  readonly todayAcceptedCount: number;
  readonly acceptRate: number;
  readonly averageFirstAnswerMinutes: number | null;
  readonly trendingTag: { readonly name: string; readonly questionCount: number } | null;
  readonly unansweredCount: number;
}

export interface CommunityStat {
  readonly label: string;
  readonly value: string;
  readonly valueTone: 'secondary' | 'ink' | 'primary' | 'tertiary';
  readonly note: string;
  readonly noteTone: 'subtle' | 'secondary' | 'link';
}

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface MetaRow {
  readonly label: string;
  readonly value: string;
  readonly tone?: 'success-badge' | 'code' | 'primary';
}

/** GET /api/questions/:questionId/related 의 항목 (API_SPEC 3장) */
export interface RelatedQuestion {
  readonly id: number;
  readonly title: string;
  readonly answerCount: number;
  readonly isAccepted: boolean;
  readonly createdAt: string;
}

export interface Attachment {
  readonly id: string;
  readonly name: string;
  readonly size: string;
  /** 신고 증빙은 이미지 파일만 받는다 (API_SPEC 1.6) */
  readonly kind: 'image';
  readonly note?: string;
}

export interface GuideItem {
  readonly title: string;
  readonly body: string;
}

/** GET .../edit-histories 의 항목 (API_SPEC 3·4장). 최신순 */
export interface EditHistory {
  readonly id: number;
  readonly editedAt: string;
  /** 작성자 또는 관리 권한 회원 */
  readonly editor: UserSummary;
  /** 입력하지 않았으면 null */
  readonly editReason: string | null;
}

export interface ReportReason {
  readonly value: ReportReasonValue;
  readonly label: string;
  readonly description: string;
}

/** 신고 사유 (API_SPEC 8장 공통 Enum) */
export type ReportReasonValue =
  'spam' | 'abuse' | 'illegal' | 'spoiler' | 'misinformation' | 'privacy' | 'etc';

/** POST /api/reports 요청 (API_SPEC 8장) */
export interface ReportInput {
  readonly targetType: ReportTargetType;
  readonly targetId: number;
  readonly reason: ReportReasonValue;
  /** 일반 텍스트, 최대 1000자. reason 이 etc 면 필수 */
  readonly detail?: string;
  /** purpose=report_evidence 로 올린 파일 id, 최대 3개 */
  readonly attachmentIds: readonly number[];
}

/** POST /api/reports 응답 (API_SPEC 8장) */
export interface ReportReceipt {
  readonly id: number;
  /** REP-<KST 접수일>-<id> */
  readonly receiptNumber: string;
  readonly targetType: ReportTargetType;
  readonly targetId: number;
  readonly reason: ReportReasonValue;
  readonly status: 'pending' | 'resolved' | 'rejected' | 'canceled';
  /** 처리 대기열에서 몇 번째인지 */
  readonly queuePosition: number | null;
  readonly createdAt: string;
}

/** POST /api/attachments 응답 (API_SPEC 1.6 Attachment) */
export interface UploadedAttachment {
  readonly id: number;
  readonly name: string;
  readonly url: string;
  readonly size: number;
  readonly kind: 'image';
}

/** GET /api/posts/:postId 중 신고 대상 요약에 쓰는 값 (API_SPEC 7장) */
export interface PostSummary {
  readonly id: number;
  readonly title: string;
  readonly body: string;
  readonly author: UserSummary;
  readonly viewCount: number;
  readonly commentCount: number;
  readonly createdAt: string;
}

/** GET /api/posts/:postId/comments 의 항목 (API_SPEC 7장) */
export interface CommentSummary {
  readonly id: number;
  readonly body: string;
  readonly author: UserSummary;
  readonly createdAt: string;
}

/** 신고 대상 종류 (API_SPEC 8장 targetType) */
export type ReportTargetType = 'question' | 'answer' | 'post' | 'comment';

/** 신고 화면에 보여 줄 대상 요약 */
export interface ReportTarget {
  readonly type: ReportTargetType;
  readonly id: string;
  /** 예: '질문', '게시글' */
  readonly kindLabel: string;
  readonly title: string;
  readonly tags: readonly string[];
  /** 본문 앞부분 (태그를 뺀 글자) */
  readonly excerpt: string;
  readonly author: { readonly initial: string; readonly name: string; readonly title?: string };
  readonly date: string;
  readonly stats?: { readonly views: string; readonly answers: string };
}

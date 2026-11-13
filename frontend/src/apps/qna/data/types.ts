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

/** mock 질문 (상세 화면이 API 로 바뀌기 전까지 사용, #34) */
export interface QuestionSummary {
  readonly id: number;
  readonly title: string;
  readonly tag: string;
  readonly answers: number;
  readonly accepted: boolean;
  readonly author: string;
  readonly date: string;
  readonly views: string;
  /** HOT 배지. 조회수·답변 수로 프론트엔드가 정한다 (API_SPEC 3장) */
  readonly badge?: { readonly label: string; readonly tone: 'hot' };
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

export interface RelatedQuestion {
  readonly id: number;
  readonly title: string;
  readonly status: string;
  readonly solved: boolean;
  readonly ago: string;
}

export interface Answer {
  readonly id: string;
  readonly accepted: boolean;
  readonly answeredAt: string;
  /** 마지막 수정 시각. 수정한 적이 없으면 없음 (API 의 editedAt: null) */
  readonly editedAt?: string;
  /** 에디터로 작성한 본문 HTML (API 의 body) */
  readonly body: string;
  readonly author: {
    readonly name: string;
    readonly initial: string;
    readonly level: string;
    readonly title: string;
  };
  readonly votes: number;
  readonly canEdit: boolean;
  /** 질문 작성자이고, 본인 답변이 아니고, 채택된 답변이 없을 때만 true (API_SPEC §4) */
  readonly canAccept: boolean;
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

export interface EditHistory {
  readonly id: number;
  readonly editedAt: string;
  /** 수정한 회원 닉네임 (작성자 또는 관리 권한 회원) */
  readonly editor: string;
  /** 입력하지 않았으면 null */
  readonly editReason: string | null;
}

export interface ReportReason {
  readonly value: string;
  readonly label: string;
  readonly description: string;
}

/** 질문 상세 화면 값. GET /api/questions/:questionId 응답을 화면용으로 바꾼 모양 (API_SPEC 3장) */
export interface QuestionDetail {
  readonly id: number;
  readonly status: string;
  readonly title: string;
  readonly author: { readonly name: string; readonly initial: string };
  readonly postedAt: string;
  /** 마지막 수정 시각. 수정한 적이 없으면 null (API 의 editedAt) */
  readonly editedAt: string | null;
  readonly views: string;
  /** 에디터로 작성한 본문 HTML (API 의 body) */
  readonly body: string;
  readonly tags: readonly string[];
  readonly answerCount: number;
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

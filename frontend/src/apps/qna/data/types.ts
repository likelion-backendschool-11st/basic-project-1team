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

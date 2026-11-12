export interface NavItem {
  readonly label: string;
  readonly to: string;
}

export interface QuestionSummary {
  readonly id: number;
  readonly title: string;
  readonly tag: string;
  readonly answers: number;
  readonly accepted: boolean;
  readonly author: string;
  readonly date: string;
  readonly views: string;
  readonly badge?: { readonly label: string; readonly tone: 'neutral' | 'hot' };
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

export interface AnswerParagraph {
  readonly kind: 'text' | 'muted';
  readonly text: string;
}

export interface AnswerPoint {
  readonly heading: string;
  readonly body: string;
}

export interface Answer {
  readonly id: string;
  readonly accepted: boolean;
  readonly answeredAt: string;
  readonly intro?: string;
  readonly points?: readonly AnswerPoint[];
  readonly paragraphs: readonly AnswerParagraph[];
  readonly tip?: string;
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
  readonly kind: 'image' | 'log';
  readonly note?: string;
}

export interface GuideItem {
  readonly title: string;
  readonly body: string;
}

export interface Notice {
  readonly id: number;
  readonly title: string;
  /** 목록 응답에는 없고 상세 응답에만 있다 (API_SPEC 9장). */
  readonly body: string;
  readonly isPinned: boolean;
  readonly author: string;
  readonly createdAt: string;
}

export interface ReportReason {
  readonly value: string;
  readonly label: string;
  readonly description: string;
}

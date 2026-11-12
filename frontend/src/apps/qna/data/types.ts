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

export interface ReportReason {
  readonly value: string;
  readonly label: string;
  readonly description: string;
}

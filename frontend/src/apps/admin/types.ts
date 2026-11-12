export type Role = 'USER' | 'ADMIN';
export type MemberStatus = 'active' | 'suspended';

export interface Member {
  readonly id: number;
  readonly username: string;
  readonly nickname: string;
  readonly role: Role;
  readonly status: MemberStatus;
  /** MM/DD, only when suspended */
  readonly suspendedUntil?: string;
  readonly joinedAt: string;
}

export type SanctionKind = 'suspend' | 'unsuspend';

export interface SanctionRecord {
  readonly at: string;
  readonly admin: string;
  readonly kind: SanctionKind;
  readonly label: string;
  readonly reason: string;
}

export interface MemberActivity {
  readonly questions: number;
  readonly answers: number;
  readonly reportsReceived: number;
}

export interface Question {
  readonly id: number;
  readonly title: string;
  readonly author: string;
  readonly tag: string;
  readonly answers: number;
  readonly resolved: boolean;
  readonly hidden: boolean;
  readonly createdAt: string;
}

export interface Post {
  readonly id: number;
  readonly title: string;
  readonly author: string;
  readonly comments: number;
  readonly hidden: boolean;
  readonly createdAt: string;
}

export interface Tag {
  readonly name: string;
  readonly description: string;
  readonly usage: number;
  readonly createdAt: string;
}

export type ReportTarget = 'question' | 'answer' | 'post' | 'comment';
export type ReportReason = 'spam' | 'abuse' | 'illegal' | 'spoiler' | 'misinformation' | 'privacy' | 'etc';
export type ReportStatus = 'pending' | 'resolved' | 'rejected';
export type SanctionOption = 'none' | 'ban_3' | 'ban_7' | 'ban_30';

export interface Report {
  readonly id: number;
  readonly target: ReportTarget;
  readonly targetId: number;
  readonly preview: string;
  readonly fullText: string;
  readonly author: string;
  readonly reason: ReportReason;
  readonly reporter: string;
  readonly reportedAt: string;
  readonly reportedTime: string;
  readonly status: ReportStatus;
  readonly duplicateCount: number;
}

export interface Notice {
  readonly id: number;
  readonly title: string;
  readonly body: string;
  readonly author: string;
  readonly createdAt: string;
  readonly pinned: boolean;
}

export type LogAction =
  | 'RESOLVE_REPORT'
  | 'SUSPEND_USER'
  | 'UNSUSPEND_USER'
  | 'HIDE_QUESTION'
  | 'HIDE_POST'
  | 'DELETE_POST'
  | 'MERGE_TAG';

export interface ActivityLog {
  readonly id: number;
  readonly at: string;
  readonly date: string;
  readonly admin: string;
  readonly action: LogAction;
  readonly targetLabel: string;
  readonly targetHref: string;
  readonly detail: string;
}

export type KpiTone = 'default' | 'attention' | 'urgent';

export interface Kpi {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly icon: string;
  readonly tone: KpiTone;
  readonly href: string;
}

export interface TopTag {
  readonly rank: number;
  readonly name: string;
  readonly count: number;
  readonly share: number;
}

export interface TrendPoint {
  readonly label: string;
  readonly questions: number;
  readonly signups: number;
  readonly emphasis?: 'peak' | 'today';
}

export interface PendingReportSummary {
  readonly date: string;
  readonly time: string;
  readonly contentId: number;
  readonly title: string;
  readonly reason: string;
  readonly reporter: string;
}

export interface NavEntry {
  readonly to: string;
  readonly label: string;
  readonly icon: string;
  readonly badge?: number;
  readonly danger?: boolean;
}

export interface SelectOption<V extends string = string> {
  readonly value: V;
  readonly label: string;
}

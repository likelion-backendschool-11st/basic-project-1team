export type Role = 'USER' | 'ADMIN';
/** suspend: 이용 정지, write_ban: 글쓰기 제한, comment_ban: 댓글 제한 (API_SPEC 1.2) */
export type SanctionType = 'suspend' | 'write_ban' | 'comment_ban';
/** 'permanent' = 영구 (API 의 days: null) */
export type SanctionDays = '3' | '7' | '30' | 'permanent';
/** sanctions 로 계산: 정지가 있으면 suspended, 제한만 있으면 restricted */
export type MemberStatus = 'active' | 'restricted' | 'suspended';

export interface ActiveSanction {
  readonly type: SanctionType;
  /** MM/DD 해제일, null 이면 영구 */
  readonly until: string | null;
}

export interface Member {
  readonly id: number;
  readonly username: string;
  readonly nickname: string;
  readonly role: Role;
  /** 지금 걸려 있는 제재 */
  readonly sanctions: readonly ActiveSanction[];
  readonly joinedAt: string;
}

export type SanctionAction = 'apply' | 'release';

export interface SanctionRecord {
  readonly at: string;
  readonly admin: string;
  readonly action: SanctionAction;
  readonly type: SanctionType;
  readonly label: string;
  readonly reason: string;
}

export interface MemberActivity {
  readonly questions: number;
  readonly answers: number;
  readonly reportsReceived: number;
}

/** soft delete: 삭제는 deleted 상태로만 남긴다 (API_SPEC 1.7) */
export type ContentStatus = 'active' | 'hidden' | 'deleted';

export interface Question {
  readonly id: number;
  readonly title: string;
  readonly author: string;
  readonly tag: string;
  readonly answers: number;
  readonly resolved: boolean;
  readonly status: ContentStatus;
  readonly createdAt: string;
}

export interface Answer {
  readonly id: number;
  readonly preview: string;
  readonly questionId: number;
  readonly questionTitle: string;
  readonly author: string;
  readonly accepted: boolean;
  readonly status: ContentStatus;
  readonly createdAt: string;
}

export interface Post {
  readonly id: number;
  readonly title: string;
  readonly author: string;
  readonly comments: number;
  readonly status: ContentStatus;
  readonly createdAt: string;
}

export interface Comment {
  readonly id: number;
  readonly preview: string;
  readonly postId: number;
  readonly postTitle: string;
  readonly author: string;
  readonly status: ContentStatus;
  readonly createdAt: string;
}

/** blocked: 관리자가 삭제해 차단된 태그. 같은 이름으로 다시 만들 수 없다 (REQ-ADMIN-010) */
export type TagStatus = 'active' | 'blocked';

export interface Tag {
  readonly name: string;
  readonly description: string;
  readonly usage: number;
  readonly status: TagStatus;
  readonly createdAt: string;
}

export type ReportTarget = 'question' | 'answer' | 'post' | 'comment';
export type ReportReason = 'spam' | 'abuse' | 'illegal' | 'spoiler' | 'misinformation' | 'privacy' | 'etc';
export type ReportStatus = 'pending' | 'resolved' | 'rejected';
/** 신고 처리 시 작성자 제재. 'none' 이면 제재하지 않음 (API 의 sanction: null) */
export type ReportSanctionType = 'none' | SanctionType;

export interface Report {
  readonly id: number;
  readonly target: ReportTarget;
  readonly targetId: number;
  /** 신고 대상이 삭제됐으면 null */
  readonly preview: string | null;
  readonly fullText: string | null;
  readonly author: string | null;
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
  | 'SANCTION_USER'
  | 'RELEASE_SANCTION'
  | 'HIDE_QUESTION'
  | 'HIDE_ANSWER'
  | 'HIDE_POST'
  | 'HIDE_COMMENT'
  | 'RESTORE_QUESTION'
  | 'RESTORE_ANSWER'
  | 'RESTORE_POST'
  | 'RESTORE_COMMENT'
  | 'DELETE_QUESTION'
  | 'DELETE_ANSWER'
  | 'DELETE_POST'
  | 'CREATE_TAG'
  | 'UPDATE_TAG'
  | 'DELETE_TAG'
  | 'MERGE_TAG'
  | 'RESOLVE_REPORT'
  | 'REJECT_REPORT'
  | 'CREATE_NOTICE'
  | 'UPDATE_NOTICE'
  | 'DELETE_NOTICE';

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
  /** 신고 대상이 삭제됐으면 null */
  readonly title: string | null;
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

export type Role = 'USER' | 'ADMIN';
/** suspend: 이용 정지, write_ban: 글쓰기 제한, comment_ban: 댓글 제한 (API_SPEC 1.2) */
export type SanctionType = 'suspend' | 'write_ban' | 'comment_ban';
/** 'permanent' = 영구 (API 의 days: null) */
export type SanctionDays = '3' | '7' | '30' | 'permanent';
/** 탈퇴했으면 withdrawn, 아니면 sanctions 로 계산: 정지가 있으면 suspended, 제한만 있으면 restricted (API_SPEC 10.2) */
export type MemberStatus = 'active' | 'restricted' | 'suspended' | 'withdrawn';

export interface ActiveSanction {
  readonly type: SanctionType;
  /** 해제 예정 시각 (ISO 8601), null 이면 영구 */
  readonly until: string | null;
}

/** GET /api/admin/users 의 항목 (API_SPEC 10.2) */
export interface Member {
  readonly id: number;
  /** 탈퇴하면 아이디·닉네임을 비워 null 이 된다 (API_SPEC 2장 회원 탈퇴) */
  readonly username: string | null;
  readonly nickname: string | null;
  readonly role: Role;
  /** 관리자가 준 추가 권한 (지금은 content_manage 만) */
  readonly permissions: readonly string[];
  /** 서버가 탈퇴 여부와 지금 걸려 있는 제재로 계산한 값 */
  readonly status: MemberStatus;
  /** 지금 걸려 있는 제재 */
  readonly sanctions: readonly ActiveSanction[];
  /** 탈퇴 시각. 탈퇴하지 않았으면 null */
  readonly withdrawnAt: string | null;
  /** 가입일 */
  readonly createdAt: string;
}

export type SanctionAction = 'apply' | 'release';

/** 제재 이력 1건. apply 의 days 는 기간(null 이면 영구), release 는 null */
export interface SanctionRecord {
  readonly action: SanctionAction;
  readonly type: SanctionType;
  readonly days: number | null;
  readonly reason: string;
  readonly admin: UserSummary;
  readonly createdAt: string;
}

/** 질문·답변은 숨김 포함·삭제 제외, 받은 신고는 접수 취소 제외 (API_SPEC 10.2) */
export interface MemberActivity {
  readonly questionCount: number;
  readonly answerCount: number;
  readonly reportsReceivedCount: number;
}

/** GET /api/admin/users/:userId (API_SPEC 10.2) */
export interface MemberDetail extends Member {
  readonly name: string | null;
  readonly email: string | null;
  readonly activity: MemberActivity;
  /** 최신순 */
  readonly sanctionHistory: readonly SanctionRecord[];
}

/** soft delete: 삭제는 deleted 상태로만 남긴다 (API_SPEC 1.7) */
export type ContentStatus = 'active' | 'hidden' | 'deleted';

/** 관리 대상 콘텐츠 종류 (API_SPEC 10.3·10.4) */
export type ContentType = 'question' | 'answer' | 'post' | 'comment';

/** GET /api/admin/questions 의 항목 */
export interface Question {
  readonly id: number;
  readonly title: string;
  readonly author: UserSummary;
  readonly tags: readonly string[];
  /** 공개(active) 답변 수 */
  readonly answerCount: number;
  readonly isAccepted: boolean;
  readonly status: ContentStatus;
  readonly createdAt: string;
}

/** GET /api/admin/answers 의 항목. preview 는 본문 앞 60자 */
export interface Answer {
  readonly id: number;
  readonly preview: string;
  readonly question: { readonly id: number; readonly title: string };
  readonly author: UserSummary;
  readonly isAccepted: boolean;
  readonly status: ContentStatus;
  readonly createdAt: string;
}

/** GET /api/admin/posts 의 항목 */
export interface Post {
  readonly id: number;
  readonly title: string;
  readonly author: UserSummary;
  /** 공개(active) 댓글 수 */
  readonly commentCount: number;
  readonly status: ContentStatus;
  readonly createdAt: string;
}

/** GET /api/admin/comments 의 항목. preview 는 내용 앞 60자 */
export interface Comment {
  readonly id: number;
  readonly preview: string;
  readonly post: { readonly id: number; readonly title: string };
  readonly author: UserSummary;
  readonly status: ContentStatus;
  readonly createdAt: string;
}

/** 관리자 상세의 하위 글 (질문의 답변, 게시글의 댓글). 숨김·삭제 포함 */
export interface ChildContent {
  readonly id: number;
  /** 답변은 HTML, 댓글은 일반 텍스트 */
  readonly body: string;
  readonly author: UserSummary;
  readonly status: ContentStatus;
  readonly createdAt: string;
  /** 답변만 */
  readonly isAccepted?: boolean;
}

/** GET /api/admin/{questions,answers,posts,comments}/:id (API_SPEC 10.3·10.4) */
export interface QuestionDetail extends Question {
  readonly body: string;
  readonly answers: readonly ChildContent[];
}
export interface AnswerDetail extends Answer {
  readonly body: string;
}
export interface PostDetail extends Post {
  readonly body: string;
  readonly comments: readonly ChildContent[];
}
export interface CommentDetail extends Comment {
  readonly body: string;
}

/**
 * blocked: 관리자가 삭제해 차단된 태그. 같은 이름으로 다시 만들 수 없다 (REQ-ADMIN-010)
 * merged: 다른 태그로 병합된 태그. 이 이름을 쓰면 대상 태그로 저장된다 (REQ-ADMIN-011)
 */
export type TagStatus = 'active' | 'blocked' | 'merged';

/** GET /api/admin/tags 의 항목 (API_SPEC 10.5 AdminTag) */
export interface Tag {
  /** API 경로의 :tagId */
  readonly id: number;
  /** 정규화한 이름 (# 제거, 영문 소문자) */
  readonly name: string;
  readonly description: string | null;
  /** 연결된 공개 질문 수. 차단·병합된 태그는 0 */
  readonly questionCount: number;
  readonly status: TagStatus;
  /** 차단(삭제)된 시각. 차단되지 않았으면 null */
  readonly blockedAt: string | null;
  /** 병합된 태그면 병합 대상 태그, 아니면 null */
  readonly mergedInto: { readonly id: number; readonly name: string } | null;
  readonly createdAt: string;
}

export type ReportTarget = 'question' | 'answer' | 'post' | 'comment';
export type ReportReason =
  'spam' | 'abuse' | 'illegal' | 'spoiler' | 'misinformation' | 'privacy' | 'etc';
export type ReportStatus = 'pending' | 'resolved' | 'rejected';
/** 신고 처리 시 작성자 제재. 'none' 이면 제재하지 않음 (API 의 sanction: null) */
export type ReportSanctionType = 'none' | SanctionType;

/** GET /api/admin/reports 의 항목 (API_SPEC 10.6 AdminReport) */
export interface Report {
  readonly id: number;
  readonly targetType: ReportTarget;
  readonly targetId: number;
  /** 신고 대상이 삭제됐으면 null. 탈퇴 회원이면 id 가 null */
  readonly targetAuthor: UserSummary | null;
  /** 대상 본문 앞 60자. 대상이 삭제됐으면 null */
  readonly preview: string | null;
  readonly fullText: string | null;
  readonly reason: ReportReason;
  /** 신고자가 적은 상세 사유. reason 이 etc 면 필수, 아니면 없을 수 있다 (API_SPEC 8장) */
  readonly detail: string | null;
  /** 신고 증빙 이미지. 최대 3개 (API_SPEC 6장) */
  readonly attachments: readonly ReportEvidence[];
  readonly reporter: UserSummary;
  readonly status: ReportStatus;
  /** 같은 대상의 처리 대기 신고 수 (자기 포함) */
  readonly duplicateCount: number;
  /** 신고 대상의 지금 상태 */
  readonly targetStatus: ContentStatus;
  readonly createdAt: string;
  readonly processedAt: string | null;
}

/** 신고 증빙 파일 (API_SPEC 1.6 Attachment) */
export interface ReportEvidence {
  readonly id: number;
  readonly name: string;
  readonly url: string;
  readonly size: number;
  readonly kind: string;
}

/** GET /api/admin/notices 의 항목 (API_SPEC 9장 Notice, 관리자 목록은 본문 포함) */
export interface Notice {
  readonly id: number;
  readonly title: string;
  /** 에디터 HTML */
  readonly body: string;
  readonly isPinned: boolean;
  readonly author: UserSummary;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** 활동 로그 action (API_SPEC 10.8) */
export type LogAction =
  | 'SANCTION_USER'
  | 'RELEASE_SANCTION'
  | 'GRANT_PERMISSION'
  | 'REVOKE_PERMISSION'
  | 'MODERATE_EDIT'
  | 'MODERATE_DELETE'
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
  | 'DELETE_COMMENT'
  | 'CREATE_TAG'
  | 'UPDATE_TAG'
  | 'DELETE_TAG'
  | 'RESTORE_TAG'
  | 'MERGE_TAG'
  | 'RESOLVE_REPORT'
  | 'REJECT_REPORT'
  | 'CREATE_NOTICE'
  | 'UPDATE_NOTICE'
  | 'DELETE_NOTICE';

/** 다른 객체 안의 회원 정보. 탈퇴 회원은 id 가 null (API_SPEC 1.6) */
export interface UserSummary {
  readonly id: number | null;
  readonly nickname: string;
  readonly profileImageUrl: string | null;
}

export type LogTargetType =
  'user' | 'question' | 'answer' | 'post' | 'comment' | 'tag' | 'report' | 'notice';

/** GET /api/admin/activity-logs 의 항목 (API_SPEC 10.8) */
export interface ActivityLog {
  readonly id: number;
  readonly action: LogAction;
  readonly admin: UserSummary;
  readonly targetType: LogTargetType;
  readonly targetId: number;
  readonly targetLabel: string;
  readonly detail: string | null;
  readonly createdAt: string;
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

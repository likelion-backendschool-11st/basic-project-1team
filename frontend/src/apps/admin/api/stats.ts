import { apiRequest } from '../../../shared/api';
import type { ReportReason, ReportTarget, UserSummary } from '../types';

/** GET /api/admin/stats 응답 (API_SPEC 10.1) */
export interface DashboardStats {
  readonly kpis: {
    readonly totalMembers: number;
    readonly todaySignups: number;
    readonly totalQuestions: number;
    readonly unresolvedQuestions: number;
    readonly pendingReports: number;
  };
  /** 오늘 포함 최근 7일 (한국 날짜 'YYYY-MM-DD') */
  readonly trend: readonly {
    readonly date: string;
    readonly questions: number;
    readonly signups: number;
  }[];
  /** 질문 수 상위 10개. share 는 전체 공개 질문 대비 % */
  readonly topTags: readonly {
    readonly rank: number;
    readonly name: string;
    readonly questionCount: number;
    readonly share: number;
  }[];
  /** 처리 대기 신고 최신 5건. 대상이 삭제됐으면 preview 는 null */
  readonly recentPendingReports: readonly {
    readonly id: number;
    readonly targetType: ReportTarget;
    readonly targetId: number;
    readonly preview: string | null;
    readonly reason: ReportReason;
    readonly reporter: UserSummary;
    readonly createdAt: string;
  }[];
}

export function getDashboardStats(): Promise<DashboardStats> {
  return apiRequest<DashboardStats>('/admin/stats');
}

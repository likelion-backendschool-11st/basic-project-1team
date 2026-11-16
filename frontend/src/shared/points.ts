/**
 * 포인트·레벨·등급 (API_SPEC 11장, REQ-POINT-001~010).
 * 등급 이름은 리그 오브 레전드 랭크 티어를 따르고, 배지는 디자인 토큰 색과 아이콘으로 직접 그린다 (게임 엠블럼 이미지 미사용).
 */

/** 등급 (API_SPEC 11.2). grandmaster·challenger 는 Master 레벨(70~79) 회원 중 순위로 정해진다 */
export type Tier =
  | 'unranked'
  | 'iron'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'emerald'
  | 'diamond'
  | 'master'
  | 'grandmaster'
  | 'challenger';

/** 레벨과 등급. 관리자·탈퇴 회원은 둘 다 null (API_SPEC 1.6) */
export interface UserLevel {
  readonly level: number | null;
  readonly tier: Tier | null;
}

export const TIER_LABELS: Readonly<Record<Tier, string>> = {
  unranked: 'Unranked',
  iron: 'Iron',
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  emerald: 'Emerald',
  diamond: 'Diamond',
  master: 'Master',
  grandmaster: 'Grandmaster',
  challenger: 'Challenger',
};

/** 배지 색(tokens.json 의 tier-*)과 아이콘. Tailwind 가 찾을 수 있게 클래스 이름을 그대로 적는다 */
export const TIER_STYLES: Readonly<
  Record<Tier, { readonly chip: string; readonly text: string; readonly icon: string }>
> = {
  unranked: {
    chip: 'border-tier-unranked/40 bg-tier-unranked/10',
    text: 'text-tier-unranked',
    icon: 'shield',
  },
  iron: { chip: 'border-tier-iron/40 bg-tier-iron/10', text: 'text-tier-iron', icon: 'shield' },
  bronze: {
    chip: 'border-tier-bronze/40 bg-tier-bronze/10',
    text: 'text-tier-bronze',
    icon: 'shield',
  },
  silver: {
    chip: 'border-tier-silver/40 bg-tier-silver/10',
    text: 'text-tier-silver',
    icon: 'shield',
  },
  gold: { chip: 'border-tier-gold/40 bg-tier-gold/10', text: 'text-tier-gold', icon: 'shield' },
  platinum: {
    chip: 'border-tier-platinum/40 bg-tier-platinum/10',
    text: 'text-tier-platinum',
    icon: 'shield',
  },
  emerald: {
    chip: 'border-tier-emerald/40 bg-tier-emerald/10',
    text: 'text-tier-emerald',
    icon: 'diamond',
  },
  diamond: {
    chip: 'border-tier-diamond/40 bg-tier-diamond/10',
    text: 'text-tier-diamond',
    icon: 'diamond',
  },
  master: {
    chip: 'border-tier-master/40 bg-tier-master/10',
    text: 'text-tier-master',
    icon: 'military_tech',
  },
  grandmaster: {
    chip: 'border-tier-grandmaster/40 bg-tier-grandmaster/10',
    text: 'text-tier-grandmaster',
    icon: 'workspace_premium',
  },
  challenger: {
    chip: 'border-tier-challenger/50 bg-tier-challenger/15',
    text: 'text-tier-challenger',
    icon: 'trophy',
  },
};

/** 내 포인트와 지금 레벨 구간 (GET /api/users/me, API_SPEC 2장). 관리자는 points 0, 나머지 null */
export interface MyLevel extends UserLevel {
  readonly points: number;
  /** 지금 레벨이 시작하는 포인트 */
  readonly currentLevelPoints: number | null;
  /** 다음 레벨이 시작하는 포인트. Lv79 이면 null */
  readonly nextLevelPoints: number | null;
}

/** 포인트 지급량 (API_SPEC 11.1). 질문 작성 화면의 보상 안내에 쓴다 */
export const POINT_REWARDS = {
  dailyVisit: 1,
  questionCreate: 2,
  questionCreateDailyLimit: 5,
  acceptGive: 20,
  answerAccepted: 50,
} as const;

/** 포인트 내역 reason (API_SPEC 11장 GET /api/users/me/point-histories) */
export type PointReason =
  'daily_visit' | 'question_create' | 'accept_give' | 'answer_accepted' | 'report_penalty';

export const POINT_REASON_LABELS: Readonly<Record<PointReason, string>> = {
  daily_visit: '오늘 첫 접속',
  question_create: '질문 작성',
  accept_give: '답변 채택',
  answer_accepted: '내 답변 채택됨',
  report_penalty: '신고 처리 차감',
};

/** 배지에 붙이는 레벨 문구. 예: Lv.34 */
export const formatLevel = (level: number): string => `Lv.${level}`;

/**
 * 지금 레벨 안에서 다음 레벨까지 얼마나 왔는지 (0~100). 최고 레벨(Lv79)이면 100.
 * 화면의 진행 막대 = (points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints) (API_SPEC 2장)
 */
export function levelProgressPercent(
  points: number,
  currentLevelPoints: number,
  nextLevelPoints: number | null,
): number {
  if (nextLevelPoints === null) return 100;
  const ratio = (points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints);
  return Math.min(100, Math.max(0, Math.floor(ratio * 100)));
}

import type {
  ActivityLog,
  Answer,
  Comment,
  Kpi,
  LogAction,
  Member,
  MemberActivity,
  NavEntry,
  Notice,
  PendingReportSummary,
  Post,
  Question,
  Report,
  ReportReason,
  ReportTarget,
  ReportSanctionType,
  SanctionDays,
  SanctionRecord,
  SanctionType,
  SelectOption,
  Tag,
  TopTag,
  TrendPoint,
} from '../types';

/* ------------------------------------------------------------------ */
/* App shell                                                           */
/* ------------------------------------------------------------------ */

export const brand = {
  name: 'GAMERS',
  badge: 'ADMIN',
  logoIcon: 'sports_esports',
  siteLink: { label: '사이트로 이동', href: '/' },
  operator: { initials: '01', name: '운영자01' },
  logoutLabel: '로그아웃',
};

export const PENDING_REPORT_COUNT = 12;

/** 같은 대상에 대한 처리 대기 신고가 이 수 이상이면 대상이 자동 숨김된다 (API_SPEC 8장, REQ-QNA-008·009) */
export const AUTO_HIDE_THRESHOLD = 10;

export const navItems: readonly NavEntry[] = [
  { to: '/', label: '대시보드', icon: 'dashboard' },
  { to: '/members', label: '회원 관리', icon: 'group' },
  { to: '/qna', label: '질문/답변 관리', icon: 'forum' },
  { to: '/tags', label: '태그 관리', icon: 'label' },
  { to: '/board', label: '자유게시판 관리', icon: 'forum' },
  { to: '/reports', label: '신고 관리', icon: 'report_problem', badge: PENDING_REPORT_COUNT, danger: true },
  { to: '/notices', label: '공지 관리', icon: 'campaign' },
  { to: '/logs', label: '활동 로그', icon: 'history' },
];

/** Shared verb labels used by buttons across pages. */
export const ui = {
  search: '검색',
  detail: '상세',
  hide: '숨김',
  restore: '복구',
  remove: '삭제',
  edit: '수정',
  merge: '병합',
  register: '등록',
  cancel: '취소',
  save: '저장',
  close: '닫기',
  total: '총',
  countUnit: '건',
  personUnit: '명',
  prevPage: '이전 페이지',
  nextPage: '다음 페이지',
  emptyRow: '조회된 데이터가 없습니다.',
  public: '공개',
  hidden: '숨김',
  deleted: '삭제됨',
  resolved: '해결',
};

/** 삭제 확인 모달 (REQ-ADMIN-008). 삭제는 soft delete 다 (API_SPEC 1.7) */
export const confirmDeleteCopy = {
  titleSuffix: '삭제',
  irreversible: '삭제하면 되돌릴 수 없습니다. 데이터는 기록용으로만 보관됩니다.',
  hideInstead: '내용만 감추려면 삭제 대신 숨김을 사용하세요.',
  confirm: '삭제',
  targets: { question: '질문', answer: '답변', post: '게시글', comment: '댓글', tag: '태그', notice: '공지' },
  questionCascade: '이 질문에 달린 답변도 함께 삭제됩니다.',
  postCascade: '이 게시글의 댓글도 함께 삭제됩니다.',
  acceptedAnswer: '채택된 답변입니다. 삭제하면 질문의 채택 상태도 해제됩니다.',
  tagInUse: (count: number) => `질문 ${count.toLocaleString()}건에서 이 태그가 빠집니다.`,
  tagBlocked: '삭제한 태그는 차단 상태로 남아 같은 이름으로 다시 만들 수 없습니다. 차단은 목록에서 해제할 수 있지만 끊긴 질문 연결은 돌아오지 않습니다.',
};

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export const dashboardCopy = {
  title: '대시보드',
  description: '플랫폼 핵심 트래픽, 주요 태그 데이터 및 즉각적인 신고 처리 현황을 확인합니다.',
  topTagsTitle: '인기 태그 TOP 10',
  topTagsColumns: { rank: '순위', name: '태그 식별자', count: '질문 수', share: '점유 비중' },
  trendTitle: '최근 7일 추이',
  trendSubtitle: '최근 7일 질문 수와 가입자 수',
  trendLegend: { questions: '질문 수', signups: '가입자 수' },
  trendTooltipPrefix: '질문',
  pendingTitle: '최근 처리 대기 신고',
  pendingBadge: `대기 ${PENDING_REPORT_COUNT}건`,
  pendingViewAll: '전체 보기',
  pendingColumns: { date: '신고일', content: '대상 콘텐츠', reason: '사유', reporter: '신고자' },
  /** trend·topTags 는 선택 구현이라 빈 배열이 올 수 있다. */
  emptyOptional: '아직 집계된 데이터가 없습니다.',
};

export const kpis: readonly Kpi[] = [
  { key: 'members', label: '전체 회원', value: '128,450', icon: 'group', tone: 'default', href: '/members' },
  { key: 'signups', label: '오늘 가입', value: '342', icon: 'person_add', tone: 'default', href: '/members' },
  { key: 'questions', label: '전체 질문', value: '45,890', icon: 'help', tone: 'default', href: '/qna' },
  { key: 'unresolved', label: '미해결 질문', value: '156', icon: 'pending_actions', tone: 'attention', href: '/qna' },
  { key: 'reports', label: '처리 대기 신고', value: String(PENDING_REPORT_COUNT), icon: 'priority_high', tone: 'urgent', href: '/reports' },
];

export const topTags: readonly TopTag[] = [
  { rank: 1, name: 'elden-ring', count: 4821, share: 88 },
  { rank: 2, name: 'league-of-legends', count: 3940, share: 74 },
  { rank: 3, name: 'valorant', count: 2810, share: 58 },
  { rank: 4, name: 'genshin-impact', count: 2150, share: 44 },
  { rank: 5, name: 'cyberpunk-2077', count: 1890, share: 38 },
  { rank: 6, name: 'diablo-4', count: 1640, share: 32 },
  { rank: 7, name: 'monster-hunter', count: 1420, share: 27 },
  { rank: 8, name: 'steam', count: 1280, share: 24 },
  { rank: 9, name: 'nintendo-switch', count: 1110, share: 21 },
  { rank: 10, name: 'playstation-5', count: 980, share: 18 },
];

export const trend: readonly TrendPoint[] = [
  { label: '11/10', questions: 317, signups: 217 },
  { label: '11/11', questions: 360, signups: 240 },
  { label: '11/12', questions: 300, signups: 193 },
  { label: '11/13', questions: 427, signups: 267 },
  { label: '11/14', questions: 500, signups: 293 },
  { label: '11/15', questions: 560, signups: 383, emphasis: 'peak' },
  { label: '오늘(16)', questions: 527, signups: 347, emphasis: 'today' },
];

export const trendYAxis: readonly number[] = [600, 450, 300, 150, 0];

export const recentPendingReports: readonly PendingReportSummary[] = [
  { date: '11-16', time: '14:02', contentId: 128, title: '엘든링 보스 공략 관련 미출시 DLC 스포일러 의혹...', reason: '스포일러', reporter: 'gamer01' },
  { date: '11-16', time: '13:40', contentId: 342, title: '패치노트 비방 및 특정 유저에 대한 심각한 인신공격 발언', reason: '욕설·비하', reporter: 'pro_user' },
  { date: '11-16', time: '11:15', contentId: 57, title: '불법 대리 육성 홍보 및 외부 메신저 링크 무단 첨부', reason: '스팸', reporter: 'newbie7' },
  { date: '11-16', time: '10:28', contentId: 119, title: '발로란트 핵 프로그램 판매 및 불법 바이패스 툴 유포 의혹', reason: '불법 프로그램', reporter: 'shadow_99' },
  { date: '11-16', time: '09:12', contentId: 889, title: '게임사 점검 보상 관련 허위 조작 루머 반복적 게시', reason: '허위정보', reporter: 'pixel_art' },
];

/* ------------------------------------------------------------------ */
/* Members                                                             */
/* ------------------------------------------------------------------ */

export const membersCopy = {
  title: '회원 관리',
  description: '등록된 회원 목록을 조회하고 계정 상태 및 권한을 관리합니다.',
  searchPlaceholder: '아이디 또는 닉네임 입력',
  totalCount: 1248,
  columns: { id: 'ID', username: '아이디', nickname: '닉네임', role: '권한', status: '상태', joinedAt: '가입일', actions: '관리' },
  statusLabels: { active: '활성', restricted: '제한', suspended: '정지' },
  permanent: '영구',
};

export const memberStatusOptions: readonly SelectOption[] = [
  { value: 'all', label: '상태 전체' },
  { value: 'active', label: '활성' },
  { value: 'restricted', label: '제한 (글쓰기·댓글)' },
  { value: 'suspended', label: '정지' },
];

export const memberRoleOptions: readonly SelectOption[] = [
  { value: 'all', label: '권한 전체' },
  { value: 'USER', label: 'USER' },
  { value: 'ADMIN', label: 'ADMIN' },
];

export const memberSortOptions: readonly SelectOption[] = [
  { value: 'newest', label: '가입일 최신순' },
  { value: 'oldest', label: '가입일 오래된순' },
];

export const members: readonly Member[] = [
  { id: 10, username: 'spam_bot', nickname: '스팸봇', role: 'USER', sanctions: [{ type: 'suspend', until: null }], joinedAt: '2026-11-16' },
  { id: 9, username: 'pixel_art', nickname: '도트마스터', role: 'USER', sanctions: [], joinedAt: '2026-11-15' },
  { id: 8, username: 'apex_legend', nickname: '에이펙스러버', role: 'USER', sanctions: [{ type: 'suspend', until: '12/01' }], joinedAt: '2026-11-15' },
  { id: 6, username: 'valo_kim', nickname: '발로김', role: 'USER', sanctions: [{ type: 'comment_ban', until: '11/23' }], joinedAt: '2026-11-14' },
  { id: 7, username: 'zelda_link', nickname: '하이랄용사', role: 'USER', sanctions: [], joinedAt: '2026-11-14' },
  { id: 5, username: 'newbie7', nickname: '뉴비', role: 'USER', sanctions: [], joinedAt: '2026-11-13' },
  { id: 4, username: 'pro_user', nickname: '프로겜러', role: 'USER', sanctions: [{ type: 'suspend', until: '11/20' }, { type: 'write_ban', until: null }], joinedAt: '2026-11-12' },
  { id: 3, username: 'gamer01', nickname: '엘든링고수', role: 'USER', sanctions: [], joinedAt: '2026-11-12' },
  { id: 1, username: 'admin', nickname: '운영자01', role: 'ADMIN', sanctions: [], joinedAt: '2026-11-11' },
];

/* ------------------------------------------------------------------ */
/* Member detail                                                       */
/* ------------------------------------------------------------------ */

export const memberDetailCopy = {
  back: '회원 목록',
  title: '회원 상세',
  basicInfo: '기본 정보',
  fields: { username: '아이디', nickname: '닉네임', role: '권한', status: '상태', joinedAt: '가입일' },
  activityTitle: '활동 현황',
  activityHint: '클릭 시 각 필터 목록으로 이동',
  activity: { questions: '질문', answers: '답변', reportsReceived: '받은 신고' },
  sanctionTitle: '회원 제재 관리',
  currentStatus: '현재 상태',
  statusActive: '정상',
  activeSanctionsLabel: '적용 중인 제재',
  noActiveSanctions: '적용 중인 제재가 없습니다.',
  typeLabel: '제재 종류',
  durationLabel: '제재 기간',
  reasonLabel: '사유 (제재/해제 공통)',
  reasonPlaceholder: '제재 사유를 입력하세요 (필수, 200자 이내)',
  reasonMax: 200,
  charUnit: '자',
  apply: '제재 적용',
  release: '해제',
  untilSuffix: '까지',
  alreadyActive: '같은 종류의 제재가 이미 적용 중입니다. 해제 후 다시 적용하세요.',
  adminProtected: '관리자 계정은 제재할 수 없습니다.',
  reasonRequired: '사유를 먼저 입력하세요.',
  historyTitle: '제재 이력',
  historyTotal: '전체',
  historyColumns: { at: '일시', admin: '처리자', label: '내용', reason: '사유' },
  notFound: '회원을 찾을 수 없습니다.',
};

export const sanctionTypeLabels: Readonly<Record<SanctionType, string>> = {
  suspend: '이용 정지',
  write_ban: '글쓰기 제한',
  comment_ban: '댓글 제한',
};

/** 제재 종류 옆에 보여 줄 설명 (API_SPEC 1.2) */
export const sanctionTypeHints: Readonly<Record<SanctionType, string>> = {
  suspend: '로그인과 모든 쓰기 불가',
  write_ban: '질문·답변·게시글 작성/수정 불가',
  comment_ban: '댓글 작성 불가',
};

export const sanctionTypeOptions: readonly SelectOption<SanctionType>[] = (Object.keys(sanctionTypeLabels) as SanctionType[]).map(
  (value) => ({ value, label: sanctionTypeLabels[value] }),
);

export const sanctionDurations: readonly SelectOption<SanctionDays>[] = [
  { value: '3', label: '3일' },
  { value: '7', label: '7일' },
  { value: '30', label: '30일' },
  { value: 'permanent', label: '영구' },
];

export const memberActivity: Readonly<Record<number, MemberActivity>> = {
  4: { questions: 14, answers: 37, reportsReceived: 3 },
};

export const defaultMemberActivity: MemberActivity = { questions: 0, answers: 0, reportsReceived: 0 };

export const sanctionHistory: Readonly<Record<number, readonly SanctionRecord[]>> = {
  4: [
    { at: '2026-11-14 11:00', admin: '운영자01', action: 'apply', type: 'write_ban', label: '글쓰기 제한 영구', reason: '도배성 게시글 반복' },
    { at: '2026-11-13 10:20', admin: '운영자01', action: 'apply', type: 'suspend', label: '이용 정지 7일', reason: '신고 처리: 욕설·비하 (신고 #12)' },
    { at: '2026-11-12 18:05', admin: '운영자01', action: 'release', type: 'suspend', label: '이용 정지 해제', reason: '오처리 정정' },
  ],
};

/* ------------------------------------------------------------------ */
/* Q&A                                                                 */
/* ------------------------------------------------------------------ */

export const qnaCopy = {
  title: '질문/답변 관리',
  description: '게시된 질문과 답변을 모니터링하고 공개 여부 및 불량 콘텐츠를 관리합니다.',
  tabs: { questions: '질문', answers: '답변' },
  tabCounts: { questions: 45890, answers: 128402 },
  searchPlaceholder: '제목 또는 작성자',
  answerSearchPlaceholder: '본문 또는 작성자',
  tagPlaceholder: '태그 입력 (예: elden-ring)',
  columns: { id: 'ID', title: '제목', author: '작성자', tag: '태그', answers: '답변', resolved: '해결', status: '상태', createdAt: '작성일', actions: '관리' },
  answerColumns: { id: 'ID', preview: '답변 미리보기', question: '질문', author: '작성자', accepted: '채택', status: '상태', createdAt: '작성일', actions: '관리' },
  accepted: '채택',
};

/** 'all' 은 삭제된 항목을 뺀 전체 (API 의 status 생략과 같음) */
export const contentStatusOptions: readonly SelectOption[] = [
  { value: 'all', label: '상태 전체 (삭제 제외)' },
  { value: 'active', label: '공개' },
  { value: 'hidden', label: '숨김' },
  { value: 'deleted', label: '삭제됨' },
];

export const questions: readonly Question[] = [
  { id: 128, title: '엘든링 말레니아 2페이즈 공략 팁 있을까요?', author: 'gamer01', tag: 'elden-ring', answers: 3, resolved: true, status: 'active', createdAt: '11-16' },
  { id: 127, title: '[광고] 게임 계정 최저가 대량 팝니다 문의 카톡', author: 'spam99', tag: 'lol', answers: 0, resolved: false, status: 'hidden', createdAt: '11-16' },
  { id: 126, title: '발로란트 에임 감도 DPI 세팅 추천', author: 'valo_kim', tag: 'valorant', answers: 5, resolved: true, status: 'active', createdAt: '11-15' },
  { id: 125, title: '마인크래프트 레드스톤 자동화 회로 질문', author: 'newbie7', tag: 'minecraft', answers: 1, resolved: false, status: 'active', createdAt: '11-15' },
  { id: 124, title: '디아블로4 시즌 패스 보상 수령 문제', author: 'diablo_fan', tag: 'diablo-4', answers: 4, resolved: true, status: 'active', createdAt: '11-15' },
  { id: 123, title: '[불법사설서버] 무제한 무료 캐시 충전 이벤트', author: 'bot_user3', tag: 'maple', answers: 0, resolved: false, status: 'hidden', createdAt: '11-14' },
  { id: 122, title: '사이버펑크 팬텀 리버티 빌드 트리 조언', author: 'cyber_v', tag: 'cyberpunk-2077', answers: 7, resolved: true, status: 'active', createdAt: '11-14' },
  { id: 121, title: '롤 솔랭 미드 챔피언 티어 질문드립니다', author: 'faker_fan', tag: 'league-of-legends', answers: 2, resolved: false, status: 'active', createdAt: '11-13' },
];

export const answers: readonly Answer[] = [
  { id: 342, preview: '이 실력으로 질문을 왜 올리는지 이해가 안 가네요... 접으시길', questionId: 128, questionTitle: '엘든링 말레니아 2페이즈 공략 팁 있을까요?', author: 'pro_user', accepted: false, status: 'hidden', createdAt: '11-16' },
  { id: 341, preview: '물 파도는 점프 타이밍만 익히면 됩니다. 1페이즈에서 출혈 빌드 추천드려요.', questionId: 128, questionTitle: '엘든링 말레니아 2페이즈 공략 팁 있을까요?', author: 'tarnished', accepted: true, status: 'active', createdAt: '11-16' },
  { id: 338, preview: 'DPI 800 기준 인게임 감도 0.35 전후가 무난합니다.', questionId: 126, questionTitle: '발로란트 에임 감도 DPI 세팅 추천', author: 'viper_main', accepted: true, status: 'active', createdAt: '11-15' },
  { id: 335, preview: '레드스톤 비교기를 감산 모드로 바꿔 보세요.', questionId: 125, questionTitle: '마인크래프트 레드스톤 자동화 회로 질문', author: 'gamer01', accepted: false, status: 'active', createdAt: '11-15' },
  { id: 331, preview: '시즌 패스 보상은 우편함이 아니라 시즌 탭에서 직접 수령해야 합니다.', questionId: 124, questionTitle: '디아블로4 시즌 패스 보상 수령 문제', author: 'diablo_fan', accepted: false, status: 'active', createdAt: '11-15' },
  { id: 290, preview: '(부적절한 표현으로 인해 일부 가려짐)', questionId: 121, questionTitle: '롤 솔랭 미드 챔피언 티어 질문드립니다', author: 'angry_gg', accepted: false, status: 'hidden', createdAt: '11-14' },
];

/* ------------------------------------------------------------------ */
/* Tags                                                                */
/* ------------------------------------------------------------------ */

export const tagsCopy = {
  title: '태그 관리',
  description: '게시글 및 질문 분류에 사용되는 게임 태그를 등록, 관리 및 병합합니다.',
  createTitle: '새 태그 등록',
  editTitle: '태그 수정',
  createHint: '한글, 영문, 숫자, _, - 사용 가능 (1~30자, 공백 불가)',
  nameLabel: '태그명',
  namePlaceholder: '태그명 (예: monster-hunter)',
  descLabel: '설명',
  descPlaceholder: '태그에 대한 간단한 설명을 입력하세요 (선택)',
  searchPlaceholder: '태그명 검색...',
  noDescription: '설명 없음',
  blockedBadge: '차단됨',
  restore: '차단 해제',
  blockedName: '삭제(차단)된 태그와 같은 이름입니다. 목록에서 차단을 해제한 뒤 사용하세요.',
  duplicateName: '이미 있는 태그입니다.',
  columns: { name: '태그명', description: '설명', usage: '사용 횟수', createdAt: '생성일', actions: '관리' },
  merge: {
    title: '태그 병합',
    subtitleSuffix: '태그를 다른 태그로 합칩니다.',
    searchLabel: '대상 태그 검색',
    searchHint: '합칠 대상 태그를 검색해서 선택하세요.',
    searchPlaceholder: '태그명 입력',
    clearSelection: '선택 해제',
    summaryPrefix: '질문',
    summaryMoved: '이',
    summaryMovedSuffix: '로 이동하고',
    summaryDeleted: '태그는 영구 삭제됩니다.',
    submit: '병합 실행',
  },
};

export const tagStatusOptions: readonly SelectOption[] = [
  { value: 'all', label: '상태 전체' },
  { value: 'active', label: '사용 중' },
  { value: 'blocked', label: '차단됨' },
];

export const tagSortOptions: readonly SelectOption[] = [
  { value: 'usage_desc', label: '사용 많은순' },
  { value: 'name_asc', label: '이름순' },
  { value: 'recent', label: '최신순' },
];

export const tags: readonly Tag[] = [
  { name: 'elden-ring', description: '엘든 링 관련 공략 및 보스 토론 질문', usage: 4821, status: 'active', createdAt: '2026-08-10' },
  { name: 'league-of-legends', description: '리그 오브 레전드 챔피언 및 메타 정보', usage: 3940, status: 'active', createdAt: '2026-07-22' },
  { name: 'valorant', description: '발로란트 조준선, 감도 및 요원 가이드', usage: 2810, status: 'active', createdAt: '2026-08-01' },
  { name: 'genshin-impact', description: '원신 캐릭터 빌드, 성유물 및 파티 조합', usage: 2150, status: 'active', createdAt: '2026-08-15' },
  { name: 'cyberpunk-2077', description: '사이버펑크 2077 퀘스트 및 특전 트리', usage: 1890, status: 'active', createdAt: '2026-09-02' },
  { name: 'diablo-4', description: '디아블로 4 시즌 빌드 및 던전 공략', usage: 1640, status: 'active', createdAt: '2026-09-18' },
  { name: 'minecraft', description: '마인크래프트 레드스톤 및 건축 노하우', usage: 1420, status: 'active', createdAt: '2026-07-15' },
  { name: 'lol', description: '', usage: 12, status: 'active', createdAt: '2026-11-05' },
  { name: '사설서버', description: '불법 사설 서버 홍보에 쓰여 차단', usage: 0, status: 'blocked', createdAt: '2026-10-02' },
];

/* ------------------------------------------------------------------ */
/* Free board                                                          */
/* ------------------------------------------------------------------ */

export const boardCopy = {
  title: '자유게시판 관리',
  description: '자유게시판 게시글 및 댓글을 모니터링하고 공개 여부 및 불량 콘텐츠를 관리합니다.',
  tabs: { posts: '게시글', comments: '댓글' },
  tabCounts: { posts: 3240, comments: 18520 },
  searchPlaceholder: '제목 또는 작성자',
  commentSearchPlaceholder: '내용 또는 작성자',
  columns: { id: 'ID', title: '제목', author: '작성자', comments: '댓글', status: '상태', createdAt: '작성일', actions: '관리' },
  commentColumns: { id: 'ID', preview: '댓글 내용', post: '게시글', author: '작성자', status: '상태', createdAt: '작성일', actions: '관리' },
};

export const comments: readonly Comment[] = [
  { id: 889, preview: '이번 점검 보상 사실 전부 취소됐다던데요? 공지 안 하고 몰래 회수한답니다.', postId: 57, postTitle: '오늘 롤 듀오 구해요', author: 'rumor_kr', status: 'active', createdAt: '11-15' },
  { id: 887, preview: '저도 골드인데 같이 하실래요?', postId: 57, postTitle: '오늘 롤 듀오 구해요', author: 'faker_fan', status: 'active', createdAt: '11-16' },
  { id: 870, preview: '할로우 나이트 실크송 꼭 사세요', postId: 56, postTitle: '스팀 겨울 세일 추천작 공유', author: 'pixel_art', status: 'active', createdAt: '11-16' },
  { id: 702, preview: '그 공략보다 이 방법이 더 효율적인 것 같아요.', postId: 54, postTitle: '엘든링 DLC 같이 하실 분', author: 'tactic_pro', status: 'active', createdAt: '11-12' },
  { id: 655, preview: '(욕설로 숨김 처리된 댓글)', postId: 51, postTitle: '욕설이 포함된 게시글', author: 'bad_guy', status: 'hidden', createdAt: '11-13' },
];

export const posts: readonly Post[] = [
  { id: 57, title: '오늘 롤 듀오 구해요', author: 'newbie7', comments: 4, status: 'active', createdAt: '11-16' },
  { id: 56, title: '스팀 겨울 세일 추천작 공유', author: 'gamer01', comments: 12, status: 'active', createdAt: '11-16' },
  { id: 55, title: '신작 출시일 정리', author: 'valo_kim', comments: 7, status: 'active', createdAt: '11-15' },
  { id: 54, title: '엘든링 DLC 같이 하실 분', author: 'tarnished', comments: 18, status: 'active', createdAt: '11-15' },
  { id: 53, title: '발로란트 클랜원 모집', author: 'viper_main', comments: 9, status: 'active', createdAt: '11-14' },
  { id: 52, title: '게임 굿즈 구매 후기', author: 'pixel_art', comments: 3, status: 'active', createdAt: '11-14' },
  { id: 51, title: '욕설이 포함된 게시글', author: 'bad_guy', comments: 2, status: 'hidden', createdAt: '11-13' },
  { id: 50, title: '[광고] 계정 판매', author: 'spam_bot', comments: 0, status: 'hidden', createdAt: '11-12' },
];

/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */

export const reportsCopy = {
  title: '신고 관리',
  description: '접수된 신고 내역을 검토하고 콘텐츠 숨김 및 제재 처리를 진행합니다.',
  tabs: { pending: '처리 대기', resolved: '처리 완료', rejected: '반려' },
  columns: { id: 'ID', target: '대상', preview: '내용 미리보기', reason: '사유', reporter: '신고자', reportedAt: '신고일' },
  panelTitlePrefix: '신고',
  panelTitleSuffix: '처리',
  authorPrefix: '작성자',
  viewOriginal: '원문 보기',
  duplicatePrefix: '같은 대상 신고',
  duplicateSuffix: '누적됨',
  autoHidden: `신고 ${AUTO_HIDE_THRESHOLD}건 이상 누적으로 대상이 자동 숨김된 상태입니다. 반려하거나 대상 숨김 없이 처리하면 다시 공개됩니다.`,
  hideTarget: '대상 숨김 처리',
  sanctionLabel: '작성자 제재',
  sanctionDurationLabel: '제재 기간',
  reject: '반려',
  resolve: '처리 완료',
  emptyPanel: '목록에서 신고를 선택하세요.',
  deletedTarget: '삭제된 콘텐츠',
  deletedTargetNote: '신고 대상이 이미 삭제되었습니다. 처리하면 신고 상태만 처리 완료로 바뀝니다.',
  closedPanel: '이미 처리된 신고입니다.',
};

export const reportTargetLabels: Readonly<Record<ReportTarget, string>> = {
  question: '질문',
  answer: '답변',
  post: '자유글',
  comment: '댓글',
};

export const reportReasonLabels: Readonly<Record<ReportReason, string>> = {
  spam: '스팸·홍보',
  abuse: '욕설·비하',
  illegal: '불법 프로그램',
  spoiler: '스포일러',
  misinformation: '허위정보',
  privacy: '개인정보 노출',
  etc: '기타',
};

export const reportTargetOptions: readonly SelectOption[] = [
  { value: 'all', label: '대상 전체' },
  ...Object.entries(reportTargetLabels).map(([value, label]) => ({ value, label })),
];

export const reportReasonOptions: readonly SelectOption[] = [
  { value: 'all', label: '사유 전체' },
  ...Object.entries(reportReasonLabels).map(([value, label]) => ({ value, label })),
];

export const reportSanctionTypeOptions: readonly SelectOption<ReportSanctionType>[] = [
  { value: 'none', label: '제재 안 함' },
  ...sanctionTypeOptions,
];

export const reports: readonly Report[] = [
  { id: 13, target: 'question', targetId: 101, preview: null, fullText: null, author: null, reason: 'spam', reporter: 'valo_kim', reportedAt: '11-16', reportedTime: '15:30', status: 'pending', duplicateCount: 1 },
  { id: 12, target: 'answer', targetId: 342, preview: '이 실력으로 질문을 왜 올리는지 이해가 안 가네요... 접으시길', fullText: '"이 실력으로 질문을 왜 올리는지 이해가 안 가네요... 다른 사람 시간 뺏지 말고 접으시길 바랍니다."', author: 'pro_user', reason: 'abuse', reporter: 'gamer01', reportedAt: '11-16', reportedTime: '14:02', status: 'pending', duplicateCount: 3 },
  { id: 11, target: 'question', targetId: 128, preview: '엘든링 DLC 최종 보스 2페이즈 패턴과 스토리 결말 유출...', fullText: '"엘든링 DLC 최종 보스 2페이즈 패턴과 스토리 결말 유출합니다. 마지막 컷신에서..."', author: 'tarnished', reason: 'spoiler', reporter: 'gamer01', reportedAt: '11-16', reportedTime: '13:40', status: 'pending', duplicateCount: 1 },
  { id: 10, target: 'post', targetId: 57, preview: '[광고] 롤/발로란트 계정 대리 육성 및 다이아 계정 최저가 판매 링크', fullText: '"[광고] 롤/발로란트 계정 대리 육성 및 다이아 계정 최저가 판매 링크 첨부합니다."', author: 'spam_bot', reason: 'spam', reporter: 'newbie7', reportedAt: '11-16', reportedTime: '11:15', status: 'pending', duplicateCount: 2 },
  { id: 9, target: 'question', targetId: 119, preview: '발로란트 핵 프로그램 판매 및 불법 바이패스 툴 유포 의혹', fullText: '"발로란트 핵 프로그램 판매합니다. 바이패스 툴 포함, 디스코드 문의."', author: 'shadow_99', reason: 'illegal', reporter: 'pro_user', reportedAt: '11-15', reportedTime: '10:28', status: 'pending', duplicateCount: 11 },
  { id: 8, target: 'comment', targetId: 889, preview: '게임사 점검 보상 관련 허위 조작 루머 반복적 게시 댓글', fullText: '"이번 점검 보상 사실 전부 취소됐다던데요? 공지 안 하고 몰래 회수한답니다."', author: 'rumor_kr', reason: 'misinformation', reporter: 'shadow_99', reportedAt: '11-15', reportedTime: '09:12', status: 'pending', duplicateCount: 1 },
  { id: 7, target: 'question', targetId: 104, preview: '마크 크랙 다운로드 바이러스 링크 공유', fullText: '"마크 크랙 무료 다운로드 링크 공유합니다. 압축 풀고 실행하세요."', author: 'crack_man', reason: 'illegal', reporter: 'pixel_art', reportedAt: '11-15', reportedTime: '08:40', status: 'pending', duplicateCount: 2 },
  { id: 6, target: 'answer', targetId: 290, preview: '비방성 발언 및 상대방 부모 관련 부적절한 언행', fullText: '"(부적절한 표현으로 인해 일부 가려짐)"', author: 'angry_gg', reason: 'abuse', reporter: 'valo_kim', reportedAt: '11-14', reportedTime: '22:15', status: 'pending', duplicateCount: 1 },
  { id: 5, target: 'post', targetId: 42, preview: '불법 도박 사이트 홍보 텔레그램 링크 유포', fullText: '"신규 가입 시 포인트 지급! 텔레그램으로 문의 주세요."', author: 'spam_bot', reason: 'spam', reporter: 'spam_hunter', reportedAt: '11-14', reportedTime: '19:03', status: 'pending', duplicateCount: 1 },
  { id: 4, target: 'question', targetId: 98, preview: '모바일 게임 매크로 판매 홍보', fullText: '"자동 사냥 매크로 판매합니다."', author: 'macro_seller', reason: 'illegal', reporter: 'gamer01', reportedAt: '11-13', reportedTime: '15:20', status: 'resolved', duplicateCount: 1 },
  { id: 3, target: 'comment', targetId: 702, preview: '단순 의견 차이 (공략 방식 반대 의견)', fullText: '"그 공략보다 이 방법이 더 효율적인 것 같아요."', author: 'tactic_pro', reason: 'etc', reporter: 'newbie7', reportedAt: '11-12', reportedTime: '11:47', status: 'rejected', duplicateCount: 1 },
];

/* ------------------------------------------------------------------ */
/* Notices                                                             */
/* ------------------------------------------------------------------ */

export const noticesCopy = {
  title: '공지 관리',
  description: '전체 사용자에게 노출되는 주요 공지사항을 등록하고 관리합니다.',
  newNotice: '새 공지',
  columns: { pinned: '고정', title: '제목', author: '작성자', createdAt: '작성일', actions: '관리' },
  pinnedBadge: '고정',
  editorEditTitle: '공지 수정',
  editorNewTitle: '새 공지 작성',
  pinnedNoticeBadge: '고정 공지',
  titleLabel: '제목',
  titlePlaceholder: '공지 제목을 입력하세요',
  bodyLabel: '내용',
  bodyPlaceholder: '공지 내용을 입력하세요',
  pinLabel: '목록 상단에 고정',
  emptyEditor: '수정할 공지를 선택하거나 새 공지를 작성하세요.',
  defaultAuthor: '운영자01',
  newNoticeDate: '11-16',
};

export const notices: readonly Notice[] = [
  {
    id: 5,
    title: '게임 Q&A 게시판 이용 규칙 안내',
    body:
      '건전하고 유익한 게임 Q&A 커뮤니티 조성을 위한 기본 이용 규칙입니다.\n1. 타인을 비방하거나 욕설, 혐오 표현이 포함된 질문 및 답변은 제재 대상입니다.\n2. 스포일러성 내용은 반드시 스포일러 태그 또는 숨김 처리를 적용해 주세요.\n3. 광고, 불법 프로그램 공유 적발 시 계정이 영구 정지될 수 있습니다.',
    author: '운영자01',
    createdAt: '11-11',
    pinned: true,
  },
  { id: 4, title: '스포일러 태그 사용 안내', body: '신작 및 DLC 관련 게시물에는 스포일러 태그를 반드시 붙여 주세요.', author: '운영자01', createdAt: '11-13', pinned: true },
  { id: 3, title: '태그 작성 가이드 (영문 소문자 + 하이픈)', body: '태그는 영문 소문자와 하이픈(-) 조합으로 작성해 주세요. 예: monster-hunter', author: '운영자01', createdAt: '11-08', pinned: false },
  { id: 2, title: '신고 기능 안내 및 처리 기준', body: '신고는 접수 후 24시간 이내에 검토되며, 처리 결과는 알림으로 안내됩니다.', author: '운영자01', createdAt: '11-05', pinned: false },
  { id: 1, title: '11월 정기 점검 안내', body: '11월 20일 02:00 ~ 06:00 정기 점검이 진행됩니다.', author: '운영자01', createdAt: '11-01', pinned: false },
];

/* ------------------------------------------------------------------ */
/* Activity log                                                        */
/* ------------------------------------------------------------------ */

export const activityLogCopy = {
  title: '활동 로그',
  description: '관리자의 모든 운영 및 제재 조치 내역을 열람하는 감사 로그입니다.',
  adminLabel: '관리자',
  actionLabel: '작업 유형',
  startLabel: '시작일',
  endLabel: '종료일',
  columns: { at: '일시', admin: '관리자', action: '작업', target: '대상', detail: '내용' },
  defaultStart: '2026-11-01',
  defaultEnd: '2026-11-16',
};

export const logAdminOptions: readonly SelectOption[] = [
  { value: 'all', label: '관리자 전체' },
  { value: '운영자01', label: '운영자01' },
  { value: '운영자02', label: '운영자02' },
];

export const logActionOptions: readonly SelectOption[] = [
  { value: 'all', label: '작업 전체' },
  { value: 'HIDE', label: '숨김 (HIDE, 자동 숨김 포함)' },
  { value: 'RESTORE', label: '복구 (RESTORE)' },
  { value: 'DELETE', label: '삭제 (DELETE)' },
  { value: 'SANCTION_USER', label: '회원 제재 (SANCTION_USER)' },
  { value: 'RELEASE_SANCTION', label: '제재 해제 (RELEASE_SANCTION)' },
  { value: 'CREATE_TAG', label: '태그 생성 (CREATE_TAG)' },
  { value: 'UPDATE_TAG', label: '태그 수정 (UPDATE_TAG)' },
  { value: 'DELETE_TAG', label: '태그 삭제 (DELETE_TAG)' },
  { value: 'MERGE_TAG', label: '태그 병합 (MERGE_TAG)' },
  { value: 'RESOLVE_REPORT', label: '신고 처리 (RESOLVE_REPORT)' },
  { value: 'REJECT_REPORT', label: '신고 반려 (REJECT_REPORT)' },
  { value: 'CREATE_NOTICE', label: '공지 작성 (CREATE_NOTICE)' },
  { value: 'UPDATE_NOTICE', label: '공지 수정 (UPDATE_NOTICE)' },
  { value: 'DELETE_NOTICE', label: '공지 삭제 (DELETE_NOTICE)' },
];

export const activityLogs: readonly ActivityLog[] = [
  { id: 8, at: '11-16 14:10', date: '2026-11-16', admin: '운영자01', action: 'RESOLVE_REPORT', targetLabel: '신고 #12', targetHref: '/reports', detail: '대상 숨김 + 7일 정지' },
  { id: 7, at: '11-16 14:10', date: '2026-11-16', admin: '운영자01', action: 'SANCTION_USER', targetLabel: '회원 #4', targetHref: '/members/4', detail: '이용 정지 7일 · 욕설·비하' },
  { id: 6, at: '11-16 13:02', date: '2026-11-16', admin: '운영자01', action: 'HIDE_QUESTION', targetLabel: '질문 #127', targetHref: '/qna', detail: '스팸 광고' },
  { id: 5, at: '11-15 17:45', date: '2026-11-15', admin: '운영자01', action: 'MERGE_TAG', targetLabel: '태그 #8', targetHref: '/tags', detail: '→ league-of-legends' },
  { id: 4, at: '11-15 10:20', date: '2026-11-15', admin: '운영자01', action: 'DELETE_POST', targetLabel: '게시글 #50', targetHref: '/board', detail: '영구 삭제' },
  { id: 10, at: '11-15 09:40', date: '2026-11-15', admin: '시스템', action: 'AUTO_HIDE', targetLabel: '질문 #119', targetHref: '/qna', detail: '신고 10건 누적' },
  { id: 9, at: '11-16 15:20', date: '2026-11-16', admin: '운영자02', action: 'HIDE_ANSWER', targetLabel: '답변 #342', targetHref: '/qna', detail: '욕설' },
  { id: 3, at: '11-14 16:30', date: '2026-11-14', admin: '운영자01', action: 'HIDE_POST', targetLabel: '게시글 #51', targetHref: '/board', detail: '욕설 포함' },
  { id: 2, at: '11-13 10:20', date: '2026-11-13', admin: '운영자01', action: 'SANCTION_USER', targetLabel: '회원 #4', targetHref: '/members/4', detail: '이용 정지 7일' },
  { id: 1, at: '11-12 18:05', date: '2026-11-12', admin: '운영자01', action: 'RELEASE_SANCTION', targetLabel: '회원 #4', targetHref: '/members/4', detail: '이용 정지 해제 · 오처리 정정' },
];

export type LogTone = 'primary' | 'warning' | 'success' | 'danger' | 'neutral';

export const logActionTones: Readonly<Record<LogAction, LogTone>> = {
  SANCTION_USER: 'warning',
  RELEASE_SANCTION: 'success',
  HIDE_QUESTION: 'neutral',
  HIDE_ANSWER: 'neutral',
  HIDE_POST: 'neutral',
  HIDE_COMMENT: 'neutral',
  RESTORE_QUESTION: 'success',
  RESTORE_ANSWER: 'success',
  RESTORE_POST: 'success',
  RESTORE_COMMENT: 'success',
  DELETE_QUESTION: 'danger',
  DELETE_ANSWER: 'danger',
  DELETE_POST: 'danger',
  CREATE_TAG: 'primary',
  UPDATE_TAG: 'primary',
  DELETE_TAG: 'danger',
  MERGE_TAG: 'primary',
  RESOLVE_REPORT: 'primary',
  REJECT_REPORT: 'neutral',
  AUTO_HIDE: 'neutral',
  CREATE_NOTICE: 'primary',
  UPDATE_NOTICE: 'primary',
  DELETE_NOTICE: 'danger',
};

/* ------------------------------------------------------------------ */
/* Pagination (mock totals – server-side paging is out of scope)       */
/* ------------------------------------------------------------------ */

export const pageCounts = {
  members: 5,
  questions: 5,
  answers: 5,
  tags: 5,
  posts: 5,
  comments: 5,
  reports: 3,
  logs: 3,
};

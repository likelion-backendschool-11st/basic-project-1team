import type {
  Kpi,
  LogAction,
  NavEntry,
  Notice,
  PendingReportSummary,
  ReportReason,
  ReportTarget,
  ReportSanctionType,
  SanctionDays,
  SanctionType,
  SelectOption,
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

export const navItems: readonly NavEntry[] = [
  { to: '/', label: '대시보드', icon: 'dashboard' },
  { to: '/members', label: '회원 관리', icon: 'group' },
  { to: '/qna', label: '질문/답변 관리', icon: 'forum' },
  { to: '/tags', label: '태그 관리', icon: 'label' },
  { to: '/board', label: '자유게시판 관리', icon: 'forum' },
  {
    to: '/reports',
    label: '신고 관리',
    icon: 'report_problem',
    badge: PENDING_REPORT_COUNT,
    danger: true,
  },
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
  charUnit: '자',
  prevPage: '이전 페이지',
  nextPage: '다음 페이지',
  emptyRow: '조회된 데이터가 없습니다.',
  loading: '불러오는 중입니다...',
  loadError: '데이터를 불러오지 못했습니다.',
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
  targets: {
    question: '질문',
    answer: '답변',
    post: '게시글',
    comment: '댓글',
    tag: '태그',
    notice: '공지',
  },
  questionCascade: '이 질문에 달린 답변도 함께 삭제됩니다.',
  postCascade: '이 게시글의 댓글도 함께 삭제됩니다.',
  questionTagsCut: '이 질문의 태그 연결도 해제됩니다.',
  acceptedAnswer: '채택된 답변입니다. 삭제하면 질문의 채택 상태도 해제됩니다.',
  tagInUse: (count: number) => `질문 ${count.toLocaleString()}건에서 이 태그가 빠집니다.`,
  tagBlocked:
    '삭제한 태그는 차단 상태로 남아 같은 이름으로 다시 만들 수 없습니다. 차단은 목록에서 해제할 수 있지만 끊긴 질문 연결은 돌아오지 않습니다.',
};

/** 채택된 답변 숨김 확인. 숨기면 채택이 풀리고 복구해도 돌아오지 않는다 (API_SPEC 10.3) */
/** 관리자 글 상세 (API_SPEC 10.3·10.4) */
export const contentDetailCopy = {
  parentQuestion: '질문',
  parentPost: '게시글',
  answers: '답변',
  comments: '댓글',
  noChildren: '없습니다.',
  openDetail: '내용 보기',
};

/** 숨김·복구 확인 창. 사유는 선택이고 활동 로그에 남는다 (API_SPEC 10.3) */
export const statusChangeCopy = {
  hideDescription: '숨기면 사용자 화면에서 보이지 않습니다. 언제든 복구할 수 있습니다.',
  restoreDescription: '복구하면 사용자 화면에 다시 보입니다.',
  reasonLabel: '사유 (선택, 활동 로그에 기록)',
  reasonPlaceholder: '처리 사유를 입력하세요 (200자 이내)',
  reasonMax: 200,
};

/** 채택된 답변을 숨길 때 함께 알리는 내용 */
export const confirmHideAcceptedCopy = {
  released: '채택된 답변입니다. 숨기면 질문의 채택 상태가 해제됩니다.',
  notRestored: '숨김을 복구해도 채택은 돌아오지 않으며, 질문자가 다시 채택할 수 있습니다.',
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
  {
    key: 'members',
    label: '전체 회원',
    value: '128,450',
    icon: 'group',
    tone: 'default',
    href: '/members',
  },
  {
    key: 'signups',
    label: '오늘 가입',
    value: '342',
    icon: 'person_add',
    tone: 'default',
    href: '/members',
  },
  {
    key: 'questions',
    label: '전체 질문',
    value: '45,890',
    icon: 'help',
    tone: 'default',
    href: '/qna',
  },
  {
    key: 'unresolved',
    label: '미해결 질문',
    value: '156',
    icon: 'pending_actions',
    tone: 'attention',
    href: '/qna',
  },
  {
    key: 'reports',
    label: '처리 대기 신고',
    value: String(PENDING_REPORT_COUNT),
    icon: 'priority_high',
    tone: 'urgent',
    href: '/reports',
  },
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
  {
    date: '11-16',
    time: '14:02',
    contentId: 128,
    title: '엘든링 보스 공략 관련 미출시 DLC 스포일러 의혹...',
    reason: '스포일러',
    reporter: 'gamer01',
  },
  {
    date: '11-16',
    time: '13:40',
    contentId: 342,
    title: '패치노트 비방 및 특정 유저에 대한 심각한 인신공격 발언',
    reason: '욕설·비하',
    reporter: 'pro_user',
  },
  {
    date: '11-16',
    time: '11:15',
    contentId: 57,
    title: '불법 대리 육성 홍보 및 외부 메신저 링크 무단 첨부',
    reason: '스팸',
    reporter: 'newbie7',
  },
  {
    date: '11-16',
    time: '10:28',
    contentId: 119,
    title: '발로란트 핵 프로그램 판매 및 불법 바이패스 툴 유포 의혹',
    reason: '불법 프로그램',
    reporter: 'shadow_99',
  },
  {
    date: '11-16',
    time: '09:12',
    contentId: 889,
    title: '게임사 점검 보상 관련 허위 조작 루머 반복적 게시',
    reason: '허위정보',
    reporter: 'pixel_art',
  },
];

/* ------------------------------------------------------------------ */
/* Members                                                             */
/* ------------------------------------------------------------------ */

export const membersCopy = {
  title: '회원 관리',
  description: '등록된 회원 목록을 조회하고 계정 상태 및 권한을 관리합니다.',
  searchPlaceholder: '아이디 또는 닉네임 입력',
  columns: {
    id: 'ID',
    username: '아이디',
    nickname: '닉네임',
    role: '권한',
    status: '상태',
    joinedAt: '가입일',
    actions: '관리',
  },
  statusLabels: { active: '활성', restricted: '제한', suspended: '정지', withdrawn: '탈퇴' },
  permanent: '영구',
  /** 탈퇴하면 닉네임·아이디가 비워진다 (API_SPEC 2장 회원 탈퇴) */
  withdrawnName: '탈퇴한 회원',
  emptyValue: '-',
};

/** '상태 전체'는 탈퇴 회원을 뺀 전체 (API_SPEC 10.2) */
export const memberStatusOptions: readonly SelectOption[] = [
  { value: 'all', label: '상태 전체' },
  { value: 'active', label: '활성' },
  { value: 'restricted', label: '제한 (글쓰기·댓글)' },
  { value: 'suspended', label: '정지' },
  { value: 'withdrawn', label: '탈퇴' },
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

/* ------------------------------------------------------------------ */
/* Member detail                                                       */
/* ------------------------------------------------------------------ */

export const memberDetailCopy = {
  back: '회원 목록',
  title: '회원 상세',
  basicInfo: '기본 정보',
  fields: {
    username: '아이디',
    nickname: '닉네임',
    role: '권한',
    status: '상태',
    name: '이름',
    email: '이메일',
    permissions: '추가 권한',
    joinedAt: '가입일',
    withdrawnAt: '탈퇴일',
  },
  activityTitle: '활동 현황',
  activityHint: '질문·답변은 숨김 포함, 삭제 제외 · 클릭 시 해당 회원 목록',
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
  apply: '제재 적용',
  release: '해제',
  untilSuffix: '까지',
  alreadyActive: '같은 종류의 제재가 이미 적용 중입니다. 해제 후 다시 적용하세요.',
  adminProtected: '관리자 계정은 제재할 수 없습니다.',
  withdrawnBlocked: '탈퇴한 회원은 제재할 수 없습니다.',
  releasedSuffix: '해제',
  reasonRequired: '사유를 먼저 입력하세요.',
  historyTitle: '제재 이력',
  historyTotal: '전체',
  historyColumns: { at: '일시', admin: '처리자', label: '내용', reason: '사유' },
  notFound: '회원을 찾을 수 없습니다.',
};

/** 관리자가 줄 수 있는 추가 권한 (API_SPEC 10.2) */
export const permissionLabels: Readonly<Record<string, string>> = {
  content_manage: '게시물·댓글 관리',
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

export const sanctionTypeOptions: readonly SelectOption<SanctionType>[] = (
  Object.keys(sanctionTypeLabels) as SanctionType[]
).map((value) => ({ value, label: sanctionTypeLabels[value] }));

export const sanctionDurations: readonly SelectOption<SanctionDays>[] = [
  { value: '3', label: '3일' },
  { value: '7', label: '7일' },
  { value: '30', label: '30일' },
  { value: 'permanent', label: '영구' },
];

/* ------------------------------------------------------------------ */
/* Q&A                                                                 */
/* ------------------------------------------------------------------ */

export const qnaCopy = {
  title: '질문/답변 관리',
  description: '게시된 질문과 답변을 모니터링하고 공개 여부 및 불량 콘텐츠를 관리합니다.',
  tabs: { questions: '질문', answers: '답변' },
  searchPlaceholder: '제목 또는 작성자',
  answerSearchPlaceholder: '본문 또는 작성자',
  tagPlaceholder: '태그 입력 (예: elden-ring)',
  columns: {
    id: 'ID',
    title: '제목',
    author: '작성자',
    tag: '태그',
    answers: '답변',
    resolved: '해결',
    status: '상태',
    createdAt: '작성일',
    actions: '관리',
  },
  answerColumns: {
    id: 'ID',
    preview: '답변 미리보기',
    question: '질문',
    author: '작성자',
    accepted: '채택',
    status: '상태',
    createdAt: '작성일',
    actions: '관리',
  },
  accepted: '채택',
  authorFilter: (authorId: string) => `회원 #${authorId}의 글만 보고 있습니다.`,
  clearAuthorFilter: '전체 보기',
};

/** 'all' 은 삭제된 항목을 뺀 전체 (API 의 status 생략과 같음) */
export const contentStatusOptions: readonly SelectOption[] = [
  { value: 'all', label: '상태 전체 (삭제 제외)' },
  { value: 'active', label: '공개' },
  { value: 'hidden', label: '숨김' },
  { value: 'deleted', label: '삭제됨' },
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
  /** 설명 최대 길이 (API_SPEC 10.5) */
  descMax: 100,
  searchPlaceholder: '태그명 검색...',
  noDescription: '설명 없음',
  blockedBadge: '차단됨',
  mergedBadge: '병합됨',
  restore: '차단 해제',
  blockedName: '삭제(차단)된 태그와 같은 이름입니다. 목록에서 차단을 해제한 뒤 사용하세요.',
  /** 병합된 이름은 다시 만들 수 없다 (API_SPEC 10.5, 409 TAG_DUPLICATED) */
  mergedName: '다른 태그로 병합된 이름입니다. 병합 대상 태그를 사용하세요.',
  duplicateName: '이미 있는 태그입니다.',
  noActions: '-',
  columns: {
    name: '태그명',
    description: '설명',
    usage: '사용 횟수',
    createdAt: '생성일',
    actions: '관리',
  },
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
    summaryDeleted: '태그는 병합됨 상태가 되고, 이후 이 이름은 대상 태그로 저장됩니다.',
    irreversible: '병합은 되돌릴 수 없습니다. 대상 태그를 다시 확인하세요.',
    submit: '병합 실행',
  },
};

export const tagStatusOptions: readonly SelectOption[] = [
  { value: 'all', label: '상태 전체' },
  { value: 'active', label: '사용 중' },
  { value: 'blocked', label: '차단됨' },
  { value: 'merged', label: '병합됨' },
];

export const tagSortOptions: readonly SelectOption[] = [
  { value: 'usage_desc', label: '사용 많은순' },
  { value: 'name_asc', label: '이름순' },
  { value: 'recent', label: '최신순' },
];

/* ------------------------------------------------------------------ */
/* Free board                                                          */
/* ------------------------------------------------------------------ */

export const boardCopy = {
  title: '자유게시판 관리',
  description: '자유게시판 게시글 및 댓글을 모니터링하고 공개 여부 및 불량 콘텐츠를 관리합니다.',
  tabs: { posts: '게시글', comments: '댓글' },
  searchPlaceholder: '제목 또는 작성자',
  commentSearchPlaceholder: '내용 또는 작성자',
  columns: {
    id: 'ID',
    title: '제목',
    author: '작성자',
    comments: '댓글',
    status: '상태',
    createdAt: '작성일',
    actions: '관리',
  },
  commentColumns: {
    id: 'ID',
    preview: '댓글 내용',
    post: '게시글',
    author: '작성자',
    status: '상태',
    createdAt: '작성일',
    actions: '관리',
  },
};

/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */

export const reportsCopy = {
  title: '신고 관리',
  description: '접수된 신고 내역을 검토하고 콘텐츠 숨김 및 제재 처리를 진행합니다.',
  tabs: { pending: '처리 대기', resolved: '처리 완료', rejected: '반려' },
  columns: {
    id: 'ID',
    target: '대상',
    preview: '내용 미리보기',
    reason: '사유',
    reporter: '신고자',
    reportedAt: '신고일',
  },
  panelTitlePrefix: '신고',
  panelTitleSuffix: '처리',
  authorPrefix: '작성자',
  viewOriginal: '원문 보기',
  duplicatePrefix: '같은 대상 신고',
  duplicateSuffix: '누적됨',
  hideTarget: '대상 숨김 처리',
  sanctionLabel: '작성자 제재',
  sanctionDurationLabel: '제재 기간',
  reject: '반려',
  resolve: '처리 완료',
  emptyPanel: '목록에서 신고를 선택하세요.',
  detailLabel: '신고자 상세 사유',
  noDetail: '상세 사유 없음',
  evidenceLabel: '증빙 이미지',
  evidenceOpen: (name: string) => `${name} 새 창에서 보기`,
  deletedTarget: '삭제된 콘텐츠',
  deletedTargetNote: '신고 대상이 이미 삭제되었습니다. 처리하면 신고 상태만 처리 완료로 바뀝니다.',
  closedPanel: '이미 처리된 신고입니다.',
  hiddenMark: '(숨김)',
  alreadyHidden: '대상은 이미 숨김 상태입니다.',
  withdrawnAuthor: '작성자가 탈퇴해 제재할 수 없습니다.',
  authorFilter: (authorId: string) => `회원 #${authorId}이(가) 받은 신고만 보고 있습니다.`,
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

/* ------------------------------------------------------------------ */
/* Notices                                                             */
/* ------------------------------------------------------------------ */

export const noticesCopy = {
  title: '공지 관리',
  description: '전체 사용자에게 노출되는 주요 공지사항을 등록하고 관리합니다.',
  newNotice: '새 공지',
  columns: {
    pinned: '고정',
    title: '제목',
    author: '작성자',
    createdAt: '작성일',
    actions: '관리',
  },
  pinnedBadge: '고정',
  editorEditTitle: '공지 수정',
  editorNewTitle: '새 공지 작성',
  pinnedNoticeBadge: '고정 공지',
  titleLabel: '제목',
  titlePlaceholder: '공지 제목을 입력하세요',
  /** 제목 최대 길이 (API_SPEC 10.7) */
  titleMax: 100,
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
    body: '<p>건전하고 유익한 게임 Q&amp;A 커뮤니티 조성을 위한 기본 이용 규칙입니다.</p><ol><li>타인을 비방하거나 욕설, 혐오 표현이 포함된 질문 및 답변은 제재 대상입니다.</li><li>스포일러성 내용은 반드시 스포일러 태그 또는 숨김 처리를 적용해 주세요.</li><li>광고, 불법 프로그램 공유 적발 시 계정이 영구 정지될 수 있습니다.</li></ol>',
    author: '운영자01',
    createdAt: '11-11',
    pinned: true,
  },
  {
    id: 4,
    title: '스포일러 태그 사용 안내',
    body: '<p>신작 및 DLC 관련 게시물에는 스포일러 태그를 반드시 붙여 주세요.</p>',
    author: '운영자01',
    createdAt: '11-13',
    pinned: true,
  },
  {
    id: 3,
    title: '태그 작성 가이드 (영문 소문자 + 하이픈)',
    body: '<p>태그는 영문 소문자와 하이픈(-) 조합으로 작성해 주세요. 예: monster-hunter</p>',
    author: '운영자01',
    createdAt: '11-08',
    pinned: false,
  },
  {
    id: 2,
    title: '신고 기능 안내 및 처리 기준',
    body: '<p>신고는 접수 후 24시간 이내에 검토되며, 처리 결과는 알림으로 안내됩니다.</p>',
    author: '운영자01',
    createdAt: '11-05',
    pinned: false,
  },
  {
    id: 1,
    title: '11월 정기 점검 안내',
    body: '<p>11월 20일 02:00 ~ 06:00 정기 점검이 진행됩니다.</p>',
    author: '운영자01',
    createdAt: '11-01',
    pinned: false,
  },
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
};

export const logAdminAllOption: SelectOption = { value: 'all', label: '관리자 전체' };

export const logActionOptions: readonly SelectOption[] = [
  { value: 'all', label: '작업 전체' },
  { value: 'HIDE', label: '숨김 (HIDE)' },
  { value: 'RESTORE', label: '복구 (RESTORE)' },
  { value: 'DELETE', label: '삭제 (DELETE)' },
  { value: 'SANCTION_USER', label: '회원 제재 (SANCTION_USER)' },
  { value: 'RELEASE_SANCTION', label: '제재 해제 (RELEASE_SANCTION)' },
  { value: 'GRANT_PERMISSION', label: '관리 권한 부여 (GRANT_PERMISSION)' },
  { value: 'REVOKE_PERMISSION', label: '관리 권한 회수 (REVOKE_PERMISSION)' },
  { value: 'MODERATE_EDIT', label: '관리 권한 수정 (MODERATE_EDIT)' },
  { value: 'MODERATE_DELETE', label: '관리 권한 삭제 (MODERATE_DELETE)' },
  { value: 'CREATE_TAG', label: '태그 생성 (CREATE_TAG)' },
  { value: 'UPDATE_TAG', label: '태그 수정 (UPDATE_TAG)' },
  { value: 'DELETE_TAG', label: '태그 삭제 (DELETE_TAG)' },
  { value: 'RESTORE_TAG', label: '태그 차단 해제 (RESTORE_TAG)' },
  { value: 'MERGE_TAG', label: '태그 병합 (MERGE_TAG)' },
  { value: 'RESOLVE_REPORT', label: '신고 처리 (RESOLVE_REPORT)' },
  { value: 'REJECT_REPORT', label: '신고 반려 (REJECT_REPORT)' },
  { value: 'CREATE_NOTICE', label: '공지 작성 (CREATE_NOTICE)' },
  { value: 'UPDATE_NOTICE', label: '공지 수정 (UPDATE_NOTICE)' },
  { value: 'DELETE_NOTICE', label: '공지 삭제 (DELETE_NOTICE)' },
];

export type LogTone = 'primary' | 'warning' | 'success' | 'danger' | 'neutral';

/**
 * action 그룹 필터에 들어가는 action (API_SPEC 10.8).
 * RESTORE_TAG·DELETE_TAG 는 이름이 비슷해도 콘텐츠 숨김·복구·삭제 그룹이 아니다.
 */
export const logActionGroups: Readonly<Record<string, readonly LogAction[]>> = {
  HIDE: ['HIDE_QUESTION', 'HIDE_ANSWER', 'HIDE_POST', 'HIDE_COMMENT'],
  RESTORE: ['RESTORE_QUESTION', 'RESTORE_ANSWER', 'RESTORE_POST', 'RESTORE_COMMENT'],
  DELETE: ['DELETE_QUESTION', 'DELETE_ANSWER', 'DELETE_POST', 'DELETE_COMMENT'],
};

export const logActionTones: Readonly<Record<LogAction, LogTone>> = {
  SANCTION_USER: 'warning',
  RELEASE_SANCTION: 'success',
  GRANT_PERMISSION: 'primary',
  REVOKE_PERMISSION: 'neutral',
  MODERATE_EDIT: 'neutral',
  MODERATE_DELETE: 'danger',
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
  DELETE_COMMENT: 'danger',
  CREATE_TAG: 'primary',
  UPDATE_TAG: 'primary',
  DELETE_TAG: 'danger',
  RESTORE_TAG: 'success',
  MERGE_TAG: 'primary',
  RESOLVE_REPORT: 'primary',
  REJECT_REPORT: 'neutral',
  CREATE_NOTICE: 'primary',
  UPDATE_NOTICE: 'primary',
  DELETE_NOTICE: 'danger',
};

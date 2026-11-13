import type { GuideItem, ReportReason, ReportTargetType, SelectOption } from './types';

/* ------------------------------------------------------------------ */
/* Question list                                                       */
/* ------------------------------------------------------------------ */

export const questionListPage = {
  title: '질문/답변',
  description:
    '게임 공략, 버그 해결, 빌드 최적화 및 테크니컬 이슈를 나누는 프로 게이머 Q&A 포럼입니다.',
  newQuestion: '신규 질문 등록',
  searchPlaceholder: '질문 검색 또는 #태그 입력 (예: #마인크래프트, #엘든링)',
  filterLabel: '필터',
  resetLabel: '초기화',
  quickTagsLabel: '인기 게임 태그:',
  allTag: '전체',
  /** count 는 천 단위 쉼표를 넣은 값 */
  totalLabel: (count: string) => `총 ${count}개의 질문 등록됨`,
  loadingMessage: '질문을 불러오는 중입니다…',
  emptyMessage: '조건에 맞는 질문이 없습니다.',
  columns: ['NO', '제목', '태그', '답변', '작성자', '작성일', '조회수'],
} as const;

export const searchScopes: readonly SelectOption[] = [
  { value: 'all', label: '통합검색' },
  { value: 'tag', label: '태그 (#)' },
  { value: 'title', label: '제목' },
  { value: 'author', label: '작성자' },
];

export const sortOptions: readonly SelectOption[] = [
  { value: 'latest', label: '최신순' },
  { value: 'views', label: '조회순' },
];

export const filterPanel = {
  answerFilter: {
    label: '답변 존재 여부',
    options: [
      { value: 'all', label: '전체' },
      { value: 'has_answer', label: '답변 있음' },
      { value: 'waiting', label: '답변 없음' },
    ] as readonly SelectOption[],
  },
  acceptedFilter: {
    label: '채택답변 존재 여부',
    options: [
      { value: 'all', label: '전체' },
      { value: 'accepted_only', label: '채택 완료' },
      { value: 'unsolved', label: '채택 대기' },
    ] as readonly SelectOption[],
  },
  tagFilter: {
    label: '태그 검색 필터',
    placeholder: '게임명 태그 입력 (예: 마인크래프트)',
  },
} as const;

/** 질문 목록 하단 커뮤니티 통계 문구. 값은 GET /api/questions/stats (API_SPEC 3장) */
export const communityStatsCopy = {
  /** 불러오기 전·실패·값 없음 */
  empty: '-',
  todayAccepted: {
    label: '오늘 채택 완료된 솔루션',
    value: (count: string) => `${count}건`,
    note: (acceptRate: number) => `해결률 ${acceptRate}%`,
  },
  firstAnswer: {
    label: '평균 최초 답변 시간',
    value: (minutes: string) => `${minutes}분`,
    note: '최근 7일 기준',
  },
  trendingTag: {
    label: '트렌딩 태그',
    value: (name: string) => `#${name}`,
    note: (count: string) => `최근 7일 질문 ${count}개`,
  },
  unanswered: {
    label: '현재 미답변 질문',
    value: (count: string) => `${count}개`,
    note: '답변 작성하러 가기 →',
  },
} as const;

/* ------------------------------------------------------------------ */
/* Question detail (QNA #4029)                                         */
/* ------------------------------------------------------------------ */

export const questionDetailLabels = {
  home: '홈',
  board: '질문/답변',
  edit: '질문 수정',
  remove: '질문 삭제',
  removeBlocked: '답변이 등록된 질문은 삭제할 수 없습니다.',
  removeConfirm: '질문을 삭제할까요? 삭제한 질문은 목록과 검색에서 사라집니다.',
  removed: '질문이 삭제되었습니다.',
  notFound: '존재하지 않거나 삭제된 질문입니다.',
  answerRemoveConfirm: '답변을 삭제할까요? 삭제한 답변은 목록과 답변 수에서 빠집니다.',
  removeBlockedAlert:
    '답변이 1개 이상 등록된 질문은 커뮤니티 데이터 보존을 위해 직접 삭제할 수 없습니다. 관리자 문의를 이용해 주세요.',
  report: '신고',
  reportQuestion: '질문 신고',
  reportAnswer: '답변 신고',
  /** 답변 추천 (질문 추천은 범위 제외, API_SPEC D-11) */
  vote: '추천',
  answers: '답변',
  answersHeading: '답변',
  answerSort: [
    { value: 'latest', label: '최신순' },
    { value: 'votes', label: '추천순' },
  ] as readonly SelectOption[],
  acceptedBadge: '채택된 답변',
  acceptedBy: '질문자가 채택함',
  answeredSuffix: '에 답변함',
  editedSuffix: ' 수정',
  postedSuffix: ' 작성',
  tipLabel: '해결 팁:',
  editAnswer: '수정',
  deleteAnswer: '삭제',
  acceptedState: '채택됨',
  acceptAnswer: '답변 채택',
  acceptConfirm:
    '이 답변을 채택할까요? 채택은 취소할 수 없고, 채택한 답변은 수정·삭제할 수 없습니다.',
  loading: '질문을 불러오는 중입니다…',
  answersCount: (count: string) => `${count}개`,
  status: { accepted: '채택 완료', answered: '답변 접수중', waiting: '답변 대기' },
} as const;

export const answerComposer = {
  title: '새 답변 작성',
  markdownHint: '서식 편집 지원',
  placeholder:
    '문제 해결에 도움이 되는 명확하고 구체적인 답변을 작성해 주세요. (타인을 비방하거나 주제와 무관한 내용은 제재될 수 있습니다.)',
  submit: '답변 등록',
  submitted: '답변이 등록되었습니다.',
  submitting: '등록 중...',
} as const;

export const questionMeta = {
  title: '질문 메타 정보',
  statusLabel: '질문 상태',
  viewsLabel: '조회수',
  views: (count: string) => `${count} 회`,
  answersLabel: '답변',
  answers: (count: string) => `${count}개`,
} as const;

/** 질문 작성자 카드. 값은 GET /api/users/:userId (API_SPEC 2장) */
export const questionAuthor = {
  joined: (date: string) => `가입일: ${date}`,
  activity: (questions: string, answers: string) => `질문 ${questions}개 • 답변 ${answers}개`,
  noBio: '소개글이 없습니다.',
  withdrawn: '탈퇴한 회원입니다.',
} as const;

export const relatedQuestions = {
  title: '관련된 유사 질문',
  empty: '태그가 겹치는 다른 질문이 없습니다.',
  status: (isAccepted: boolean, answerCount: string) =>
    isAccepted ? `채택 완료 (답변 ${answerCount})` : `답변 ${answerCount}`,
} as const;

/* ------------------------------------------------------------------ */
/* Shared editor content                                               */
/* ------------------------------------------------------------------ */

/** 본문 양식. 에디터 본문이 HTML 이라 양식도 HTML 로 둔다. (API_SPEC 1.9) */
export const editorTemplates = {
  bug: '<p><strong>[발생 환경]</strong></p><ul><li>OS: Windows 11 / Mac OS</li><li>게임 및 빌드 번호:</li><li>설치된 모드/런처:</li></ul><p><strong>[오류 증상 및 재현 경로]</strong></p><ol><li>게임 실행 후 ...</li><li>특정 상황에서 크래시 발생 또는 UI 멈춤 현상 발생.</li></ol><p><strong>[시도한 해결 방법]</strong></p><ul><li>그래픽 드라이버 재설치 완료</li><li>무결성 검사 진행</li></ul>',
  spec: '<p><strong>[PC 사양 명세]</strong></p><ul><li>CPU: AMD Ryzen 7 7800X3D</li><li>GPU: NVIDIA RTX 4070 Ti (드라이버 551.86)</li><li>RAM: 32GB DDR5</li><li>해상도: QHD (2560x1440) 165Hz</li></ul><p><strong>[이슈 현상]</strong></p><ul><li>특정 컷신 또는 대규모 교전 시 1% Low FPS가 20대로 급격히 하락</li></ul><p><strong>[옵션 세팅]</strong></p><ul><li>레이트레이싱: 끔</li><li>DLSS 모드: 품질</li></ul>',
  steps:
    '<h3>🛠️ 단계별 해결 절차</h3><ol><li>[단계 1]</li><li>[단계 2]</li><li>[단계 3] 검증 및 인게임 확인</li></ol>',
  console:
    '<pre># 주민 디버그 및 강제 리프레시 명령어\n/data get entity @e[type=villager,limit=1,sort=nearest] Brain.memories</pre>',
} as const;

/** mock: 관리자가 삭제(차단)한 태그. 서버는 400 TAG_BLOCKED 로 거절한다 (API_SPEC 5.1) */
export const editorMessages = {
  templateAppendConfirm: '기존 작성된 내용 뒤에 템플릿을 추가하시겠습니까?',
  maxTags: '태그는 최대 5개까지만 등록 가능합니다.',
  tagRequired: '태그를 하나 이상 입력해주세요.',
  leaveConfirm: '작성 중인 내용이 저장되지 않을 수 있습니다. 나가시겠습니까?',
  titleRequired: '질문 제목을 입력해주세요.',
  bodyTooShort: '증상과 시도한 내용을 15자 이상 구체적으로 작성해주세요.',
} as const;

/* ------------------------------------------------------------------ */
/* New question                                                        */
/* ------------------------------------------------------------------ */

export const newQuestionPage = {
  breadcrumbCurrent: '신규 질문 작성',
  autosaveNone: '입력하면 3초 뒤 자동으로 임시저장됩니다',
  autosaveAt: (time: string) => `마지막 임시저장: ${time}`,
  autosaveFailed: '브라우저 저장소를 쓸 수 없어 임시저장하지 못했습니다.',
  draftRestored: (time: string) => `${time}에 임시저장한 질문을 불러왔습니다.`,
  draftDiscard: '지우고 새로 쓰기',
  draftDiscardConfirm: '임시저장한 내용을 지우고 새로 쓸까요?',
  title: '신규 질문 작성',
  description:
    '게임 공략, 버그 트러블슈팅, 빌드 최적화 등 테크니컬한 이슈를 커뮤니티 전문가들에게 질문해보세요.',
  titleLabel: '질문 제목',
  titleMax: 100,
  titlePlaceholder: '예: [1.20.4] 주민 직업 블록 거래 갱신 불가 현상 및 NBT 충돌 해결 문의',
  titleHelpPrefix:
    '구체적인 오류 증상과 버전 정보를 제목에 명시하세요. 게임 종류 및 세부 분류는 하단의 ',
  titleHelpStrong: '[3. 태그 검색 및 선택]',
  titleHelpSuffix: '에서 지정할 수 있습니다.',
  bodyLabel: '본문 작성',
  bodyModeBadge: 'WYSIWYG',
  templateLabel: '템플릿 삽입:',
  bugTemplate: '버그 리포트 양식',
  specTemplate: '사양/최적화 양식',
  bodyPlaceholder: `시도한 내용, 환경, 오류 메시지 등을 자세히 작성하세요.

1. 발생 환경
- OS: Windows 11 64bit
- 게임 버전: Minecraft Java Edition 1.20.4
- 모드/로더: Fabric loader 0.15.7 (Sodium, Lithium 설치)

2. 문제 증상 및 오류 메시지
- 독서대를 배치해도 백수 주민이 사서로 전직하지 않고 직업 블록을 감지하지 못함.

3. 직접 시도해본 해결 방법
- 주민 침대 재설치, 주변 32블록 내 다른 작업대 전수 철거 후 테스트 완료.`,
  tagLabel: '태그 검색 및 선택',
  tagHint: '(최대 5개)',
  tagPlaceholder: '태그 입력 후 Enter (예: 버그, 패브릭, 크래시)...',
  tagRecommendLabel: '추천 태그:',
  guideline: '커뮤니티 가이드라인을 준수하여 작성되었습니다.',
  cancel: '취소',
  draft: '임시저장',
  draftSaved: '저장됨',
  submit: '질문 등록',
  submitting: '등록 중...',
  submitDone: '질문이 등록되었습니다.',
} as const;

export const writingGuide = {
  title: '좋은 질문 작성 가이드',
  items: [
    {
      title: '게임명과 버전을 제목에 명시',
      body: '버전에 따라 버그 원인과 공략 솔루션이 완전히 달라집니다.',
    },
    {
      title: '직접 시도해본 과정 기록',
      body: '중복된 해결책 답변을 방지하고 정확한 원인을 분석할 수 있습니다.',
    },
    {
      title: '크래시 로그 또는 스크린샷 동봉',
      body: '스택 트레이스(Stacktrace) 코드는 기술 답변자에게 가장 중요한 단서입니다.',
    },
  ] as readonly GuideItem[],
  highlightTitle: '평균 15분 이내 첫 답변 도착',
  highlightBody:
    '자세한 정보를 포함할수록 Obsidian Nexus 상위 티어 게이머의 채택형 답변률이 84% 증가합니다.',
} as const;

export const rewardCard = {
  title: '보상 및 명예 점수',
  season: 'Season 4',
  tiles: [
    { label: '질문 채택 완료 시', value: '+50 EXP', note: '질문자 지급', tone: 'secondary' },
    { label: '채택된 솔루션', value: '+100 EXP', note: '답변자 지급', tone: 'primary' },
  ],
  levelBadge: 'Lv.4',
  levelTitle: '내 활동 레벨: Elite Tech',
  levelProgress: '현재 1,420 / 2,000 EXP',
  levelPercent: 72,
} as const;

export const similarSolved = {
  title: '유사한 기존 해결 질문',
  description: '작성 중인 키워드와 관련된 이미 해결된 Q&A입니다.',
  solvedLabel: '해결됨',
  items: [
    { id: 1, title: '마인크래프트 1.20 주민 전직 안되는 버그 고치는 법', answers: '답변 3개' },
    { id: 2, title: 'Fabric 1.20.4 crash on launch (Lithium / Sodium 충돌)', answers: '답변 7개' },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* Edit question                                                       */
/* ------------------------------------------------------------------ */

export const editQuestionPage = {
  breadcrumbCurrent: '질문 수정',
  title: '질문 수정',
  description:
    '등록된 질문의 제목, 본문 내용 및 태그를 수정할 수 있습니다. 이미 답변이 작성된 경우 채택 전까지 자유로운 보완 및 로그 추가가 가능합니다.',
  noticeStrong: '수정 반영 안내:',
  noticePrefix: ' 저장하면 질문에 ',
  noticeEdited: '‘수정됨’',
  noticeSuffix: ' 표시와 수정 일시가 붙고, 수정 이력(일시·수정자·사유)이 남습니다.',
  titleLabel: '질문 제목',
  titlePlaceholder: '상대방이 질문을 파악할 수 있도록 핵심 현상과 환경을 명확히 요약해주세요',
  templateLabel: '양식 불러오기:',
  bugTemplate: '버그 리포트 양식',
  specTemplate: '사양/환경 양식',
  bodyPlaceholder: '문제가 발생한 경위, 시도한 해결 방법, 에러 로그를 구체적으로 작성해 주세요.',
  tagTitle: '태그 관리 (최대 5개)',
  tagCountSuffix: '등록됨',
  tagHelpPrefix: '본 질문은 카테고리 대신 오직 ',
  tagHelpStrong: '태그',
  tagHelpSuffix:
    '로만 검색 및 관련 커뮤니티 섹션에 자동 분류됩니다. 관련 게임명, 에디션, 버전, 이슈를 포함해주세요.',
  tagPlaceholder: '추가 태그 입력 후 Enter...',
  tagRecommendLabel: '추천 빠른 추가:',
  reasonLabel: '수정 사유',
  reasonOptional: '(선택 사항)',
  reasonHint: '답변자 및 검토자에게 노출됩니다',
  reasonPlaceholder: '예: 오타 수정, OS/자바 버전 상세 명시, 크래시 스크린샷 보완',
  /** 수정 사유 최대 길이 (API_SPEC 3장 editReason) */
  reasonMax: 200,
  back: '수정 취소하고 상세로 돌아가기',
  submit: '질문 수정 완료',
  submitting: '수정 내역 반영 중...',
  submitDone: '질문 수정이 반영되었습니다.',
  noChanges: '수정한 내용이 없습니다.',
  loading: '질문을 불러오는 중입니다…',
  notFound: '질문을 찾을 수 없습니다. 삭제되었거나 숨김 처리된 질문입니다.',
  notMine: '질문 작성자만 수정할 수 있습니다.',
  backToList: '질문 목록으로',
} as const;

/** 질문 수정 화면 사이드바. 값은 수정할 질문(GET /api/questions/:questionId) */
export const editQuestionStatus = {
  title: '현재 질문 현황',
  badge: { accepted: '채택 완료', answered: '답변 접수중', waiting: '답변 대기' },
  answersLabel: '등록된 답변',
  answersSuffix: (isAccepted: boolean) => (isAccepted ? '개 (채택 완료)' : '개 (미채택)'),
  viewsLabel: '누적 조회수',
  views: (count: string) => `${count} 회`,
  createdLabel: '최초 등록',
} as const;

export const editCautions = {
  title: '질문 수정 시 주의사항',
  items: [
    {
      title: '기존 답변과의 일관성 유지',
      body: '이미 답변이 달렸다면 질문의 핵심 문제를 완전히 다른 게임이나 현상으로 바꾸지 마세요. 기존 답변과 질문이 맞지 않게 됩니다.',
      tone: 'primary',
    },
    {
      title: '수정 이력 관리',
      body: '수정하면 질문에 ‘수정됨’ 표시와 최종 수정 일시가 붙고 수정 이력(일시·수정자·사유)이 남습니다. 수정 전 본문은 저장되지 않습니다.',
      tone: 'tertiary',
    },
    {
      title: '태그 변경의 영향력',
      body: '본 플랫폼은 카테고리 없이 태그 단위 인덱싱을 지원하므로, 잘못된 태그 삭제 및 정확한 태그 추가 시 검색 노출도가 최적화됩니다.',
      tone: 'secondary',
    },
  ],
} as const;

export const originalPreview = {
  label: '원본 게시글 미리보기',
  open: '새 창으로 열기',
  answers: (count: string) => `답변 ${count}개`,
  edited: '수정됨',
  notEdited: '최종 수정 전',
} as const;

/* ------------------------------------------------------------------ */
/* Edit answer                                                         */
/* ------------------------------------------------------------------ */

export const editAnswerPage = {
  breadcrumbCurrent: '답변 수정',
  title: '답변 수정',
  codePrefix: '#ANS-',
  description: '등록된 답변의 설명, 테크니컬 가이드, 증빙 스크린샷 및 로그를 수정합니다.',
  editNote: '수정하면 답변에 수정됨 표시가 붙습니다',
  /** 채택된 답변은 수정할 수 없다 (REQ-QNA-012, 409 ANSWER_ALREADY_ACCEPTED) */
  acceptedBlocked: {
    title: '채택된 답변은 수정할 수 없습니다',
    body: '질문자가 채택한 답변은 내용이 바뀌지 않도록 수정과 삭제가 막혀 있습니다. 보충할 내용이 있으면 질문 상세에서 새 답변으로 남겨 주세요.',
    back: '질문 상세로 돌아가기',
  },
  target: {
    label: '수정 대상 질문 (Original Thread)',
    qid: (id: number) => `Q-ID #${id}`,
    collapse: '질문 요약 접기',
    expand: '질문 요약 펼치기',
    postedAt: (date: string) => `${date} 등록`,
    views: (count: string) => `조회 ${count}`,
    openOriginal: '새 창으로 원본 질문 전체보기',
  },
  editorTitle: '답변 내용 편집',
  stepsTemplate: '단계별 해결법 서식',
  consoleTemplate: '콘솔/명령어 가이드 서식',
  bodyPlaceholder: '답변 내용을 상세하게 수정해 주세요...',
  maxLength: 10000,
  markdownSupport: '서식 편집 지원',
  reasonLabel: '수정 사유 입력',
  reasonOptional: '(선택 사항)',
  reasonVersion: '수정 이력에 함께 남습니다',
  /** 수정 사유 최대 길이 (API_SPEC 4장, 질문 수정과 같음) */
  reasonMax: 200,
  reasonPlaceholder:
    '어떤 부분이 보완되었는지 간략히 남겨주세요 (예: 오탈자 수정, 명령어 경로 변경 등)',
  reasonHint: '수정 사유는 수정 내역 히스토리에 공개되어 다른 게이머들의 이해를 돕습니다.',
  back: '수정 취소하고 상세로 돌아가기',
  submit: '답변 수정 완료',
  submitting: '저장 중...',
  submitDone: '답변 수정이 반영되었습니다.',
  noChanges: '수정한 내용이 없습니다.',
  bodyRequired: '답변 내용을 입력해주세요.',
  loading: '답변을 불러오는 중입니다…',
  notFound: '답변을 찾을 수 없습니다. 삭제되었거나 숨김 처리된 답변입니다.',
  notMine: '답변 작성자만 수정할 수 있습니다.',
} as const;

/** 답변 수정 화면 사이드바. 값은 수정할 답변 (API_SPEC 4장) */
export const myAnswerStatus = {
  title: '내 답변 현황',
  badge: { accepted: '채택됨', waiting: '채택 대기' },
  votesLabel: '받은 추천 수',
  createdLabel: '최초 작성:',
  historyLabel: '최종 수정:',
  noHistory: '수정 내역 없음',
} as const;

export const answerCautions = {
  title: '답변 수정 시 주의사항',
  items: [
    {
      title: '채택되면 수정할 수 없음',
      body: '질문자가 답변을 채택하면 그 뒤로는 수정·삭제할 수 없습니다. 보완할 내용은 채택 전에 반영해 주세요.',
    },
    {
      title: '수정 이력 공개',
      body: "수정하면 답변에 '수정' 표시가 붙고, 누구나 수정 일시를 눌러 수정 이력(일시·수정자·사유)을 볼 수 있습니다. 수정 전 본문은 저장되지 않습니다.",
    },
    {
      title: '추가 피드백 반영 시 팁',
      body: "질문자의 댓글 질문이 있었다면 본문 하단에 '💡 추가 업데이트' 항목을 만들어 기술하는 것을 권장합니다.",
    },
  ] as readonly GuideItem[],
} as const;

export const originalQuestionLink = {
  label: '원본 질문 링크',
  author: (nickname: string) => `작성자: ${nickname}`,
  answers: (count: string) => `답변 ${count}개 등록됨`,
  open: '질문 본문 페이지 새 창으로 열기',
} as const;

/* ------------------------------------------------------------------ */
/* Report                                                              */
/* ------------------------------------------------------------------ */

/** 신고 대상 종류 이름 (화면 표시) */
export const reportTargetKinds: Record<ReportTargetType, string> = {
  question: '질문',
  answer: '답변',
  post: '게시글',
  comment: '댓글',
};

export const reportPage = {
  back: (kind: string) => `${kind}(으)로 돌아가기`,
  crumb: '신고 접수',
  targetBadge: (kind: string) => `신고 대상 : ${kind}`,
  writtenAt: (date: string) => `작성일: ${date}`,
  reasonTitle: '신고 사유 선택',
  reasonHint: '위반 항목 중 가장 일치하는 사유 1개를 지정해 주세요',
  detailTitle: '상세 사유 서술',
  detailOptional: '(선택 입력)',
  detailMax: 1000,
  markdownSupport: '서식 편집 지원',
  detailPlaceholder:
    '관리자 및 모니터링 팀이 신속하게 파악할 수 있도록 구체적인 정황이나 문제 지점(타임스탬프, 특정 단어, 외부 링크 의도 등)을 적어주세요.',
  evidenceTitle: '증빙 자료 첨부 (스크린샷)',
  evidenceLink: '파일 선택',
  evidenceText: ' 버튼으로 화면 캡처 이미지를 올려 주세요',
  evidenceHint: 'PNG, JPG, WEBP 지원 (최대 10MB, 최대 3개)',
  noticeTitle: '검토 프로세스 및 조치 안내',
  noticePrefix: '신고는 ',
  noticeStrong1: '처리 대기 상태로 접수',
  noticeMiddle:
    '되며 글이 자동으로 숨겨지지 않습니다. 운영진이 확인한 뒤 숨김·제재 여부를 결정합니다. ',
  noticeStrong2: '고의적이거나 악의적인 허위 신고는 운영정책에 따라 활동 정지 페널티',
  noticeSuffix: '가 적용됩니다.',
  cancel: '취소',
  submit: '신고 접수하기',
  submitting: '접수 중...',
  detailRequired: '기타 사유는 상세 사유를 입력해 주세요.',
  removeFile: '첨부 삭제',
  loading: '신고 대상을 불러오는 중입니다…',
  notFound: '신고할 대상을 찾을 수 없습니다. 삭제되었거나 숨김 처리된 글입니다.',
} as const;

export const reportReasons: readonly ReportReason[] = [
  {
    value: 'spam',
    label: '스팸 / 홍보성 / 도배성 게시물',
    description: '상업적 광고, 외부 불법 도메인 유도, 동일 게시글 반복 등록',
  },
  {
    value: 'abuse',
    label: '욕설 / 비하 / 혐오 발언',
    description: '특정 이용자 공격, 패드립, 차별적 언행 및 불쾌한 언어 사용',
  },
  {
    value: 'illegal',
    label: '부적절한 콘텐츠 (치트/핵/불법)',
    description: '비인가 프로그램, 핵 배포, 계정 거래 및 악성코드 유포 시도',
  },
  {
    value: 'spoiler',
    label: '스포일러',
    description: '스토리 결말, 미공개 콘텐츠 등을 경고 없이 노출',
  },
  {
    value: 'misinformation',
    label: '주제 무관 / 허위·악의적 정보',
    description: '게임 공략을 고의로 왜곡하거나 커뮤니티 주제를 이탈한 분란 조장',
  },
  {
    value: 'privacy',
    label: '개인정보 노출 및 침해',
    description: '타인의 신상, 연락처, 실명, 결제 정보의 무단 게재',
  },
  {
    value: 'etc',
    label: '기타 사유',
    description: '하단 상세 사유 영역에 구체적인 위반 내용을 서술해 주세요',
  },
];

export const reportGuide = {
  title: '공정한 신고 문화 가이드',
  slaLabel: '평균 신고 처리 시간',
  slaValue: '1.8',
  slaUnit: '시간 내',
  liveLabel: '실시간 모니터링 가동',
  slaRate: 'SLA 99.4% 달성',
  steps: [
    { title: '접수 및 큐 등록', body: '제출된 신고는 실시간 보안 검토 대기열에 자동 인입됩니다.' },
    {
      title: '로그 분석 및 전수 심사',
      body: '작성 이력, 첨부 링크, 커뮤니티 이용 규정 위반 여부를 종합 대조합니다.',
    },
    {
      title: '조치 및 결과 피드백',
      body: '블라인드/삭제/경고 조치 후 신고자에게 개인 알림함으로 진행 결과를 발송합니다.',
    },
  ] as readonly GuideItem[],
  calloutTitle: '잠깐! 단순 의견 차이인가요?',
  calloutPrefix: '게임 빌드 해석의 차이나 단순 공략 오탈자는 신고 대상이 아닙니다. ',
  calloutStrong: "'답변' 또는 '댓글'",
  calloutSuffix: '을 통해 새로운 지식을 공유해 주시면 더 건강한 게임 지식 생태계가 만들어집니다.',
} as const;

export const moderationStats = {
  title: '금일 커뮤니티 필터 현황',
  date: '2026.11.10',
  rateLabel: '위반 게시물 처리율',
  rate: '94.2%',
  normalPercent: 78,
  blindPercent: 16.2,
  tiles: [
    { value: '14건', label: '블라인드 조치', danger: true },
    { value: '42건', label: '정상 확인/종결', danger: false },
  ],
} as const;

export const reportComplete = {
  title: '신고가 정상적으로 접수되었습니다',
  description: '커뮤니티의 건강한 게임 지식 생태계를 지키는 데 기여해 주셔서 감사합니다.',
  receiptLabel: '신고 접수 번호',
  copy: '복사',
  copied: '복사됨!',
  targetLabel: '대상 게시글',
  reasonLabel: '선택한 신고 사유',
  statusLabel: '처리 진행 상태',
  /** queuePosition: 처리 대기 신고 중 접수 순서 (API_SPEC 8장) */
  status: (queuePosition: number | null) =>
    queuePosition === null ? '처리 대기' : `처리 대기 (${queuePosition}번째)`,
  notices: [
    {
      icon: 'gavel',
      strong: '처리 방식:',
      text: '신고만으로 글이 자동 숨김되지 않습니다. 운영진이 확인한 뒤 숨김·제재 여부를 결정합니다.',
    },
    {
      icon: 'undo',
      strong: '접수 취소:',
      text: '잘못 신고했다면 접수 후 10초 안에 알림의 "접수 취소"로 취소할 수 있습니다.',
    },
  ],
  close: '닫기',
  toastTitle: '신고 접수 완료',
  toastTime: '방금 전',
  toastBody: (queuePosition: number | null) =>
    queuePosition === null ? ' · 처리 대기' : ` · 처리 대기 ${queuePosition}번째`,
  toastUndo: '접수 취소 (10초)',
  toastUndoAlert: '신고 접수가 취소되었습니다. 작성 중이던 양식으로 돌아갑니다.',
  toastClose: '닫기',
  toastDurationMs: 10000,
} as const;

export const loginRequired = {
  title: '로그인이 필요합니다',
  description: '작성, 추천, 신고는 회원만 이용할 수 있습니다. 로그인 페이지로 이동하시겠습니까?',
  cancel: '취소',
  confirm: '로그인하기',
} as const;

/* ------------------------------------------------------------------ */
/* Notices                                                             */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Edit history                                                        */
/* ------------------------------------------------------------------ */

export const editHistoryLabels = {
  title: '수정 이력',
  question: '질문',
  answer: '답변',
  noReason: '사유 없음',
  close: '닫기',
  openHint: '수정 이력 보기',
  loading: '불러오는 중…',
} as const;

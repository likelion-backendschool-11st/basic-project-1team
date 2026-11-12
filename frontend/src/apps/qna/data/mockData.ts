import type {
  Answer,
  Attachment,
  CommunityStat,
  GuideItem,
  MetaRow,
  NavItem,
  QuestionSummary,
  RelatedQuestion,
  Notice,
  ReportReason,
  SelectOption,
} from './types';

/* ------------------------------------------------------------------ */
/* Shell (header / footer)                                             */
/* ------------------------------------------------------------------ */

export const appShell = {
  brand: 'Gamers',
  logoSrc: '/logo.svg',
  logoAlt: 'Gamers Logo',
  searchPlaceholder: '기술 질문, 게임 태그, 로그 검색...',
  searchShortcut: '⌘K',
  notificationsLabel: 'Notifications',
  profileLabel: '프로필',
  loginLabel: '로그인',
  logoutLabel: '로그아웃',
  version: 'v2.4.0-stable',
  community: 'Gamers Pro Gaming Dev Community',
  footerLinks: ['이용약관', '개인정보처리방침', '커뮤니티 가이드'],
} as const;

export const navItems: readonly NavItem[] = [
  { label: '질문/답변', to: '/questions' },
  { label: '자유게시판', to: '/board' },
  { label: '공략/가이드', to: '/guides' },
  { label: '랭킹', to: '/rankings' },
  { label: '공지사항', to: '/notices' },
];

export const comingSoon = {
  title: '준비 중인 페이지입니다',
  description: '이 메뉴는 아직 Stitch 디자인이 없어 준비 중입니다. 질문/답변 게시판을 이용해 주세요.',
  cta: '질문/답변으로 이동',
} as const;

/* ------------------------------------------------------------------ */
/* Question list                                                       */
/* ------------------------------------------------------------------ */

export const questionListPage = {
  title: '질문/답변',
  liveBadge: '실시간 342명 활동중',
  description: '게임 공략, 버그 해결, 빌드 최적화 및 테크니컬 이슈를 나누는 프로 게이머 Q&A 포럼입니다.',
  newQuestion: '신규 질문 등록',
  searchPlaceholder: '질문 검색 또는 #태그 입력 (예: #마인크래프트, #엘든링)',
  filterLabel: '필터',
  resetLabel: '초기화',
  quickTagsLabel: '인기 게임 태그:',
  totalLabel: '총 148개의 질문 등록됨',
  totalPages: 15,
  visiblePages: 5,
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

export const quickTags: readonly string[] = [
  '전체',
  '마인크래프트',
  '엘든링',
  '발로란트',
  '스타듀밸리',
  '바람의나라',
  '헬게이트런던',
  '스팀',
];

export const questions: readonly QuestionSummary[] = [
  { id: 1, title: '마인크래프트 주민 거래가 갱신되지 않아요', tag: '마인크래프트', answers: 2, accepted: false, author: '호야', date: '2026.11.10', views: '238' },
  { id: 2, title: '엘든링 말레니아 2페이즈 팁 있나요?', tag: '엘든링', answers: 6, accepted: true, author: '히야', date: '2026.11.10', views: '231', badge: { label: '공략질문', tone: 'neutral' } },
  { id: 3, title: '스타듀밸리 과일나무가 자라지 않습니다', tag: '스타듀밸리', answers: 0, accepted: false, author: '후야', date: '2026.11.10', views: '43' },
  { id: 4, title: '발로란트 감도 추천 부탁드립니다', tag: '발로란트', answers: 3, accepted: false, author: '하이', date: '2026.11.10', views: '15' },
  { id: 5, title: '제발 이것 좀 알려주세요 ㅠ (바람의나라 사냥터)', tag: '바람의나라', answers: 22, accepted: true, author: '해야', date: '2026.11.10', views: '246' },
  { id: 6, title: '이 게임 아시는 분 계실까요... 고전 패키지 알피지', tag: '헬게이트런던', answers: 123, accepted: false, author: '해야', date: '2026.11.10', views: '2,334', badge: { label: 'HOT', tone: 'hot' } },
  { id: 7, title: '마인크래프트 주민 거래가 갱신되지 않아요 (철곡괭이)', tag: '마인크래프트', answers: 4, accepted: false, author: '효아', date: '2026.11.10', views: '115' },
  { id: 8, title: '마인크래프트 네더 차원문 생성 버그 질문', tag: '마인크래프트', answers: 2, accepted: false, author: '휴아', date: '2026.11.10', views: '46' },
  { id: 9, title: '스팀 동기화 오류 클라우드 세이브 복구 방법', tag: '스팀', answers: 7, accepted: false, author: '헤야', date: '2026.11.10', views: '23', badge: { label: '기술이슈', tone: 'neutral' } },
  { id: 10, title: '마인크래프트 베드락 에디션 멀티플레이 접속 불가', tag: '마인크래프트', answers: 2, accepted: false, author: '혀아', date: '2026.11.10', views: '3' },
];

export const communityStats: readonly CommunityStat[] = [
  { label: '오늘 채택 완료된 솔루션', value: '42건', valueTone: 'secondary', note: '해결률 88.4%', noteTone: 'subtle' },
  { label: '평균 최초 답변 시간', value: '14분', valueTone: 'ink', note: '전주 대비 2분 단축', noteTone: 'secondary' },
  { label: '트렌딩 태그', value: '#엘든링', valueTone: 'primary', note: '질문 18개 진행중', noteTone: 'subtle' },
  { label: '현재 미답변 질문', value: '9개', valueTone: 'tertiary', note: '답변 작성하러 가기 →', noteTone: 'link' },
];

/* ------------------------------------------------------------------ */
/* Question detail (QNA #4029)                                         */
/* ------------------------------------------------------------------ */

export const questionDetail = {
  id: 1,
  code: 'QNA #4029',
  status: '해결됨',
  version: 'Java Edition 1.20.4',
  title: '마인크래프트 주민 거래가 갱신되지 않아요',
  author: { name: '호야', initial: '호' },
  postedAt: '2026.11.10 14:22',
  /** 마지막 수정 시각. 수정한 적이 없으면 null (API 의 editedAt) */
  editedAt: '2026.11.11 10:05' as string | null,
  views: '238',
  body: [
    '마인크래프트 자바 에디션 1.20.4 버전 싱글 플레이 중입니다.\n독서대를 배치해서 사서 주민(Librarian)을 만들고 1단계에서 수선(Mending) 인챈트북을 띄웠습니다.',
    '그런데 에메랄드로 수선 책을 3번 연속으로 구매하여 거래가 잠겼는데, 게임 내 시간으로 3일이 지나도 거래가 전혀 갱신(리셋)되지 않습니다.',
  ],
  checklistTitle: '시도해본 내용 및 현상:',
  checklist: [
    '1. 작업대(독서대) 바로 앞에 주민이 접근 가능한지 확인 (동선에 침대와 독서대 모두 배치됨)',
    '2. 낮 시간(작업 시간 09:00 ~ 15:00, Ticks 2000~9000) 동안 관찰했으나 작업 모션을 취하지 않음',
    '3. 근처에 다른 주민 2명(농부, 대장장이)이 있는데 이들은 정상적으로 일 2회 거래가 갱신됨',
  ],
  closing: '혹시 주민이 독서대 소유권을 잃어버렸거나 좀비 습격 등으로 인공지능이 꼬인 걸까요? 해결 방법 아시는 분 답변 부탁드립니다!',
  tags: ['마인크래프트', '주민거래', '버그_이슈', '자바에디션'],
  votes: 12,
  answerCount: 2,
} as const;

export const questionDetailLabels = {
  home: '홈',
  board: '질문/답변',
  edit: '질문 수정',
  remove: '질문 삭제',
  removeBlocked: '답변이 등록된 질문은 삭제할 수 없습니다.',
  removeBlockedAlert: '답변이 1개 이상 등록된 질문은 커뮤니티 데이터 보존을 위해 직접 삭제할 수 없습니다. 관리자 문의를 이용해 주세요.',
  report: '신고',
  reportQuestion: '질문 신고',
  reportAnswer: '답변 신고',
  vote: '추천',
  answers: '답변',
  share: 'URL 링크 공유',
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
} as const;

export const answers: readonly Answer[] = [
  {
    id: '8941',
    accepted: true,
    answeredAt: '2026.11.12 23:23:23',
    editedAt: '2026.11.13 09:10',
    intro: '주민이 거래를 갱신하려면 두 가지 조건이 반드시 충족되어야 합니다:',
    points: [
      {
        heading: '1. 자신이 지정된 정확한 작업대(독서대)에 물리적으로 닿을 수 있어야 합니다.',
        body: '주민 발 밑 또는 바로 옆 1블록 거리여야 합니다. 반블록 위에 올려두었거나 울타리 뒤에 있으면 시각적으로 보여도 AI가 작업을 수행하지 못합니다.',
      },
      {
        heading: '2. 침대가 유효하게 연결되어 있고 작업 시간(Ticks 2000~9000)에 작업대에 도달해야 합니다.',
        body: '주민이 잠을 자지 못해도 거래는 갱신되지만, 작업대에 접근할 수 없는 상태라면 영구적으로 잠김 상태가 유지됩니다.',
      },
    ],
    paragraphs: [
      { kind: 'text', text: '작성자님의 증상으로 볼 때 독서대 위치가 주민 머리 위나 반블록 등으로 막혔거나, 다른 사서 주민이 해당 독서대를 먼저 소유권으로 선점했을 가능성이 가장 높습니다.' },
    ],
    tip: '독서대를 도끼로 부순 뒤 주민이 서 있는 발 바로 앞 정면에 다시 설치해 보세요. 만약 초록색 반짝이 입자가 안 뜨면 근처 다른 주민들을 잠시 격리해야 합니다.',
    author: { name: '흐야', initial: '흐', level: 'Lv.42', title: '마스터 빌더 • 채택률 94%' },
    votes: 22,
    canEdit: true,
    canAccept: false,
  },
  {
    id: '8957',
    accepted: false,
    answeredAt: '2026.11.12 18:05',
    paragraphs: [
      { kind: 'text', text: '혹시 마을 판정 범위 내에 침대 개수가 주민 수보다 부족하지 않은가요? 자바 에디션에서는 주민 수보다 침대가 부족하거나 리더 주민이 침대를 잃어버리면 직업 블록 재인증 루프가 꼬여서 리셋이 안 되는 버그가 종종 있습니다.' },
      { kind: 'muted', text: '주민 방 주변의 침대와 독서대를 모두 철거했다가 밤에 침대부터 먼저 깔아주고, 주민이 침대에 초록 입자를 띄우면 그 다음에 독서대를 재배치해보세요.' },
    ],
    author: { name: '기열', initial: '기', level: 'Lv.18', title: '모험가' },
    votes: 2,
    canEdit: false,
    canAccept: false,
  },
];

export const answerComposer = {
  title: '새 답변 작성',
  markdownHint: 'Markdown 지원됨',
  placeholder: '문제 해결에 도움이 되는 명확하고 구체적인 답변을 작성해 주세요. (타인을 비방하거나 주제와 무관한 내용은 제재될 수 있습니다.)',
  attachHint: '스크린샷 또는 로그 파일 드래그 & 드롭',
  draft: '임시저장',
  draftSaved: '저장됨',
  submit: '답변 등록',
} as const;

export const questionMeta = {
  title: '질문 메타 정보',
  rows: [
    { label: '질문 상태', value: '채택 완료', tone: 'success-badge' },
    { label: '클라이언트 버전', value: 'v1.20.4', tone: 'code' },
    { label: '조회수', value: '238 회', tone: 'code' },
    { label: '커뮤니티 추천', value: '+12', tone: 'primary' },
  ] as readonly MetaRow[],
} as const;

export const questionAuthor = {
  name: '호야',
  initial: '호',
  joined: '가입일: 2026.04.12 • 질문 8개',
  bio: '마인크래프트 레드스톤 및 자동화 팜 설계 중심 플레이어입니다.',
  acceptRateLabel: '채택률',
  acceptRate: '87.5%',
  bonusLabel: '답변 채택 보너스',
  bonus: '+50 EXP',
} as const;

export const relatedQuestions = {
  title: '관련된 유사 질문',
  items: [
    { id: 4018, title: '1.20.2 사서 주민 수선 인챈트 거래 풀 잠금 해제 시간', status: '채택 완료 (답변 4)', solved: true, ago: '2주 전' },
    { id: 3991, title: '주민 번식기에서 아이들이 직업을 갖지 않고 방황합니다', status: '답변 1', solved: false, ago: '1달 전' },
    { id: 3870, title: '철골렘 스폰 조건과 주민 침대 링크 범위 총정리', status: '채택 완료 (답변 9)', solved: true, ago: '2달 전' },
  ] as readonly RelatedQuestion[],
} as const;

/* ------------------------------------------------------------------ */
/* Shared editor content                                               */
/* ------------------------------------------------------------------ */

export const editorTemplates = {
  bug: `[발생 환경]
- OS: Windows 11 / Mac OS
- 게임 및 빌드 번호:
- 설치된 모드/런처:

[오류 증상 및 재현 경로]
1. 게임 실행 후 ...
2. 특정 상황에서 크래시 발생 또는 UI 멈춤 현상 발생.

[시도한 해결 방법]
- 그래픽 드라이버 재설치 완료
- 무결성 검사 진행`,
  spec: `[PC 사양 명세]
- CPU: AMD Ryzen 7 7800X3D
- GPU: NVIDIA RTX 4070 Ti (드라이버 551.86)
- RAM: 32GB DDR5
- 해상도: QHD (2560x1440) 165Hz

[이슈 현상]
- 특정 컷신 또는 대규모 교전 시 1% Low FPS가 20대로 급격히 하락

[옵션 세팅]
- 레이트레이싱: 끔
- DLSS 모드: 품질`,
  steps: `

### 🛠️ 단계별 해결 절차
1. [단계 1]
2. [단계 2]
3. [단계 3] 검증 및 인게임 확인
`,
  console: `

minecraft
# 주민 디버그 및 강제 리프레시 명령어
/data get entity @e[type=villager,limit=1,sort=nearest] Brain.memories

`,
} as const;

/** mock: 관리자가 삭제(차단)한 태그. 서버는 400 TAG_BLOCKED 로 거절한다 (API_SPEC 5.1) */
export const blockedTagNames: readonly string[] = ['사설서버'];

export const editorMessages = {
  templateAppendConfirm: '기존 작성된 내용 뒤에 템플릿을 추가하시겠습니까?',
  maxTags: '태그는 최대 5개까지만 등록 가능합니다.',
  blockedTag: (tag: string) => `'${tag}'은(는) 운영 정책상 사용할 수 없는 태그입니다.`,
  leaveConfirm: '작성 중인 내용이 저장되지 않을 수 있습니다. 나가시겠습니까?',
  titleRequired: '질문 제목을 입력해주세요.',
  bodyTooShort: '증상과 시도한 내용을 15자 이상 구체적으로 작성해주세요.',
} as const;

/* ------------------------------------------------------------------ */
/* New question                                                        */
/* ------------------------------------------------------------------ */

export const newQuestionPage = {
  breadcrumbCurrent: '신규 질문 작성',
  autosaveInitial: '마지막 자동 저장: 방금 전',
  autosaveDone: '임시저장 완료',
  title: '신규 질문 작성',
  description: '게임 공략, 버그 트러블슈팅, 빌드 최적화 등 테크니컬한 이슈를 커뮤니티 전문가들에게 질문해보세요.',
  titleLabel: '질문 제목',
  titleMax: 100,
  titlePlaceholder: '예: [1.20.4] 주민 직업 블록 거래 갱신 불가 현상 및 NBT 충돌 해결 문의',
  titleHelpPrefix: '구체적인 오류 증상과 버전 정보를 제목에 명시하세요. 게임 종류 및 세부 분류는 하단의 ',
  titleHelpStrong: '[3. 태그 검색 및 선택]',
  titleHelpSuffix: '에서 지정할 수 있습니다.',
  bodyLabel: '본문 작성',
  bodyModeBadge: 'Markdown & WYSIWYG',
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
  dropTitle: '스크린샷 (PNG, JPG) 및 crash-report.log 파일 드래그',
  dropHint: '클립보드 스크린샷 붙여넣기(Ctrl+V) 지원 • 개별 파일 최대 20MB',
  dropButton: '파일 선택',
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
  submitDone: '질문이 성공적으로 등록되었습니다. 커뮤니티 답변 알림을 활성화합니다.',
  initialTags: ['마인크래프트', '주민거래', '1-20-4'],
  recommendedTags: ['fabric', 'forge', '크래시_오류', '스팀_클라우드', '프레임_드랍'],
  initialAttachments: [
    { id: 'a1', name: 'error-screen-2024.png', size: '1.4 MB', kind: 'image' },
    { id: 'a2', name: 'latest.log', size: '48 KB', kind: 'log' },
  ] as readonly Attachment[],
} as const;

export const writingGuide = {
  title: '좋은 질문 작성 가이드',
  items: [
    { title: '게임명과 버전을 제목에 명시', body: '버전에 따라 버그 원인과 공략 솔루션이 완전히 달라집니다.' },
    { title: '직접 시도해본 과정 기록', body: '중복된 해결책 답변을 방지하고 정확한 원인을 분석할 수 있습니다.' },
    { title: '크래시 로그 또는 스크린샷 동봉', body: '스택 트레이스(Stacktrace) 코드는 기술 답변자에게 가장 중요한 단서입니다.' },
  ] as readonly GuideItem[],
  highlightTitle: '평균 15분 이내 첫 답변 도착',
  highlightBody: '자세한 정보를 포함할수록 Obsidian Nexus 상위 티어 게이머의 채택형 답변률이 84% 증가합니다.',
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
  editingBadge: 'EDITING MODE: ID #4802',
  title: '질문 수정',
  description: '등록된 질문의 제목, 본문 내용 및 태그를 수정할 수 있습니다. 이미 답변이 작성된 경우 채택 전까지 자유로운 보완 및 로그 추가가 가능합니다.',
  noticeStrong: '수정 반영 안내:',
  noticePrefix: ' 저장 시 기존 답변을 작성한 ',
  noticeContributors: '2명의 기여자',
  noticeMiddle: '에게 알림이 전송되며, 질문 헤더에 ',
  noticeEdited: '‘수정됨(Edited)’',
  noticeSuffix: ' 이력이 기록됩니다.',
  noticeLink: '수정 가이드',
  titleLabel: '질문 제목',
  titlePlaceholder: '상대방이 질문을 파악할 수 있도록 핵심 현상과 환경을 명확히 요약해주세요',
  initialTitle: '마인크래프트 주민 거래가 갱신되지 않아요',
  writeTab: '작성 (Markdown)',
  previewTab: '실시간 미리보기',
  templateLabel: '양식 불러오기:',
  bugTemplate: '버그 리포트 양식',
  specTemplate: '사양/환경 양식',
  bodyPlaceholder: '문제가 발생한 경위, 시도한 해결 방법, 에러 로그를 구체적으로 작성해 주세요.',
  initialBody: `마인크래프트 자바 에디션 1.20.4 버전 싱글 플레이 중입니다.
독서대를 배치해서 사서 주민(Librarian)을 만들고 1단계에서 수선(Mending) 인챈트북을 띄웠습니다.

그런데 에메랄드로 수선 책을 3번 연속으로 구매하여 거래가 잠겼는데, 게임 내 시간으로 3일이 지나도 전혀 갱신(리셋)되지 않습니다.

시도해본 내용 및 현상:
1. 작업대(독서대) 바로 앞에 주민이 접근 가능한지 확인 (동선에 침대와 독서대 모두 배치됨)
2. 낮 시간(작업 시간 09:00 ~ 15:00, Ticks 2000~9000) 동안 관찰했으나 작업 모션을 취하지 않음
3. 근처에 다른 주민 2명(농부, 대장장이)이 있는데 이들은 정상적으로 일 2회 거래가 갱신됨

혹시 주민이 독서대 소유권을 잃어버렸거나 좀비 습격 등으로 인공지능이 꼬인 걸까요? 해결 방법 아시는 분 답변 부탁드립니다!`,
  attachmentsTitle: '첨부된 파일 및 로그 (2개)',
  attachmentsLimit: '최대 20MB 지원 (JPG, PNG, GIF, LOG, TXT)',
  attachments: [
    { id: 'e1', name: 'error-screen-2024.png', size: '1.4 MB', kind: 'image', note: '이미지 첨부 완료' },
    { id: 'e2', name: 'latest.log', size: '48 KB', kind: 'log', note: 'Crash/Debug 로그' },
  ] as readonly Attachment[],
  dropHint: '추가 파일 드래그 & 드롭 또는 클립보드 스크린샷 붙여넣기(Ctrl+V)',
  tagTitle: '태그 관리 (최대 5개)',
  tagCountSuffix: '등록됨',
  tagHelpPrefix: '본 질문은 카테고리 대신 오직 ',
  tagHelpStrong: '태그',
  tagHelpSuffix: '로만 검색 및 관련 커뮤니티 섹션에 자동 분류됩니다. 관련 게임명, 에디션, 버전, 이슈를 포함해주세요.',
  tagPlaceholder: '추가 태그 입력 후 Enter...',
  tagRecommendLabel: '추천 빠른 추가:',
  initialTags: ['마인크래프트', '주민거래', '버그_이슈', '자바에디션'],
  recommendedTags: ['1-20-4', '패브릭', '싱글플레이', '바닐라'],
  reasonLabel: '수정 사유',
  reasonOptional: '(선택 사항)',
  reasonHint: '답변자 및 검토자에게 노출됩니다',
  reasonPlaceholder: '예: 오타 수정, OS/자바 버전 상세 명시, 크래시 스크린샷 보완',
  initialReason: '주민 작업 시간대 상세 Ticks 관찰 기록 및 latest.log 디버그 파일 추가',
  back: '수정 취소하고 상세로 돌아가기',
  preview: '미리보기',
  submit: '질문 수정 완료',
  submitting: '수정 내역 반영 중...',
  submitDone: '질문 수정이 성공적으로 반영되었습니다. 상세 화면으로 이동합니다.',
} as const;

export const editQuestionStatus = {
  title: '현재 질문 현황',
  badge: '답변 접수중',
  tiles: [
    { label: '등록된 답변', value: '2', suffix: '개 (미채택)', variant: 'headline' },
    { label: '추천 수', value: '+12', suffix: 'Upvotes', variant: 'headline-primary' },
    { label: '누적 조회수', value: '238 회', variant: 'body' },
    { label: '최초 등록', value: '2026.11.10', variant: 'code' },
  ],
  ownerLabel: '작성자 본인 확인됨',
  ownerHandle: 'CraftMaster#992',
} as const;

export const editCautions = {
  title: '질문 수정 시 주의사항',
  items: [
    { title: '기존 답변과의 일관성 유지', body: '이미 2개의 답변이 달렸으므로 질문의 핵심 문제를 완전히 다른 게임이나 현상으로 바꾸는 수정은 커뮤니티 정책상 제한됩니다.', tone: 'primary' },
    { title: '수정 이력 관리', body: '본문 수정 시 게시물 상단에 최종 수정 일시와 함께 ‘수정됨’ 뱃지가 붙으며, 수정 전 내역은 히스토리 로그에 보존됩니다.', tone: 'tertiary' },
    { title: '태그 변경의 영향력', body: '본 플랫폼은 카테고리 없이 태그 단위 인덱싱을 지원하므로, 잘못된 태그 삭제 및 정확한 태그 추가 시 검색 노출도가 최적화됩니다.', tone: 'secondary' },
  ],
} as const;

export const originalPreview = {
  label: '원본 게시글 미리보기',
  open: '새 창으로 열기',
  title: '마인크래프트 주민 거래가 갱신되지 않아요',
  excerpt: '마인크래프트 자바 에디션 1.20.4 버전 싱글 플레이 중입니다. 독서대를 배치해서 사서 주민(Librarian)을 만들고...',
  meta: ['답변 2개 대기중', '최종 수정 전'],
} as const;

/* ------------------------------------------------------------------ */
/* Edit answer                                                         */
/* ------------------------------------------------------------------ */

export const editAnswerPage = {
  breadcrumbCurrent: '답변 수정 (#ANS-8941)',
  title: '답변 수정',
  code: '#ANS-8941',
  description: '등록된 답변의 설명, 테크니컬 가이드, 증빙 스크린샷 및 로그를 수정합니다.',
  acceptedNote: '채택된 솔루션 — 수정 내역은 타임라인에 영구 보존됩니다',
  bannerTitle: '채택 완료된 솔루션 안내',
  bannerBadge: 'ACCEPTED SOLUTION',
  bannerPrefix: '본 답변은 질문자에 의해 정답으로 공식 채택되었습니다. 본문 수정 시 질문자 및 추천 참여자들에게 변경 알림이 발송되며, 답변 상단에 ',
  bannerCode: '수정됨 (Edited)',
  bannerSuffix: ' 배지와 함께 변경 내역 버전 로그가 생성됩니다.',
  target: {
    label: '수정 대상 질문 (Original Thread)',
    qid: 'Q-ID #84092',
    collapse: '질문 요약 접기',
    expand: '질문 요약 펼치기',
    title: '마인크래프트 주민 거래가 갱신되지 않아요',
    tags: ['마인크래프트', '주민거래', '버그_이슈', '자바에디션'],
    summary: '"마인크래프트 자바 에디션 1.20.4 싱글 플레이 중 독서대를 배치해 사서 주민을 만들고 수선 인챈트북을 띄웠으나, 3번 거래 후 3일이 지나도 거래가 갱신되지 않는 현상이 발생하고 있습니다. 침대와 독서대 모두 배치해두었고 좀비 공격도 없는데 무엇이 문제일까요?"',
    authorInitial: 'H',
    author: '호야',
    authorLevel: '(Lv.18)',
    postedAt: '2026.11.10 등록',
    views: '조회 1,248',
    openOriginal: '새 창으로 원본 질문 전체보기',
  },
  editorTitle: '답변 내용 편집',
  writeTab: '작성 (Markdown)',
  previewTab: '실시간 미리보기',
  stepsTemplate: '단계별 해결법 서식',
  consoleTemplate: '콘솔/명령어 가이드 서식',
  bodyPlaceholder: '답변 내용을 마크다운으로 상세하게 수정해 주세요...',
  initialBody: `주민이 거래를 갱신하려면 두 가지 조건이 반드시 충족되어야 합니다:

1. 자신이 지정된 정확한 작업대(독서대)에 물리적으로 닿을 수 있어야 합니다.
주민 발 밑 또는 바로 옆 1블록 거리여야 합니다. 반블록 위에 올려두었거나 울타리 뒤에 있으면 시각적으로 보여도 AI가 작업을 수행하지 못합니다.

2. 침대가 유효하게 연결되어 있고 작업 시간(Ticked 2000~9000)에 작업대에 도달해야 합니다.
주민이 잠을 자지 못해도 거래는 갱신되지만, 작업대에 접근할 수 없는 상태라면 영구적으로 잠김 상태가 유지됩니다.

작성자님의 증상으로 볼 때 독서대 위치가 주민 머리 위나 반블록 등으로 막혔거나, 다른 사서 주민이 해당 독서대를 먼저 소유권으로 선점했을 가능성이 가장 높습니다.

💡 해결 팁: 독서대를 도끼로 부순 뒤 주민이 서 있는 발 바로 앞 정면에 다시 설치해 보세요. 만약 초록색 반짝이 입자가 안 뜨면 근처 다른 주민들을 잠시 격리해야 합니다.`,
  maxLength: 5000,
  markdownSupport: 'Markdown 지원',
  shortcuts: '단축키: Ctrl+S (임시저장), Ctrl+Enter (수정완료)',
  attachmentsTitle: '첨부 파일 및 스크린샷 로그 관리',
  attachmentsCount: '2개 첨부됨',
  attachmentsLimit: '최대 20MB (PNG, JPG, GIF, LOG, TXT)',
  attachments: [
    { id: 'r1', name: 'solution-diagram.png', size: '1.2 MB', kind: 'image', note: '이미지 첨부' },
    { id: 'r2', name: 'command-fix.log', size: '18 KB', kind: 'log', note: '서버 디버그 로그' },
  ] as readonly Attachment[],
  dropTitle: '추가 스크린샷 이미지 또는 로그 파일 첨부',
  dropHintPrefix: '파일을 여기로 드래그하거나 ',
  dropHintLink: '내 PC에서 탐색',
  reasonLabel: '수정 사유 입력',
  reasonOptional: '(선택 사항)',
  reasonVersion: '버전 v1.1 생성 예정',
  reasonPlaceholder: '어떤 부분이 보완되었는지 간략히 남겨주세요 (예: 오탈자 수정, 명령어 경로 변경 등)',
  initialReason: '주민 인식 버그 관련 독서대 재설치 팁 및 초록색 입자 확인 방법 보강',
  reasonHint: '수정 사유는 수정 내역 히스토리에 공개되어 다른 게이머들의 이해를 돕습니다.',
  back: '수정 취소하고 상세로 돌아가기',
  preview: '미리보기 확인',
  submit: '답변 수정 완료',
  submitting: '저장 중...',
  submitDone: '답변 수정이 성공적으로 반영되었습니다. 질문 상세 화면으로 이동합니다.',
} as const;

export const myAnswerStatus = {
  title: '내 답변 현황 & 보상',
  badge: '채택 완료됨',
  votesLabel: '받은 추천 수',
  votes: '+22',
  expLabel: '획득한 경험치',
  exp: '+100 EXP',
  author: { name: '흐야', level: 'Lv.42', summary: '솔루션 채택률 94% • 마스터 빌더' },
  createdLabel: '최초 작성:',
  createdAt: '2026.11.12 23:23',
  historyLabel: '최종 수정 이력:',
  history: '수정 내역 없음 (초기본)',
} as const;

export const answerCautions = {
  title: '답변 수정 시 주의사항',
  items: [
    { title: '채택 솔루션의 신뢰성 유지', body: '이미 질문자가 효과를 검증한 해결책이므로, 기존과 상반되는 해결법으로 완전히 변조하지 마세요.' },
    { title: '수정 이력 투명 공개', body: "모든 변경 사항은 버전별 Diff 형태로 기록되며, 누구나 '수정 내역' 버튼을 눌러 비교할 수 있습니다." },
    { title: '추가 피드백 반영 시 팁', body: "질문자의 댓글 질문이 있었다면 본문 하단에 '💡 추가 업데이트' 항목을 만들어 기술하는 것을 권장합니다." },
  ] as readonly GuideItem[],
} as const;

export const originalQuestionLink = {
  label: '원본 질문 링크',
  title: '마인크래프트 주민 거래가 갱신되지 않아요',
  author: '작성자: 호야 (Lv.18)',
  answers: '답변 2개 등록됨',
  open: '질문 본문 페이지 새 창으로 열기',
} as const;

/* ------------------------------------------------------------------ */
/* Report                                                              */
/* ------------------------------------------------------------------ */

export const reportPage = {
  back: '질문으로 돌아가기',
  targetCode: 'Q-84092',
  crumb: '신고 접수',
  targetBadge: '신고 대상 : 질문 (Question)',
  targetId: 'ID #Q-84092',
  targetDate: '작성일: 2026.11.10 14:28',
  targetTitle: '마인크래프트 주민 거래가 갱신되지 않아요 (직업대 리셋 불가 현상)',
  targetTags: ['마인크래프트', '주민거래', '버그_이슈', '자바에디션'],
  targetExcerpt: '"1.20.4 버전에서 독서대를 여러 번 부수고 다시 설치해도 사서 주민의 거래 목록에 수선(Mending) 마법부여 책이 안 뜹니다. 이미 다른 플레이어와 1회 거래를 한 것도 아닌데 완전히 잠겨 있는 것처럼 작동하지 않는데..."',
  targetAuthor: { initial: '호', name: '호야', title: 'Lv.18 초보 광부' },
  targetStats: { votes: '+3', views: '142', answers: '답변 2' },
  reasonTitle: '신고 사유 선택',
  reasonHint: '위반 항목 중 가장 일치하는 사유 1개를 지정해 주세요',
  detailTitle: '상세 사유 서술',
  detailOptional: '(선택 입력)',
  detailMax: 1000,
  markdownSupport: 'Markdown 지원',
  detailPlaceholder: '관리자 및 모니터링 팀이 신속하게 파악할 수 있도록 구체적인 정황이나 문제 지점(타임스탬프, 특정 단어, 외부 링크 의도 등)을 적어주세요.',
  evidenceTitle: '증빙 자료 첨부 (스크린샷)',
  evidenceLink: '파일 선택',
  evidenceText: ' 또는 화면 캡처 이미지를 여기에 끌어다 놓으세요',
  evidenceHint: 'PNG, JPG, WEBP 지원 (최대 10MB, 최대 3개)',
  noticeTitle: '검토 프로세스 및 조치 안내',
  noticePrefix: '신고 접수 시 해당 질문은 자동화 필터 정책 및 관리자 검토를 위해 ',
  noticeStrong1: '검토 대기 큐로 즉각 이동',
  noticeMiddle: '되며, 긴급성 사유(핵/피싱/음란)의 경우 전수 확인 전까지 임시 숨김 처리될 수 있습니다. ',
  noticeStrong2: '고의적이거나 악의적인 허위 신고는 운영정책에 따라 활동 정지 페널티',
  noticeSuffix: '가 적용됩니다.',
  cancel: '취소',
  submit: '신고 접수하기',
} as const;

export const reportReasons: readonly ReportReason[] = [
  { value: 'spam', label: '스팸 / 홍보성 / 도배성 게시물', description: '상업적 광고, 외부 불법 도메인 유도, 동일 게시글 반복 등록' },
  { value: 'abuse', label: '욕설 / 비하 / 혐오 발언', description: '특정 이용자 공격, 패드립, 차별적 언행 및 불쾌한 언어 사용' },
  { value: 'illegal', label: '부적절한 콘텐츠 (치트/핵/불법)', description: '비인가 프로그램, 핵 배포, 계정 거래 및 악성코드 유포 시도' },
  { value: 'spoiler', label: '스포일러', description: '스토리 결말, 미공개 콘텐츠 등을 경고 없이 노출' },
  { value: 'misinformation', label: '주제 무관 / 허위·악의적 정보', description: '게임 공략을 고의로 왜곡하거나 커뮤니티 주제를 이탈한 분란 조장' },
  { value: 'privacy', label: '개인정보 노출 및 침해', description: '타인의 신상, 연락처, 실명, 결제 정보의 무단 게재' },
  { value: 'etc', label: '기타 사유', description: '하단 상세 사유 영역에 구체적인 위반 내용을 서술해 주세요' },
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
    { title: '로그 분석 및 전수 심사', body: '작성 이력, 첨부 링크, 커뮤니티 이용 규정 위반 여부를 종합 대조합니다.' },
    { title: '조치 및 결과 피드백', body: '블라인드/삭제/경고 조치 후 신고자에게 개인 알림함으로 진행 결과를 발송합니다.' },
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
  receipt: '#REP-20261110-84092',
  receiptCopyValue: 'REP-20261110-84092',
  copy: '복사',
  copied: '복사됨!',
  targetLabel: '대상 게시글',
  targetKind: '[질문]',
  targetTitle: '마인크래프트 주민 거래가 갱신되지 않아요',
  targetTags: ['마인크래프트', '주민거래', '버그_이슈'],
  reasonLabel: '선택한 신고 사유',
  statusLabel: '처리 진행 상태',
  status: '실시간 검토 큐 등록됨 (3번째)',
  notices: [
    { icon: 'schedule', strong: '예상 처리 시간:', text: '실시간 운영진 및 자동 모더레이션 알고리즘에 의해 평균 1.8시간 이내 처리가 완료됩니다.' },
    { icon: 'visibility_off', strong: '자동 숨김:', text: '같은 글에 신고가 10건 쌓이면 운영진 검토 전까지 자동으로 숨김 처리됩니다.' },
    { icon: 'notifications_active', strong: '결과 피드백:', text: '제재 조치(블라인드, 작성자 경고) 결과는 상단 알림 센터와 인증된 계정 이메일로 전송됩니다.' },
  ],
  history: '내 신고 내역 및 현황 보기',
  historyAlert: '내 신고 내역 및 실시간 심사 상태 페이지로 연결됩니다.',
  confirm: '질문 목록으로 이동',
  close: '닫기',
  toastTitle: '신고 접수 큐 등록 완료',
  toastTime: '방금 전',
  toastCode: '#REP-84092',
  toastBody: ' · 우선 검토 큐 3순위 등록됨',
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

export const noticeLabels = {
  tickerLabel: '공지',
  tickerAll: '전체 보기',
  listTitle: '공지사항',
  listDescription: 'GAMERS 운영진이 전하는 서비스 이용 안내와 점검 소식입니다.',
  pinned: '고정',
  columns: { title: '제목', author: '작성자', createdAt: '작성일' },
  empty: '등록된 공지사항이 없습니다.',
  notFound: '존재하지 않거나 삭제된 공지사항입니다.',
  backToList: '목록으로',
} as const;

/** mock: GET /api/notices (고정 공지 먼저, 그다음 최신순) + GET /api/notices/:noticeId */
export const notices: readonly Notice[] = [
  {
    id: 5,
    title: '게임 Q&A 게시판 이용 규칙 안내',
    body: '건전하고 유익한 게임 Q&A 커뮤니티 조성을 위한 기본 이용 규칙입니다.\n1. 타인을 비방하거나 욕설, 혐오 표현이 포함된 질문 및 답변은 제재 대상입니다.\n2. 스포일러성 내용은 반드시 스포일러 태그 또는 숨김 처리를 적용해 주세요.\n3. 광고, 불법 프로그램 공유 적발 시 계정이 영구 정지될 수 있습니다.',
    isPinned: true,
    author: '운영자01',
    createdAt: '2026.11.11',
  },
  { id: 4, title: '스포일러 태그 사용 안내', body: '신작 및 DLC 관련 게시물에는 스포일러 태그를 반드시 붙여 주세요.', isPinned: true, author: '운영자01', createdAt: '2026.11.13' },
  { id: 3, title: '태그 작성 가이드', body: '태그는 1~30자의 한글, 영문, 숫자, _, - 로 작성해 주세요. 공백은 쓸 수 없습니다.\n예: 마인크래프트, monster-hunter, 1-20-4', isPinned: false, author: '운영자01', createdAt: '2026.11.08' },
  { id: 2, title: '신고 기능 안내 및 처리 기준', body: '신고는 접수 후 24시간 이내에 검토되며, 처리 결과는 알림으로 안내됩니다.', isPinned: false, author: '운영자01', createdAt: '2026.11.05' },
  { id: 1, title: '11월 정기 점검 안내', body: '11월 20일 02:00 ~ 06:00 정기 점검이 진행됩니다.', isPinned: false, author: '운영자01', createdAt: '2026.11.01' },
];

import { mockUserIds } from '../../../shared/mockUsers';
// All static copy, image URLs and mock records extracted from the Stitch project
// "GAMERS QnA Platform" (projectId 13360889805538942705).

export const ROUTES = {
  login: '/login',
  signup: '/signup',
  findId: '/find-id',
  findPassword: '/find-password',
  changePassword: '/change-password',
  mypage: '/mypage',
  mypageEdit: '/mypage/edit',
  userProfile: '/users/:userId',
  withdraw: '/withdraw',
} as const;

export type Tone = 'success' | 'danger' | 'warning' | 'tertiary' | 'primary' | 'neutral';

/* ---------------------------------------------------------------- Mock DB */

export interface MockAccount {
  readonly name: string;
  readonly username: string;
  readonly email: string;
  readonly password: string;
}

export const mockAccounts: readonly MockAccount[] = [
  {
    name: '김게이머',
    username: 'gamer_legend',
    email: 'legend@gamers.com',
    password: 'gamer!2580',
  },
];

export const takenUsernames: readonly string[] = ['admin', 'test', 'gamer', 'gamer_legend'];
export const takenNicknames: readonly string[] = ['운영자', '관리자', '레전드게이머'];
export const takenEmails: readonly string[] = [
  'admin@gamers.com',
  'test@gamers.com',
  'legend@gamers.com',
];

/* ------------------------------------------------------------------ Common */

export const brand = {
  name: 'Gamers',
  monogram: 'G',
};

export const common = {
  required: '*',
  togglePasswordLabel: '비밀번호 표시/숨기기',
  dismissLabel: '닫기',
  cancel: '취소',
  passwordMismatch: '※ 비밀번호가 일치하지 않습니다.',
  passwordMatch: '비밀번호가 일치합니다.',
};

export const passwordResetSteps = [
  { label: 'STEP 01', caption: '본인 확인' },
  { label: 'STEP 02', caption: '비밀번호 변경' },
] as const;

/* ------------------------------------------------------------------- Login */

export const loginContent = {
  title: 'Gamers 로그인',
  subtitle: '게임 질문/답변 커뮤니티에 오신 것을 환영합니다',
  error: {
    title: '인증 오류',
    message: '아이디 또는 비밀번호가 일치하지 않습니다.',
  },
  fields: {
    username: { label: '아이디', hint: 'Gamertag or Email', placeholder: '아이디를 입력하세요' },
    password: { label: '비밀번호', hint: '8~32자', placeholder: '비밀번호를 입력하세요' },
  },
  remember: '로그인 상태 유지',
  submit: '로그인',
  links: [
    { label: '아이디 찾기', to: ROUTES.findId },
    { label: '비밀번호 찾기', to: ROUTES.findPassword },
    { label: '회원가입', to: ROUTES.signup, emphasis: true },
  ],
  teaser: { icon: 'sports_esports', label: '오늘 등록된 새 공략', value: '+1,280건' },
};

/* ------------------------------------------------------------------ Signup */

export const signupContent = {
  title: '회원가입',
  subtitle: 'Gamers의 회원이 되어 다양한 게임 공략과 Q&A를 함께하세요',
  checkButton: '중복 확인',
  fields: {
    name: { label: '이름', placeholder: '이름을 입력하세요' },
    username: { label: '아이디', placeholder: '아이디를 입력하세요' },
    nickname: { label: '닉네임', placeholder: '닉네임을 입력하세요' },
    password: { label: '비밀번호', placeholder: '비밀번호를 입력하세요' },
    passwordConfirm: { label: '비밀번호 확인', placeholder: '비밀번호를 확인합니다' },
    email: { label: '이메일', placeholder: '이메일을 입력하세요' },
  },
  messages: {
    checkPrompt: '중복 확인을 눌러주세요',
    nameRequired: '이름을 입력해 주세요.',
    nameInvalid: '✖ 이름은 영문 또는 한글만, 최대 16자까지 입력할 수 있습니다.',
    passwordRequired: '비밀번호를 입력해 주세요.',
    passwordInvalid:
      '✖ 8~32자, 영문·숫자·특수문자 중 2종류 이상, 같은/연속 문자는 2자까지만 쓸 수 있습니다.',
    idEmpty: '✖ 아이디를 입력한 뒤 중복 확인을 해주세요.',
    idTaken: '✖ 이미 사용 중인 아이디입니다',
    idAvailable: '✔ 사용 가능한 아이디입니다',
    idUnchecked: '✖ 아이디 중복 확인을 완료해 주세요.',
    nicknameEmpty: '✖ 닉네임을 입력한 뒤 중복 확인을 해주세요.',
    nicknameInvalid: '✖ 닉네임은 영문 또는 한글만, 2~16자로 입력해 주세요.',
    nicknameTaken: '✖ 이미 사용 중인 닉네임입니다',
    nicknameAvailable: '✔ 사용 가능한 닉네임입니다',
    nicknameUnchecked: '✖ 닉네임 중복 확인을 완료해 주세요.',
    emailInvalid: '✖ 유효한 이메일 주소를 입력해 주세요. (최대 128자)',
    emailTaken: '✖ 이미 등록된 이메일입니다',
    emailAvailable: '✔ 사용 가능한 이메일입니다',
    emailUnchecked: '✖ 이메일 중복 확인을 완료해 주세요.',
    success: '회원가입이 완료되었습니다! 환영합니다.',
  },
  submit: '회원가입',
  footerPrompt: '이미 계정이 있으신가요?',
  footerLink: { label: '로그인하기', to: ROUTES.login },
};

/* ----------------------------------------------------------------- Find ID */

export const findIdContent = {
  eyebrow: { icon: 'manage_search', label: 'ACCOUNT RECOVERY' },
  title: '아이디 찾기',
  description: '가입 시 등록한 이름과 이메일을 입력하시면 아이디를 확인하실 수 있습니다.',
  fields: {
    name: { label: '이름', hint: 'NAME', placeholder: '이름을 입력하세요' },
    email: { label: '이메일', hint: 'EMAIL', placeholder: '이메일을 입력하세요' },
  },
  result: {
    prefix: '회원님의 아이디는',
    suffix: '입니다. (개인정보 보호를 위해 일부만 표시합니다.)',
  },
  notFound: '해당 계정이 존재하지 않습니다. 입력 정보를 확인해주세요.',
  submit: '아이디 찾기',
  links: [
    { label: '비밀번호 찾기', to: ROUTES.findPassword, icon: 'lock_reset' },
    { label: '로그인으로 돌아가기', to: ROUTES.login, icon: 'login' },
  ],
};

/* ----------------------------------------------------------- Find Password */

export const findPasswordContent = {
  eyebrow: { icon: 'lock_reset', label: 'SECURITY CHECKPOINT' },
  title: '비밀번호 찾기',
  description: '가입하신 아이디와 이메일을 입력하시면 비밀번호를 재설정하실 수 있습니다.',
  fields: {
    username: { label: '아이디', hint: 'ID Required', placeholder: '아이디를 입력하세요' },
    email: { label: '이메일', hint: 'Verification Address', placeholder: '이메일을 입력하세요' },
  },
  messages: {
    required: '※ 아이디와 이메일을 모두 입력해주세요.',
    notFound: '※ 해당 계정이 존재하지 않습니다.',
  },
  submit: '확인',
};

/* --------------------------------------------------------- Change Password */

export const changePasswordContent = {
  title: '비밀번호 변경',
  description:
    '새로운 비밀번호를 설정해주세요. 영문, 숫자, 특수문자를 포함하여 안전하게 생성하세요.',
  fields: {
    current: { label: '현재 비밀번호', placeholder: '현재 비밀번호를 입력하세요' },
    password: {
      label: '새 비밀번호',
      hint: '8~32자, 영문/숫자/특수문자 중 2종류 이상',
      placeholder: '새 비밀번호를 입력하세요',
    },
    confirm: { label: '새 비밀번호 확인', placeholder: '새 비밀번호를 다시 입력하세요' },
  },
  strength: {
    labels: ['보안도', '취약', '보통', '안전'],
  },
  messages: {
    hint: '동일한 비밀번호를 두 번 입력해주세요.',
    currentRequired: '현재 비밀번호를 입력해주세요.',
    currentMismatch: '현재 비밀번호가 일치하지 않습니다.',
    success: '비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.',
  },
  notice: {
    primary: '이전에 사용한 적 없는 안전한 비밀번호를 권장합니다.',
    secondary: '변경 즉시 타 기기에서의 세션이 만료될 수 있습니다.',
  },
  submit: '변경',
  submitting: '변경 중...',
};

/* ------------------------------------------------------------------ Mypage */

export interface GameTagData {
  readonly name: string;
  readonly tone: Tone;
}

/** 다른 회원·비회원에게도 보이는 공개 항목 (GET /api/users/:userId) */
export interface PublicProfile {
  readonly id: number;
  readonly nickname: string;
  readonly level: string;
  readonly rank: string;
  readonly since: string;
  readonly avatarUrl: string;
  readonly avatarAlt: string;
  /** 소개글 HTML (API_SPEC 2장) */
  readonly bio: string;
  readonly mannerTemp: string;
  readonly responseRate: string;
  readonly questionCount: number;
  readonly answerCount: number;
  readonly postCount: number;
  readonly games: readonly GameTagData[];
}

/** 본인에게만 보이는 프로필 (GET /api/users/me). 아이디·회원 코드가 추가된다. */
export interface UserProfile extends PublicProfile {
  readonly handle: string;
}

export const initialProfile: UserProfile = {
  id: 12,
  nickname: '레전드게이머',
  handle: '@gamer_legend',
  level: 'LV.42',
  rank: 'DIAMOND I',
  since: 'SINCE 2022.03',
  avatarUrl: '/images/profile-hero.jpg',
  avatarAlt: '네온 조명 아래 전술 헬멧을 쓴 사이버네틱 e스포츠 게이머 아바타',
  bio: '<p>안녕하세요! RPG와 FPS 게임을 주로 즐기는 게이머입니다. 공략 및 Q&amp;A 언제든 환영합니다. 함께 파티 플레이하실 분들은 프로필 메시지 남겨주세요!</p>',
  mannerTemp: '매너온도 99.5°C',
  responseRate: '응답률 98%',
  questionCount: 18,
  answerCount: 52,
  postCount: 64,
  games: [
    { name: '#리그오브레전드', tone: 'warning' },
    { name: '#발로란트', tone: 'danger' },
    { name: '#엘든링', tone: 'tertiary' },
    { name: '#사이버펑크2077', tone: 'primary' },
  ],
};

export interface AuthoredQuestion {
  readonly id: number;
  readonly authorId: number;
  readonly title: string;
  readonly answerCount: number;
  readonly isAccepted: boolean;
  readonly createdAt: string;
}

export interface AuthoredAnswer {
  readonly id: number;
  readonly authorId: number;
  readonly preview: string;
  readonly question: { readonly id: number; readonly title: string };
  readonly isAccepted: boolean;
  readonly createdAt: string;
}

export interface AuthoredPost {
  readonly id: number;
  readonly authorId: number;
  readonly title: string;
  readonly commentCount: number;
  readonly createdAt: string;
}

/** mock: GET /api/questions?authorId= */
export const authoredQuestions: readonly AuthoredQuestion[] = [
  {
    id: 3,
    authorId: 12,
    title: '스타듀밸리 과일나무가 자라지 않습니다',
    answerCount: 0,
    isAccepted: false,
    createdAt: '2026.11.10',
  },
  {
    id: 8,
    authorId: 12,
    title: '마인크래프트 네더 차원문 생성 버그 질문',
    answerCount: 2,
    isAccepted: false,
    createdAt: '2026.11.10',
  },
  {
    id: 4,
    authorId: 4,
    title: '발로란트 감도 추천 부탁드립니다',
    answerCount: 3,
    isAccepted: false,
    createdAt: '2026.11.10',
  },
];

/** mock: GET /api/answers?authorId= */
export const authoredAnswers: readonly AuthoredAnswer[] = [
  {
    id: 8957,
    authorId: 12,
    preview: '혹시 마을 판정 범위 내에 침대 개수가 주민 수보다 부족하지 않은가요?',
    question: { id: 1, title: '마인크래프트 주민 거래가 갱신되지 않아요' },
    isAccepted: false,
    createdAt: '2026.11.12',
  },
  {
    id: 8810,
    authorId: 12,
    preview: 'DPI 800 기준 인게임 감도 0.35 전후가 무난합니다.',
    question: { id: 4, title: '발로란트 감도 추천 부탁드립니다' },
    isAccepted: true,
    createdAt: '2026.11.11',
  },
  {
    id: 8701,
    authorId: 4,
    preview: '스팀 설정에서 클라우드 동기화를 껐다 켜 보세요.',
    question: { id: 9, title: '스팀 동기화 오류 클라우드 세이브 복구 방법' },
    isAccepted: false,
    createdAt: '2026.11.10',
  },
];

/** mock: GET /api/posts?authorId= */
export const authoredPosts: readonly AuthoredPost[] = [
  { id: 1, authorId: 12, title: 'oo 게임 공략법', commentCount: 4, createdAt: '2025.07.23' },
  {
    id: 4,
    authorId: 12,
    title: '던전 클리어 노하우 공유합니다',
    commentCount: 0,
    createdAt: '2025.07.23',
  },
];

/** mock: GET /api/users/:userId. 아이디·회원 코드 같은 개인정보는 응답에 없다. */
export const publicProfiles: readonly PublicProfile[] = [
  (({ handle: _handle, ...rest }) => rest)(initialProfile),
  {
    id: 4,
    nickname: '프로유저',
    level: 'LV.17',
    rank: 'GOLD III',
    since: 'SINCE 2026.10',
    avatarUrl: '/images/profile-hero.jpg',
    avatarAlt: '프로유저 프로필 사진',
    bio: '<p>발로란트 위주로 플레이합니다. 에임 연습 루틴 공유해요.</p>',
    mannerTemp: '매너온도 36.5°C',
    responseRate: '응답률 72%',
    questionCount: 12,
    answerCount: 40,
    postCount: 9,
    games: [
      { name: '#발로란트', tone: 'danger' },
      { name: '#오버워치2', tone: 'primary' },
    ],
  },
];

/** mock: Q&A·자유게시판 작성자의 공개 프로필 (shared/mockUsers 의 id 와 같다) */
const authorProfiles: readonly PublicProfile[] = Object.entries(mockUserIds)
  .filter(([, id]) => id !== initialProfile.id)
  .map(([nickname, id]) => ({
    ...publicProfiles[1],
    id,
    nickname,
    avatarAlt: `${nickname} 프로필 사진`,
    bio: `<p>${nickname}의 소개글입니다.</p>`,
  }));

/** id 로 공개 프로필 찾기. TODO: GET /api/users/:userId */
export const findPublicProfile = (id: number) =>
  publicProfiles.find((p) => p.id === id) ?? authorProfiles.find((p) => p.id === id);

export const mypageContent = {
  title: '마이페이지',
  publicTitle: '회원 프로필',
  notFound: '존재하지 않거나 탈퇴한 회원입니다.',
  online: '온라인',
  verified: '공식 인증 클랜원',
  nicknameLabel: '닉네임',
  /** 활동 통계 (작성한 글 수) */
  stats: { questions: '질문', answers: '답변', posts: '게시글' },
  activity: {
    lists: {
      questions: { icon: 'help_outline', label: '작성한 질문', empty: '작성한 질문이 없습니다.' },
      answers: { icon: 'forum', label: '작성한 답변', empty: '작성한 답변이 없습니다.' },
      posts: { icon: 'article', label: '작성한 게시글', empty: '작성한 게시글이 없습니다.' },
    },
    answersSuffix: '답변',
    commentsSuffix: '댓글',
    accepted: '채택',
    viewAll: '전체 보기',
  },
  bio: { icon: 'notes', label: '소개글', meta: 'PROFILE BIO' },
  games: { icon: 'sports_esports', label: '관심 게임', metaSuffix: '개 활성화' },
  edit: '수정하기',
  back: '돌아가기',
  note: '내 계정 프로필 페이지에서만 편집 버튼이 활성화됩니다.',
};

/* ------------------------------------------------------------- Mypage Edit */

export const mypageEditContent = {
  title: '마이페이지 수정',
  description: '프로필 사진 및 소개글 정보를 변경할 수 있습니다.',
  closeLabel: '닫기',
  photo: {
    label: '프로필 사진',
    hint: 'JPG, PNG · 최대 10MB',
    backgroundUrl: '/images/profile-edit-bg.jpg',
    emptyTitle: '프로필 사진 등록',
    emptyDescription: '클릭하여 이미지 파일을 업로드하세요',
    hoverTitle: '사진 교체하기',
    hoverDescription: '클릭하여 새 이미지를 탐색합니다',
    accept: 'image/png, image/jpeg',
    maxBytes: 10 * 1024 * 1024,
    invalidType: 'JPG 또는 PNG 파일만 업로드할 수 있습니다.',
    tooLarge: '최대 10MB 이하의 이미지만 업로드할 수 있습니다.',
  },
  bio: {
    label: '소개글',
    max: 200,
    unit: '자',
    placeholder: '자신을 자유롭게 소개하는 글을 입력해주세요 (예: 게임 취향, 개발 선호 기술 등)',
    help: '프로필 카드 및 파티 찾기 화면에 노출되는 소개 문구입니다.',
  },
  save: '수정 완료',
  saving: '저장 중...',
  changePassword: { label: '비밀번호 변경', to: ROUTES.changePassword },
  withdraw: { label: '회원탈퇴', to: ROUTES.withdraw },
};

/* ---------------------------------------------------------------- Withdraw */

export const withdrawContent = {
  title: '정말로 회원 탈퇴하시겠습니까?',
  warning: '탈퇴 시 삭제된 회원 정보는 복구할 수 없습니다.',
  notice: {
    title: '탈퇴 시 필수 확인 사항',
    meta: 'IRREVERSIBLE',
    /** 실제 탈퇴 처리와 같은 내용만 안내한다 (API_SPEC 2장 회원 탈퇴) */
    items: [
      '아이디·이메일·닉네임·이름·비밀번호, 프로필 사진과 소개글이 삭제되며 복구할 수 없습니다.',
      '탈퇴한 계정으로는 다시 로그인할 수 없고, 같은 아이디·이메일·닉네임으로 새로 가입할 수 있습니다.',
      '작성한 질문·답변·게시글·댓글은 남고, 작성자는 ‘탈퇴한 회원’으로 표시됩니다.',
    ],
  },
  agreement: '위 안내 사항을 모두 확인하였으며, 이에 동의합니다.',
  confirm: '회원탈퇴 확정하기',
  done: '회원 탈퇴 처리가 완료되었습니다. 로그인 페이지로 이동합니다.',
};

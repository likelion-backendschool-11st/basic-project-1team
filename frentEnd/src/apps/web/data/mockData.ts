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
  withdraw: '/withdraw',
} as const;

export type Tone = 'success' | 'danger' | 'warning' | 'tertiary' | 'primary' | 'neutral';

/* ---------------------------------------------------------------- Mock DB */

export interface MockAccount {
  readonly name: string;
  readonly userId: string;
  readonly email: string;
  readonly password: string;
}

export const mockAccounts: readonly MockAccount[] = [
  { name: '김게이머', userId: 'gamer_legend', email: 'legend@gamers.com', password: 'password123!' },
];

export const takenUserIds: readonly string[] = ['admin', 'test', 'gamer', 'gamer_legend'];
export const takenNicknames: readonly string[] = ['운영자', '관리자', '레전드게이머'];
export const takenEmails: readonly string[] = ['admin@gamers.com', 'test@gamers.com', 'legend@gamers.com'];

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
    userId: { label: '아이디', hint: 'Gamertag or Email', placeholder: '아이디를 입력하세요' },
    password: { label: '비밀번호', hint: 'Min. 8 characters', placeholder: '비밀번호를 입력하세요' },
  },
  remember: '로그인 상태 유지',
  status: 'AUTH V2.4 ONLINE',
  submit: '로그인',
  links: [
    { label: '아이디 찾기', to: ROUTES.findId },
    { label: '비밀번호 찾기', to: ROUTES.findPassword },
    { label: '회원가입', to: ROUTES.signup, emphasis: true },
  ],
  teaser: { icon: 'sports_esports', label: '오늘 등록된 새 공략', value: '+1,280건' },
  footer: { icon: 'lock_clock', text: 'Gamers ENCRYPTED SECURE AUTH SYSTEM' },
};

/* ------------------------------------------------------------------ Signup */

export const signupContent = {
  title: '회원가입',
  subtitle: 'Gamers의 회원이 되어 다양한 게임 공략과 Q&A를 함께하세요',
  checkButton: '중복 확인',
  fields: {
    name: { label: '이름', placeholder: '이름을 입력하세요' },
    userId: { label: '아이디', placeholder: '아이디를 입력하세요' },
    nickname: { label: '닉네임', placeholder: '닉네임을 입력하세요' },
    password: { label: '비밀번호', placeholder: '비밀번호를 입력하세요' },
    passwordConfirm: { label: '비밀번호 확인', placeholder: '비밀번호를 확인합니다' },
    email: { label: '이메일', placeholder: '이메일을 입력하세요' },
  },
  messages: {
    checkPrompt: '중복 확인을 눌러주세요',
    nameRequired: '이름을 입력해 주세요.',
    passwordRequired: '비밀번호를 입력해 주세요.',
    idEmpty: '✖ 아이디를 입력한 뒤 중복 확인을 해주세요.',
    idTaken: '✖ 이미 사용 중인 아이디입니다',
    idAvailable: '✔ 사용 가능한 아이디입니다',
    idUnchecked: '✖ 아이디 중복 확인을 완료해 주세요.',
    nicknameEmpty: '✖ 닉네임을 입력한 뒤 중복 확인을 해주세요.',
    nicknameTaken: '✖ 이미 사용 중인 닉네임입니다',
    nicknameAvailable: '✔ 사용 가능한 닉네임입니다',
    nicknameUnchecked: '✖ 닉네임 중복 확인을 완료해 주세요.',
    emailInvalid: '✖ 유효한 이메일 주소를 입력해 주세요.',
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
  result: { prefix: '회원님의 아이디는', suffix: '입니다.' },
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
    userId: { label: '아이디', hint: 'ID Required', placeholder: '아이디를 입력하세요' },
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
  description: '새로운 비밀번호를 설정해주세요. 영문, 숫자, 특수문자를 포함하여 안전하게 생성하세요.',
  fields: {
    password: { label: '새 비밀번호', hint: '영문/숫자/특수문자 8자 이상', placeholder: '새 비밀번호를 입력하세요' },
    confirm: { label: '새 비밀번호 확인', placeholder: '새 비밀번호를 다시 입력하세요' },
  },
  strength: {
    labels: ['보안도', '취약', '보통', '안전'],
  },
  messages: {
    hint: '동일한 비밀번호를 두 번 입력해주세요.',
    tooShort: '비밀번호는 최소 8자 이상 입력해주세요.',
    success: '비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.',
  },
  notice: {
    primary: '이전에 사용한 적 없는 안전한 비밀번호를 권장합니다.',
    secondary: '변경 즉시 타 기기에서의 세션이 만료될 수 있습니다.',
  },
  submit: '변경',
  submitting: '변경 중...',
  footer: { code: 'CODE: P-001', support: '고객센터 문의' },
};

/* ------------------------------------------------------------------ Mypage */

export interface GameTagData {
  readonly name: string;
  readonly tone: Tone;
}

export interface UserProfile {
  readonly userCode: string;
  readonly nickname: string;
  readonly handle: string;
  readonly level: string;
  readonly rank: string;
  readonly since: string;
  readonly avatarUrl: string;
  readonly avatarAlt: string;
  readonly bio: string;
  readonly mannerTemp: string;
  readonly responseRate: string;
  readonly questionCount: number;
  readonly postCount: number;
  readonly games: readonly GameTagData[];
}

export const initialProfile: UserProfile = {
  userCode: 'ID: GM-8820419',
  nickname: '레전드게이머',
  handle: '@gamer_legend',
  level: 'LV.42',
  rank: 'DIAMOND I',
  since: 'SINCE 2022.03',
  avatarUrl: '/images/profile-hero.jpg',
  avatarAlt: '네온 조명 아래 전술 헬멧을 쓴 사이버네틱 e스포츠 게이머 아바타',
  bio: '안녕하세요! RPG와 FPS 게임을 주로 즐기는 게이머입니다. 공략 및 Q&A 언제든 환영합니다. 함께 파티 플레이하실 분들은 프로필 메시지 남겨주세요!',
  mannerTemp: '매너온도 99.5°C',
  responseRate: '응답률 98%',
  questionCount: 18,
  postCount: 64,
  games: [
    { name: '#리그오브레전드', tone: 'warning' },
    { name: '#발로란트', tone: 'danger' },
    { name: '#엘든링', tone: 'tertiary' },
    { name: '#사이버펑크2077', tone: 'primary' },
  ],
};

export const mypageContent = {
  title: '마이페이지',
  online: '온라인',
  verified: '공식 인증 클랜원',
  nicknameLabel: '닉네임',
  actions: {
    questions: { icon: 'help_outline', label: '질문 보기' },
    posts: { icon: 'article', label: '게시글 보기' },
  },
  bio: { icon: 'notes', label: '소개글', meta: 'PROFILE BIO' },
  games: { icon: 'sports_esports', label: '관심 게임', metaSuffix: '개 활성화' },
  edit: '수정하기',
  back: '돌아가기',
  note: '내 계정 프로필 페이지에서만 편집 버튼이 활성화됩니다.',
};

/* ------------------------------------------------------------- Mypage Edit */

export const mypageEditContent = {
  meta: 'P-001 // SEC_09',
  synced: '동기화됨',
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
  badge: 'SECURITY VERIFICATION // P-001',
  title: '정말로 회원 탈퇴하시겠습니까?',
  warning: '탈퇴 시 삭제된 회원 정보는 복구할 수 없습니다.',
  notice: {
    title: '탈퇴 시 필수 확인 사항',
    meta: 'IRREVERSIBLE',
    items: [
      '프로필 정보, 게임 연동 계정 및 전적 통계 데이터가 즉시 영구 파기됩니다.',
      '보유 중인 잔여 크레딧 및 배틀패스 시즌 보상은 모두 자동 소멸 처리됩니다.',
      '커뮤니티 및 게시판에 작성한 게시물 및 댓글은 익명화 처리되어 보존됩니다.',
    ],
  },
  agreement: '위 안내 사항을 모두 확인하였으며, 이에 동의합니다.',
  confirm: '회원탈퇴 확정하기',
  done: '회원 탈퇴 처리가 완료되었습니다. 로그인 페이지로 이동합니다.',
  footer: { icon: 'shield', text: 'ENCRYPTED SECURE SESSION' },
};

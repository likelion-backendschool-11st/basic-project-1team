import type { MySanction } from '../../../shared/sanctions';
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
    idInvalid: '✖ 아이디는 영문 소문자·숫자·_만, 4~20자로 입력해 주세요.',
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
  required: '이름과 이메일을 모두 입력해주세요.',
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

/** 다른 회원·비회원에게도 보이는 공개 항목 (API_SPEC 2장 GET /api/users/:userId) */
export interface PublicProfile {
  readonly id: number;
  readonly nickname: string;
  readonly profileImageUrl: string | null;
  /** 소개글 HTML. 쓰지 않았으면 null */
  readonly bio: string | null;
  readonly questionCount: number;
  readonly answerCount: number;
  readonly postCount: number;
  /** 그 회원이 쓴 질문에 가장 많이 쓴 태그 상위 5개 */
  readonly interestTags: readonly string[];
  readonly createdAt: string;
}

/** 본인에게만 보이는 프로필 (API_SPEC 2장 GET /api/users/me). 아이디·실명·이메일·권한·제재가 더해진다 */
export interface MyProfile extends PublicProfile {
  readonly username: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'USER' | 'ADMIN';
  readonly permissions: readonly string[];
  readonly sanctions: readonly MySanction[];
}

/** 프로필 작성 목록의 질문 (GET /api/questions?authorId= 항목 중 쓰는 값) */
export interface AuthoredQuestion {
  readonly id: number;
  readonly title: string;
  readonly answerCount: number;
  readonly isAccepted: boolean;
  readonly createdAt: string;
}

/** 프로필 작성 목록의 답변 (GET /api/answers?authorId= 항목) */
export interface AuthoredAnswer {
  readonly id: number;
  readonly preview: string;
  readonly question: { readonly id: number; readonly title: string };
  readonly isAccepted: boolean;
  readonly createdAt: string;
}

/** 프로필 작성 목록의 게시글 (GET /api/posts?authorId= 항목 중 쓰는 값) */
export interface AuthoredPost {
  readonly id: number;
  readonly title: string;
  readonly commentCount: number;
  readonly createdAt: string;
}

export const mypageContent = {
  title: '마이페이지',
  publicTitle: '회원 프로필',
  notFound: '존재하지 않거나 탈퇴한 회원입니다.',
  loading: '프로필을 불러오는 중입니다...',
  nicknameLabel: '닉네임',
  /** 가입 연월 (예: SINCE 2022.03) */
  since: (createdAt: string) => {
    const date = new Date(createdAt);
    return `SINCE ${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  },
  avatarAlt: (nickname: string) => `${nickname} 프로필 사진`,
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
    /** 회원이 쓴 답변 목록 API(#126)가 생기기 전까지 답변은 개수와 전체 보기만 보여 준다 */
    answersPending: '답변 목록은 전체 보기에서 확인할 수 있습니다.',
    loadError: '작성 목록을 불러오지 못했습니다.',
  },
  bio: { icon: 'notes', label: '소개글', meta: 'PROFILE BIO', empty: '아직 소개글이 없습니다.' },
  /** 그 회원이 쓴 질문에 가장 많이 쓴 태그 (API_SPEC 2장 interestTags) */
  interestTags: {
    icon: 'sell',
    label: '관심 태그',
    metaSuffix: '개',
    empty: '질문을 작성하면 자주 쓴 태그가 표시됩니다.',
  },
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
    help: '마이페이지와 회원 프로필에 공개되는 소개 문구입니다.',
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

/** 모든 사용자 화면(Q&A·자유게시판·회원)이 함께 쓰는 헤더·푸터 문구와 메뉴. */
export const site = {
  brand: 'Gamers',
  logoSrc: '/logo.svg',
  logoAlt: 'Gamers Logo',
  homePath: '/qna',
  notificationsLabel: 'Notifications',
  profileLabel: '프로필',
  loginLabel: '로그인',
  logoutLabel: '로그아웃',
  myPageLabel: '마이페이지',
  editProfileLabel: '프로필 수정',
  myPagePath: '/mypage',
  editProfilePath: '/mypage/edit',
  community: 'Gamers Pro Gaming Dev Community',
} as const;

export interface SiteNavItem {
  readonly label: string;
  /** 모듈 prefix 를 포함한 전체 경로 */
  readonly href: string;
}

export const siteNav: readonly SiteNavItem[] = [
  { label: '질문/답변', href: '/qna/questions' },
  { label: '자유게시판', href: '/board' },
  { label: '공지사항', href: '/qna/notices' },
];

export const noticePaths = {
  list: '/qna/notices',
  detail: (id: number) => `/qna/notices/${id}`,
} as const;

/** 신고 화면 (Q&A 모듈). 게시글·댓글도 같은 화면을 쓴다 (API_SPEC 8장) */
export const reportPath = (
  type: 'question' | 'answer' | 'post' | 'comment',
  id: number | string,
  from?: string,
) => `/qna/report/${type}/${id}${from ? `?from=${encodeURIComponent(from)}` : ''}`;

/**
 * 회원 프로필의 "전체 보기" → 목록 화면 + 검색 조건 (API_SPEC 2장 "회원 작성 목록").
 * 질문·게시글은 그 회원이 쓴 글, 답변은 그 회원이 답변을 쓴 질문 목록으로 보낸다.
 */
export const AUTHOR_PARAM = 'authorId';
export const ANSWER_AUTHOR_PARAM = 'answerAuthorId';
export const authorListPaths = {
  questions: (userId: number) => `/qna/questions?${AUTHOR_PARAM}=${userId}`,
  answers: (userId: number) => `/qna/questions?${ANSWER_AUTHOR_PARAM}=${userId}`,
  posts: (userId: number) => `/board?${AUTHOR_PARAM}=${userId}`,
} as const;

/** 목록 화면 위에 보여 주는 회원 검색 조건 문구 */
export const authorFilterCopy = {
  questions: (name: string) => `${name} 님이 작성한 질문`,
  answers: (name: string) => `${name} 님이 답변한 질문`,
  posts: (name: string) => `${name} 님이 작성한 게시글`,
  unknownUser: (userId: number) => `회원 #${userId}`,
  clear: '조건 해제',
} as const;

/** 주소의 회원 id 검색 조건. 없거나 숫자가 아니면 null */
export const userIdParam = (value: string | null): number | null => {
  const id = Number(value);
  return value && Number.isInteger(id) && id > 0 ? id : null;
};

/** 회원 공개 프로필. 본인이면 프로필 화면이 마이페이지로 보낸다 (API_SPEC 2장) */
export const profilePath = (userId: number) => `/users/${userId}`;

/** 모든 사용자 화면(Q&A·자유게시판)이 함께 쓰는 헤더·푸터 문구와 메뉴. */
export const site = {
  brand: 'Gamers',
  logoSrc: '/logo.svg',
  logoAlt: 'Gamers Logo',
  homePath: '/qna',
  notificationsLabel: 'Notifications',
  profileLabel: '프로필',
  loginLabel: '로그인',
  logoutLabel: '로그아웃',
  version: 'v2.4.0-stable',
  community: 'Gamers Pro Gaming Dev Community',
  footerLinks: ['이용약관', '개인정보처리방침', '커뮤니티 가이드'],
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

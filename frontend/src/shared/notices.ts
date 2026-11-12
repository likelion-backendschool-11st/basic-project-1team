/** 공지 (API_SPEC 9장). 헤더 공지 롤링과 Q&A 공지 화면이 함께 쓴다. */
export interface Notice {
  readonly id: number;
  readonly title: string;
  /** 목록 응답에는 없고 상세 응답에만 있다 (API_SPEC 9장). */
  readonly body: string;
  readonly isPinned: boolean;
  readonly author: string;
  readonly createdAt: string;
}

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
  {
    id: 4,
    title: '스포일러 태그 사용 안내',
    body: '신작 및 DLC 관련 게시물에는 스포일러 태그를 반드시 붙여 주세요.',
    isPinned: true,
    author: '운영자01',
    createdAt: '2026.11.13',
  },
  {
    id: 3,
    title: '태그 작성 가이드',
    body: '태그는 1~30자의 한글, 영문, 숫자, _, - 로 작성해 주세요. 공백은 쓸 수 없습니다.\n예: 마인크래프트, monster-hunter, 1-20-4',
    isPinned: false,
    author: '운영자01',
    createdAt: '2026.11.08',
  },
  {
    id: 2,
    title: '신고 기능 안내 및 처리 기준',
    body: '신고는 접수 후 24시간 이내에 검토되며, 처리 결과는 알림으로 안내됩니다.',
    isPinned: false,
    author: '운영자01',
    createdAt: '2026.11.05',
  },
  {
    id: 1,
    title: '11월 정기 점검 안내',
    body: '11월 20일 02:00 ~ 06:00 정기 점검이 진행됩니다.',
    isPinned: false,
    author: '운영자01',
    createdAt: '2026.11.01',
  },
];

export interface Post {
  id: number;
  title: string;
  author: string;
  date: string;
  views: number;
  comments: number;
}

export interface Comment {
  id: number;
  author: string;
  date: string;
  body: string;
  tone: 'neutral' | 'success' | 'brand';
}

export interface PostDetail {
  title: string;
  author: string;
  date: string;
  views: number;
  /** 에디터로 작성한 본문 HTML (GET /api/posts/:postId 의 body) */
  body: string;
  attachmentUrl: string;
}

export interface MyPost {
  id: number;
  title: string;
  date: string;
}

export const CURRENT_USER = '호야';
export const TOTAL_PAGES = 5;
export const MY_POSTS_ROWS = 10;

/** 자유게시판 화면 경로. Q&A 와 라우터 하나(site 모듈)를 같이 쓰므로 `/board` 를 포함한 전체 경로다 */
export const routes = {
  board: '/board',
  myPosts: '/board/my-posts',
  write: '/board/write',
  detail: (id: number) => `/board/posts/${id}`,
  edit: (id: number) => `/board/posts/${id}/edit`,
};

export const labels = {
  loginRequired: {
    title: '로그인이 필요합니다',
    description: '작성, 추천, 신고는 회원만 이용할 수 있습니다. 로그인 페이지로 이동하시겠습니까?',
    cancel: '취소',
    confirm: '로그인하기',
  },
  boardTitle: '자유게시판',
  myPostsButton: '내 게시글',
  searchPlaceholder: '검색어 입력',
  searchButton: '검색',
  sortLabel: '정렬 :',
  sortLatest: '최신순',
  sortOldest: '오래된순',
  columns: { no: 'NO', title: '제목', author: '작성자', date: '작성일', views: '조회수' },
  edit: '수정',
  editTooltip: '본인 작성글 수정',
  empty: '게시글이 존재하지 않습니다.',
  backToList: '목록으로 돌아가기',
  meta: { author: '작성자:', date: '작성일:', views: '조회수:', comments: '댓글:' },
  attachment: '첨부 링크:',
  commentsTitle: '댓글 목록',
  commentsMore: (n: number) => `•••• 댓글 더보기 (전체 ${n}개)`,
  commentsLess: '•••• 댓글 접기',
  commentPlaceholder: '댓글을 입력하세요...',
  commentSubmit: '등록',
  justNow: '방금 전',
  myPostsTitle: '내 게시글 목록',
  myPostsColumn: '내 게시글 목록',
  writeButton: '글작성',
  postEdit: '수정',
  postDelete: '삭제',
  postDeleteConfirm:
    '게시글을 삭제할까요? 삭제한 글은 목록과 검색에서 사라지고 댓글도 함께 삭제됩니다.',
  postDeleted: '게시글이 삭제되었습니다.',
  postNotFound: '존재하지 않거나 삭제된 게시글입니다.',
  commentDelete: '삭제',
  report: '신고',
  commentDeleteConfirm: '댓글을 삭제할까요?',
  write: {
    title: '게시글 작성',
    feedTag: 'GAMERS FEED',
    titleLabel: '게시글 제목',
    titlePlaceholder: '제목을 입력하세요',
    titleMax: 80,
    urlHeading: '외부 미디어 및 레퍼런스 URL 첨부',
    urlHint: 'YouTube, Twitch 클립, OP.GG 지원',
    urlPlaceholder: 'https://youtu.be/... 또는 참조 링크를 입력하세요',
    urlAdd: 'URL 첨부',
    bodyLabel: '게시글 내용',
    bodyPlaceholder: '내용을 작성해 주세요. 게이머들과 매너 있는 소통을 부탁드립니다.',
    cancel: '작성 취소',
    publish: '게시글 등록하기',
    publishing: '등록 중...',
    titleRequired: '게시글 제목을 입력해 주세요.',
    bodyRequired: '게시글 내용을 입력해 주세요.',
    published: '게시글이 성공적으로 등록되었습니다.',
    editTitle: '게시글 수정',
    update: '수정 완료',
    updating: '수정 중...',
    updated: '게시글이 수정되었습니다.',
    cancelEdit: '수정 취소',
  },
};

export const initialPosts: Post[] = [
  { id: 1, title: 'oo 게임 공략법', author: '호야', date: '2025.07.23', views: 238, comments: 4 },
  {
    id: 2,
    title: 'oo 게임 장비 셋팅법',
    author: '히야',
    date: '2025.07.23',
    views: 231,
    comments: 12,
  },
  {
    id: 3,
    title: 'oo 게임 출시 기념 이벤트',
    author: '후야',
    date: '2025.07.23',
    views: 43,
    comments: 2,
  },
  {
    id: 4,
    title: '던전 클리어 노하우 공유합니다',
    author: '하야',
    date: '2025.07.23',
    views: 15,
    comments: 0,
  },
  {
    id: 5,
    title: '무기 강화 확률 실측 데이터 정리',
    author: '헤야',
    date: '2025.07.23',
    views: 246,
    comments: 8,
  },
  {
    id: 6,
    title: '신규 길드원 모집 공고',
    author: '해야',
    date: '2025.07.23',
    views: 2334,
    comments: 19,
  },
  {
    id: 7,
    title: '초보자 추천 육성 트리 가이드',
    author: '효야',
    date: '2025.07.23',
    views: 115,
    comments: 1,
  },
  {
    id: 8,
    title: '레이드 보스 패턴 총정리',
    author: '휴야',
    date: '2025.07.23',
    views: 46,
    comments: 5,
  },
  {
    id: 9,
    title: '서버 점검 및 패치노트 안내',
    author: '헤야',
    date: '2025.07.23',
    views: 23,
    comments: 0,
  },
  {
    id: 10,
    title: '오늘 시작한 뉴비 인사드립니다!',
    author: '해야',
    date: '2025.07.23',
    views: 3,
    comments: 3,
  },
];

/** mock: GET /api/posts/:postId */
export const postDetail: PostDetail = {
  title: 'oo 게임 공략법 및 엔드스펙 세팅 총정리 가이드',
  author: '호야',
  date: '2025.07.23 14:32',
  views: 238,
  body:
    '<p>안녕하세요! 이번 시즌 새롭게 업데이트된 레이드 보스 공략 및 장비 효율적 최적화 세팅에 대한 팁을 공유해 드립니다. 처음 시작하시는 초보자분들이나 복귀 유저분들이 막히는 구간을 중점적으로 정리했습니다.</p>' +
    '<h3>1. 핵심 스킬 트리 및 특성 분배</h3><p>현재 메타에서는 쿨타임 감소 옵션보다 단일 타겟 관통력 위주로 세팅하는 것이 3페이즈 클리어 타임을 약 15% 이상 단축할 수 있습니다. 스킬 트리는 4번 지속 스킬을 5레벨까지 우선적으로 마스터하시는 것을 추천합니다.</p>' +
    '<h3>2. 필수 장비 강화 루트</h3><p>무기 강화 시에는 주간 한정 강화 보호권 먼저 소모하시고, 보조 장비는 8단계까지만 올려두셔도 전체적인 세트 효과 활성화가 가능하므로 무리한 골드 지출을 줄일 수 있습니다.</p>',
  attachmentUrl: 'https://guide.game-community.com/build/hoya-v2',
};

export const initialComments: Comment[] = [
  {
    id: 1,
    author: '누구씨',
    date: '2025.07.23 15:10',
    body: '세팅법 상세하게 잘 정리해주셔서 감사합니다! 4번 스킬 선마스터 해보니까 체감이 확실하네요.',
    tone: 'neutral',
  },
  {
    id: 2,
    author: '히야',
    date: '2025.07.23 15:45',
    body: '보조장비 8단계 추천 꿀팁 감사합니다. 골드 아꼈네요 ㅎㅎ',
    tone: 'success',
  },
  {
    id: 3,
    author: '후야',
    date: '2025.07.23 16:20',
    body: '혹시 2페이즈 즉사기 패턴 피하는 팁도 추가해주실 수 있나요?',
    tone: 'brand',
  },
];

export const myPosts: MyPost[] = [
  { id: 1, title: 'oo게임사 환불받는 방법', date: '26/12/31' },
  { id: 2, title: '모바일 클라이언트 튕김 현상 해결 팁 공유', date: '26/12/28' },
  { id: 3, title: '계정 보안 설정 및 2차 인증 필수 설정 가이드', date: '26/12/20' },
  { id: 4, title: '주간 퀘스트 최적 동선 및 보상 정리표', date: '26/12/15' },
  { id: 5, title: '신규 길드원 모집 공고 (친목 / 레이드 위주)', date: '26/12/10' },
];

export const initialAttachedUrls: string[] = ['https://youtu.be/sample-gameplay-highlight'];

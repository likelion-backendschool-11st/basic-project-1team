/** 목록 한 페이지 글 수 (API_SPEC 7장 GET /api/posts 기본 size) */
export const POST_PAGE_SIZE = 10;
/** 내 게시글 목록은 빈 줄까지 10줄로 보여 준다 */
export const MY_POSTS_ROWS = 10;
/**
 * 댓글은 한 번에 최대치(100개)까지 받아 "더보기"로 접고 편다 (API_SPEC 1.5 size 최대 100).
 * 100개를 넘는 글은 아직 없어 페이지 넘김은 두지 않는다.
 */
export const COMMENT_PAGE_SIZE = 100;

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
  /** 목록에서 내가 쓴 글 표시. 수정·삭제는 상세 화면에서 한다 (REQ-BOARD-004) */
  mine: '내 글',
  empty: '게시글이 존재하지 않습니다.',
  loading: '불러오는 중...',
  loadError: '게시글을 불러오지 못했습니다.',
  backToList: '목록으로 돌아가기',
  meta: { author: '작성자:', date: '작성일:', views: '조회수:', comments: '댓글:' },
  edited: '(수정됨)',
  commentsTitle: '댓글 목록',
  commentsMore: (n: number) => `•••• 댓글 더보기 (전체 ${n}개)`,
  commentsLess: '•••• 댓글 접기',
  commentPlaceholder: '댓글을 입력하세요...',
  /** 댓글 최대 길이 (API_SPEC 7장) */
  commentMax: 500,
  commentSubmit: '등록',
  commentSubmitting: '등록 중',
  commentsLoadError: '댓글을 불러오지 못했습니다.',
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
    /** 수정 화면은 작성자만 들어올 수 있다 (API_SPEC 7장 PATCH 403) */
    notMine: '본인이 작성한 게시글만 수정할 수 있습니다.',
  },
};

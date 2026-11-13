/** 응답에 넣는 작성자 정보 (API_SPEC 1.6 UserSummary). 탈퇴 회원은 고정 값 */
export const toUserSummary = ({ id, nickname, profileImageUrl, status }) =>
  status === 'withdrawn'
    ? { id: null, nickname: '탈퇴한 회원', profileImageUrl: null }
    : { id: Number(id), nickname, profileImageUrl };

/** 작성자 본인이거나 게시물·댓글 관리 권한(content_manage)이 있으면 true (API_SPEC 1.2) */
export const canManageContent = (user, authorId) =>
  Number(authorId) === user.id || user.permissions.includes('content_manage');

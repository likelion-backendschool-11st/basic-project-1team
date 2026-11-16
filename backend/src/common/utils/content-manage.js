// 게시물·댓글 관리 권한 (API 명세 1.2, REQ-ADMIN-004)
const CONTENT_MANAGE_PERMISSION = 'content_manage';

/**
 * 작성자가 아니어도 질문·답변·게시글을 수정·삭제하고 댓글을 삭제할 수 있는지.
 * content_manage 권한을 받은 회원과 ADMIN이 해당한다 (API 명세 1.2).
 * req.user는 인증 미들웨어가 DB에서 읽은 값이라 토큰의 role이 아니라 DB 기준이다.
 *
 * @param {{ role: string, permissions: string[] }} user
 */
export const canManageContent = (user) =>
  user.role === 'ADMIN' || user.permissions.includes(CONTENT_MANAGE_PERMISSION);

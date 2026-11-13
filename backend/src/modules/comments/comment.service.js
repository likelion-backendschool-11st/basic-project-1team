import { withTransaction } from '../../config/database.js';
import { ForbiddenError, NotFoundError } from '../../common/error/http-errors.js';
import { assertNotSanctioned, SANCTION_TYPE } from '../../common/utils/sanction.js';
import { canManageContent, toUserSummary } from '../../common/utils/user-summary.js';
import * as postService from '../posts/post.service.js';

import * as commentRepository from './comment.repository.js';

const toComment = (row, user) => ({
  id: Number(row.id),
  body: row.body,
  author: toUserSummary({
    id: row.author_id,
    nickname: row.author_nickname,
    profileImageUrl: row.author_profile_image_url,
    status: row.author_status,
  }),
  isMine: user !== null && Number(row.author_id) === user.id,
  createdAt: row.created_at,
});

/** 게시글 댓글 목록 (오래된 순). 게시글이 없거나 숨김·삭제면 404 */
export const getCommentsByPostId = async (postId, user, { page, size, limit, offset }) => {
  await postService.getPostById(postId);

  const [rows, totalCount] = await Promise.all([
    commentRepository.findCommentsByPostId(postId, { limit, offset }),
    commentRepository.countCommentsByPostId(postId),
  ]);

  return {
    comments: rows.map((row) => toComment(row, user)),
    meta: { page, size, totalCount },
  };
};

export const createComment = async (user, postId, { body }) => {
  assertNotSanctioned(user, [SANCTION_TYPE.COMMENT_BAN]);
  await postService.getPostById(postId);

  const commentId = await withTransaction((connection) =>
    commentRepository.createComment(connection, { postId, authorId: user.id, body: body.trim() }),
  );
  const row = await commentRepository.findActiveCommentById(commentId);

  return toComment(row, user);
};

export const deleteComment = async (user, commentId) => {
  assertNotSanctioned(user);

  await withTransaction(async (connection) => {
    const comment = await commentRepository.findActiveCommentByIdForUpdate(connection, commentId);

    if (comment === null) {
      throw new NotFoundError('COMMENT_NOT_FOUND', '댓글을 찾을 수 없습니다.');
    }

    if (!canManageContent(user, comment.author_id)) {
      throw new ForbiddenError('FORBIDDEN', '댓글을 삭제할 권한이 없습니다.');
    }

    // TODO: 작성자가 아닌 content_manage 회원이 삭제하면 활동 로그(MODERATE_DELETE) 기록
    await commentRepository.deleteComment(connection, commentId);
  });
};

/** 게시글 삭제 트랜잭션 안에서 부른다 */
export const deleteCommentsByPostId = async (connection, postId) =>
  commentRepository.deleteCommentsByPostId(connection, postId);

import { ForbiddenError, NotFoundError } from '../../common/error/http-errors.js';
import { toUserSummary } from '../../common/utils/user-summary.js';
import { withTransaction } from '../../config/database.js';
import * as activityLogService from '../admin/activity-log.service.js';
import * as postService from '../posts/post.service.js';

import * as commentRepository from './comment.repository.js';

const toComment = (row, userId) => ({
  id: row.id,
  body: row.body,
  author: toUserSummary(row, 'author'),
  isMine: row.author_id === userId,
  isEdited: row.edited_at !== null,
  createdAt: row.created_at,
});

// 게시글 댓글 목록 (오래된 순). 게시글이 없거나 숨김·삭제면 404
export const getCommentsByPostId = async (postId, userId, { page, size }) => {
  await postService.getPostById(postId);

  const [rows, totalCount] = await Promise.all([
    commentRepository.findCommentsByPostId(postId, { limit: size, offset: (page - 1) * size }),
    commentRepository.countCommentsByPostId(postId),
  ]);

  return {
    comments: rows.map((row) => toComment(row, userId)),
    meta: { page, size, totalCount },
  };
};

export const createComment = async (userId, postId, { body }) => {
  const commentId = await withTransaction(async () => {
    // 등록하는 동안 게시글이 삭제되지 않도록 게시글 행을 공유 잠금으로 잡는다
    await postService.getPostByIdForShare(postId);

    return commentRepository.createComment({ postId, authorId: userId, body });
  });

  const row = await commentRepository.findCommentById(commentId);

  return toComment(row, userId);
};

// 작성자만 수정한다. 숨김·삭제된 댓글이나 게시글이면 404 (REQ-BOARD-016, API 명세 7장)
export const updateComment = async (userId, commentId, { body }) => {
  await withTransaction(async () => {
    const comment = await commentRepository.findCommentWithPostByIdForUpdate(commentId);

    if (comment === null || comment.status !== 'active' || comment.post_status !== 'active') {
      throw new NotFoundError('COMMENT_NOT_FOUND', '댓글을 찾을 수 없습니다.');
    }

    if (comment.author_id !== userId) {
      throw new ForbiddenError('FORBIDDEN', '댓글 작성자만 수정할 수 있습니다.');
    }

    await commentRepository.updateComment(commentId, body);
  });

  const row = await commentRepository.findCommentById(commentId);

  return toComment(row, userId);
};

/**
 * 작성자 또는 관리 권한 회원(content_manage·ADMIN)이 댓글을 삭제한다 (API 명세 1.2, 7장).
 * 남의 댓글을 관리 권한으로 지우면 MODERATE_DELETE 활동 로그를 남긴다.
 * @param {{ canManageContent?: boolean }} [options]
 */
export const deleteComment = async (userId, commentId, { canManageContent = false } = {}) => {
  await withTransaction(async () => {
    const comment = await commentRepository.findCommentByIdForUpdate(commentId);

    if (comment === null || comment.status !== 'active') {
      throw new NotFoundError('COMMENT_NOT_FOUND', '댓글을 찾을 수 없습니다.');
    }

    const isModeration = comment.author_id !== userId;

    if (isModeration && !canManageContent) {
      throw new ForbiddenError('FORBIDDEN', '댓글 작성자만 삭제할 수 있습니다.');
    }

    await commentRepository.deleteComment(commentId);

    if (isModeration) {
      await activityLogService.createActivityLog({
        adminId: userId,
        action: activityLogService.ACTIVITY_LOG_ACTIONS.MODERATE_DELETE,
        targetType: 'comment',
        targetId: commentId,
      });
    }
  });
};

// 게시글 삭제 트랜잭션 안에서 부른다
export const deleteCommentsByPostId = async (postId) => {
  await commentRepository.deleteCommentsByPostId(postId);
};

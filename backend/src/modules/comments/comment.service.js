import { ForbiddenError, NotFoundError } from '../../common/error/http-errors.js';
import { toUserSummary } from '../../common/utils/user-summary.js';
import { withTransaction } from '../../config/database.js';
import * as postService from '../posts/post.service.js';

import * as commentRepository from './comment.repository.js';

const toComment = (row, userId) => ({
  id: row.id,
  body: row.body,
  author: toUserSummary(row, 'author'),
  isMine: row.author_id === userId,
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

export const deleteComment = async (userId, commentId) => {
  await withTransaction(async () => {
    const comment = await commentRepository.findCommentByIdForUpdate(commentId);

    if (comment === null || comment.status !== 'active') {
      throw new NotFoundError('COMMENT_NOT_FOUND', '댓글을 찾을 수 없습니다.');
    }

    // TODO: content_manage 권한 회원도 허용하고 활동 로그(MODERATE_DELETE)를 남긴다 (#57)
    if (comment.author_id !== userId) {
      throw new ForbiddenError('FORBIDDEN', '댓글 작성자만 삭제할 수 있습니다.');
    }

    await commentRepository.deleteComment(commentId);
  });
};

// 게시글 삭제 트랜잭션 안에서 부른다
export const deleteCommentsByPostId = async (postId) => {
  await commentRepository.deleteCommentsByPostId(postId);
};

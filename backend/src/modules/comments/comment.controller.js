import { parseId, parsePagination } from '../../common/utils/request.js';

import * as commentService from './comment.service.js';

const DEFAULT_PAGE_SIZE = 20;

export const getCommentsByPostId = async (req, res) => {
  const postId = parseId(req.params.postId, 'postId');
  const { comments, meta } = await commentService.getCommentsByPostId(
    postId,
    req.user,
    parsePagination(req.query, DEFAULT_PAGE_SIZE),
  );

  res.status(200).json({ success: true, data: comments, meta });
};

export const createComment = async (req, res) => {
  const postId = parseId(req.params.postId, 'postId');
  const comment = await commentService.createComment(req.user, postId, req.body);

  res.status(201).json({ success: true, data: comment });
};

export const deleteComment = async (req, res) => {
  const commentId = parseId(req.params.commentId, 'commentId');

  await commentService.deleteComment(req.user, commentId);

  res.status(204).end();
};

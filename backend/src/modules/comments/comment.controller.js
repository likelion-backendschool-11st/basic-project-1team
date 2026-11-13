import * as commentService from './comment.service.js';

export const getCommentsByPostId = async (req, res) => {
  const { comments, meta } = await commentService.getCommentsByPostId(
    Number(req.params.postId),
    req.user?.id,
    req.validatedQuery,
  );

  res.status(200).json({ success: true, data: comments, meta });
};

export const createComment = async (req, res) => {
  const comment = await commentService.createComment(
    req.user.id,
    Number(req.params.postId),
    req.body,
  );

  res.status(201).json({ success: true, data: comment });
};

export const deleteComment = async (req, res) => {
  await commentService.deleteComment(req.user.id, Number(req.params.commentId));

  res.status(204).end();
};

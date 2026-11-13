import * as postService from './post.service.js';

export const getPosts = async (req, res) => {
  const { posts, meta } = await postService.getPosts(req.user?.id, req.validatedQuery);

  res.status(200).json({ success: true, data: posts, meta });
};

export const getPostById = async (req, res) => {
  const post = await postService.viewPost(Number(req.params.postId), {
    userId: req.user?.id,
    ip: req.ip,
  });

  res.status(200).json({ success: true, data: post });
};

export const createPost = async (req, res) => {
  const post = await postService.createPost(req.user.id, req.body);

  res.status(201).json({ success: true, data: post });
};

export const updatePost = async (req, res) => {
  const post = await postService.updatePost(req.user.id, Number(req.params.postId), req.body);

  res.status(200).json({ success: true, data: post });
};

export const deletePost = async (req, res) => {
  await postService.deletePost(req.user.id, Number(req.params.postId));

  res.status(204).end();
};

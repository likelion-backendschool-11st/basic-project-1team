import { BadRequestError } from '../../common/error/http-errors.js';
import {
  parseId,
  parseKeyword,
  parseOptionalId,
  parsePagination,
} from '../../common/utils/request.js';

import * as postService from './post.service.js';

const DEFAULT_PAGE_SIZE = 10;
const SORTS = ['latest', 'oldest'];

const parseSort = (value) => {
  if (value === undefined) {
    return 'latest';
  }

  if (!SORTS.includes(value)) {
    throw new BadRequestError('VALIDATION_ERROR', `sort는 ${SORTS.join(' / ')} 중 하나입니다.`);
  }

  return value;
};

// 회원은 회원 id, 비회원은 IP 로 조회수 중복을 막는다 (API_SPEC 1.10)
const getViewerKey = (req) => (req.user === null ? `ip:${req.ip}` : `u:${req.user.id}`);

export const getPosts = async (req, res) => {
  const { posts, meta } = await postService.getPosts(req.user, {
    ...parsePagination(req.query, DEFAULT_PAGE_SIZE),
    sort: parseSort(req.query.sort),
    keyword: parseKeyword(req.query.keyword),
    authorId: parseOptionalId(req.query.authorId, 'authorId'),
  });

  res.status(200).json({ success: true, data: posts, meta });
};

export const getPostById = async (req, res) => {
  const postId = parseId(req.params.postId, 'postId');
  const post = await postService.viewPost(postId, req.user, getViewerKey(req));

  res.status(200).json({ success: true, data: post });
};

export const createPost = async (req, res) => {
  const post = await postService.createPost(req.user, req.body);

  res.status(201).json({ success: true, data: post });
};

export const updatePost = async (req, res) => {
  const postId = parseId(req.params.postId, 'postId');
  const post = await postService.updatePost(req.user, postId, req.body);

  res.status(200).json({ success: true, data: post });
};

export const deletePost = async (req, res) => {
  const postId = parseId(req.params.postId, 'postId');

  await postService.deletePost(req.user, postId);

  res.status(204).end();
};

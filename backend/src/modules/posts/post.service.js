import { ForbiddenError, NotFoundError } from '../../common/error/http-errors.js';
import { validateRichTextLength } from '../../common/utils/html.js';
import { toUserSummary } from '../../common/utils/user-summary.js';
import { withTransaction } from '../../config/database.js';
import * as attachmentService from '../attachments/attachment.service.js';
import * as viewHistoryService from '../view-histories/view-history.service.js';

import * as postRepository from './post.repository.js';

// 첨부 연결·조회 기록에서 게시글을 가리키는 target_type
const TARGET_TYPE = 'post';

// 게시글 본문은 1자 이상 (API 명세 1.9)
const BODY_MIN_LENGTH = 1;

const throwPostNotFound = () => {
  throw new NotFoundError('POST_NOT_FOUND', '게시글을 찾을 수 없습니다.');
};

const toPostSummary = (row, userId) => ({
  id: row.id,
  title: row.title,
  author: toUserSummary(row, 'author'),
  viewCount: row.view_count,
  commentCount: row.comment_count,
  isMine: row.author_id === userId,
  createdAt: row.created_at,
});

// 화면의 "수정일"은 행 변경 시각(updated_at)이 아니라 제목·본문 수정 시각(edited_at)을 쓴다
// (조회수만 올라도 updated_at 은 바뀐다. DB 설계서 1장)
const toPostDetail = (row, userId) => ({
  ...toPostSummary(row, userId),
  body: row.body,
  isEdited: row.edited_at !== null,
  updatedAt: row.edited_at ?? row.created_at,
});

// 본문을 정리하고 길이 규칙을 검사한다. 사용 중인 에디터 이미지만 남기고 그 id를 함께 돌려준다
const prepareBody = async (rawBody) => {
  const prepared = await attachmentService.sanitizeEditorBody(rawBody);
  validateRichTextLength(prepared.body, { minLength: BODY_MIN_LENGTH });

  return prepared;
};

// 잠근 게시글이 수정·삭제할 수 있는 상태이고 요청한 회원이 작성자인지 확인한다
const ensurePostOwner = (post, userId) => {
  if (post === null || post.status !== 'active') {
    throwPostNotFound();
  }

  // TODO: content_manage 권한 회원도 허용하고 활동 로그(MODERATE_EDIT·MODERATE_DELETE)를 남긴다 (#57)
  if (post.author_id !== userId) {
    throw new ForbiddenError('FORBIDDEN', '게시글 작성자만 수정·삭제할 수 있습니다.');
  }
};

export const getPosts = async (userId, { page, size, sort, keyword, authorId }) => {
  const filter = { keyword, authorId };

  const [rows, totalCount] = await Promise.all([
    postRepository.findPosts({ filter, sort, limit: size, offset: (page - 1) * size }),
    postRepository.countPosts(filter),
  ]);

  return {
    posts: rows.map((row) => toPostSummary(row, userId)),
    meta: { page, size, totalCount },
  };
};

// 조회수는 올리지 않는다. 상세 화면 조회는 viewPost를 쓴다
export const getPostById = async (postId, userId) => {
  const row = await postRepository.findPostById(postId);

  if (row === null) {
    throwPostNotFound();
  }

  return toPostDetail(row, userId);
};

// 트랜잭션 안에서 게시글에 댓글을 붙이기 전에 호출한다. 게시글 행을 공유 잠금으로 잡는다
export const getPostByIdForShare = async (postId) => {
  const post = await postRepository.findPostByIdForShare(postId);

  if (post === null || post.status !== 'active') {
    throwPostNotFound();
  }

  return { id: post.id, authorId: post.author_id };
};

// 게시글 상세 화면 조회. 같은 회원(비회원은 IP)이 24시간 안에 다시 보면 조회수를 올리지 않는다 (REQ-BOARD-011)
export const viewPost = async (postId, viewer) => {
  const post = await getPostById(postId, viewer.userId);

  const isCounted = await withTransaction(async () => {
    const isNewView = await viewHistoryService.recordView(TARGET_TYPE, postId, viewer);

    if (isNewView) {
      await postRepository.updatePostViewCount(postId);
    }

    return isNewView;
  });

  return isCounted ? { ...post, viewCount: post.viewCount + 1 } : post;
};

export const createPost = async (userId, { title, body }) => {
  const prepared = await prepareBody(body);

  const postId = await withTransaction(async () => {
    const createdId = await postRepository.createPost({
      authorId: userId,
      title,
      body: prepared.body,
    });

    await attachmentService.syncEditorImageLinks(TARGET_TYPE, createdId, prepared.imageIds);

    return createdId;
  });

  return getPostById(postId, userId);
};

export const updatePost = async (userId, postId, { title, body }) => {
  const prepared = body === undefined ? undefined : await prepareBody(body);

  await withTransaction(async () => {
    const post = await postRepository.findPostByIdForUpdate(postId);
    ensurePostOwner(post, userId);

    await postRepository.updatePost(postId, {
      title,
      body: prepared?.body,
      editedAt: new Date(),
    });

    if (prepared !== undefined) {
      await attachmentService.syncEditorImageLinks(TARGET_TYPE, postId, prepared.imageIds);
    }
  });

  return getPostById(postId, userId);
};

// 게시글을 삭제 상태로 바꾸고, 에디터 이미지 연결을 끊는다 (API 명세 1.7, 7장)
export const deletePost = async (userId, postId) => {
  await withTransaction(async () => {
    const post = await postRepository.findPostByIdForUpdate(postId);
    ensurePostOwner(post, userId);

    await postRepository.deletePost(postId);
    await attachmentService.deleteAttachmentLinksByTarget(TARGET_TYPE, postId);
  });
};

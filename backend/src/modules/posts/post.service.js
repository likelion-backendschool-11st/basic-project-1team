import { withTransaction } from '../../config/database.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/error/http-errors.js';
import { sanitizeBodyHtml, toPlainText } from '../../common/utils/html.js';
import { assertNotSanctioned, SANCTION_TYPE } from '../../common/utils/sanction.js';
import { canManageContent, toUserSummary } from '../../common/utils/user-summary.js';
import * as commentService from '../comments/comment.service.js';

import * as postRepository from './post.repository.js';
import { BODY_HTML_MAX_LENGTH } from './post.validator.js';

const BODY_TEXT_MAX_LENGTH = 10_000;

const postNotFound = () => new NotFoundError('POST_NOT_FOUND', '게시글을 찾을 수 없습니다.');

const toPostSummary = (row, user) => ({
  id: Number(row.id),
  title: row.title,
  author: toUserSummary({
    id: row.author_id,
    nickname: row.author_nickname,
    profileImageUrl: row.author_profile_image_url,
    status: row.author_status,
  }),
  viewCount: Number(row.view_count),
  commentCount: Number(row.comment_count),
  isMine: user !== null && Number(row.author_id) === user.id,
  createdAt: row.created_at,
});

// 화면의 "수정일"은 행 변경 시각(updated_at)이 아니라 제목·본문 수정 시각(edited_at)을 쓴다
const toPostDetail = (row, user) => {
  const { createdAt, ...summary } = toPostSummary(row, user);

  return {
    ...summary,
    body: row.body,
    isEdited: row.edited_at !== null,
    createdAt,
    updatedAt: row.edited_at ?? createdAt,
  };
};

const normalizeTitle = (title) => title.trim();

/** 허용 목록으로 HTML 을 정리한 뒤 글자 수 규칙을 검사한다 (API_SPEC 1.9) */
const normalizeBody = (body) => {
  const html = sanitizeBodyHtml(body);
  const textLength = [...toPlainText(html)].length;

  if (textLength < 1) {
    throw new BadRequestError('VALIDATION_ERROR', '본문을 1자 이상 입력해주세요.');
  }

  if (textLength > BODY_TEXT_MAX_LENGTH) {
    throw new BadRequestError(
      'VALIDATION_ERROR',
      `본문은 최대 ${BODY_TEXT_MAX_LENGTH.toLocaleString('ko-KR')}자입니다.`,
    );
  }

  if (html.length > BODY_HTML_MAX_LENGTH) {
    throw new BadRequestError(
      'VALIDATION_ERROR',
      `본문 HTML은 최대 ${BODY_HTML_MAX_LENGTH.toLocaleString('ko-KR')}자입니다.`,
    );
  }

  return html;
};

const normalizePostInput = ({ title, body }) => ({
  title: title === undefined ? undefined : normalizeTitle(title),
  body: body === undefined ? undefined : normalizeBody(body),
});

/** 수정·삭제 권한 확인. 행을 잠근 상태에서 부른다 */
const lockManageablePost = async (connection, postId, user) => {
  const post = await postRepository.findActivePostByIdForUpdate(connection, postId);

  if (post === null) {
    throw postNotFound();
  }

  if (!canManageContent(user, post.author_id)) {
    throw new ForbiddenError('FORBIDDEN', '게시글을 수정·삭제할 권한이 없습니다.');
  }

  // TODO: 작성자가 아닌 content_manage 회원이 수정·삭제하면 활동 로그(MODERATE_EDIT/DELETE) 기록
  return post;
};

export const getPosts = async (user, { keyword, authorId, sort, page, size, limit, offset }) => {
  const filter = { keyword, authorId };
  const [rows, totalCount] = await Promise.all([
    postRepository.findPosts({ ...filter, sort, limit, offset }),
    postRepository.countPosts(filter),
  ]);

  return {
    posts: rows.map((row) => toPostSummary(row, user)),
    meta: { page, size, totalCount },
  };
};

/** 조회수를 올리지 않고 읽는다. 없거나 숨김·삭제면 404 */
export const getPostById = async (postId, user = null) => {
  const row = await postRepository.findActivePostById(postId);

  if (row === null) {
    throw postNotFound();
  }

  return toPostDetail(row, user);
};

/** 게시글 상세 화면 조회. 같은 조회자는 24시간에 한 번만 조회수를 올린다 (REQ-BOARD-011) */
export const viewPost = async (postId, user, viewerKey) =>
  withTransaction(async (connection) => {
    // 조회는 잠그지 않는다. 조회수 증가는 UPDATE 한 문장이라 동시에 와도 빠지지 않는다
    const post = await postRepository.findActivePostById(postId, connection);

    if (post === null) {
      throw postNotFound();
    }

    const isNewView = await postRepository.recordPostView(connection, postId, viewerKey);

    if (!isNewView) {
      return toPostDetail(post, user);
    }

    await postRepository.increasePostViewCount(connection, postId);

    return toPostDetail({ ...post, view_count: Number(post.view_count) + 1 }, user);
  });

export const createPost = async (user, data) => {
  assertNotSanctioned(user, [SANCTION_TYPE.WRITE_BAN]);

  const { title, body } = normalizePostInput(data);
  const postId = await withTransaction((connection) =>
    postRepository.createPost(connection, { authorId: user.id, title, body }),
  );

  // TODO: 본문 <img src> 의 에디터 이미지를 attachment_links 로 연결 (첨부파일 API 도입 후, #64)
  return getPostById(postId, user);
};

export const updatePost = async (user, postId, data) => {
  assertNotSanctioned(user, [SANCTION_TYPE.WRITE_BAN]);

  const input = normalizePostInput(data);

  await withTransaction(async (connection) => {
    await lockManageablePost(connection, postId, user);
    await postRepository.updatePost(connection, postId, input);
  });

  return getPostById(postId, user);
};

/** 게시글과 댓글을 함께 삭제 상태로 바꾼다 (API_SPEC 1.7) */
export const deletePost = async (user, postId) => {
  assertNotSanctioned(user);

  await withTransaction(async (connection) => {
    await lockManageablePost(connection, postId, user);
    await postRepository.deletePost(connection, postId);
    await commentService.deleteCommentsByPostId(connection, postId);
  });
};

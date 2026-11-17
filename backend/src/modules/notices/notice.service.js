import { NotFoundError } from '../../common/error/http-errors.js';
import { validateRichTextLength } from '../../common/utils/html.js';
import { toUserSummary } from '../../common/utils/user-summary.js';
import * as attachmentService from '../attachments/attachment.service.js';

import * as noticeRepository from './notice.repository.js';

const TARGET_TYPE = 'notice';
// 공지 본문은 1자 이상 (API 명세 1.9)
const BODY_MIN_LENGTH = 1;

const throwNoticeNotFound = () => {
  throw new NotFoundError('NOTICE_NOT_FOUND', '공지를 찾을 수 없습니다.');
};

// 목록 응답에는 본문을 넣지 않는다 (API 명세 9장). 관리자 목록은 수정 화면을 위해 본문을 넣는다
const toNotice = (row) => ({
  id: row.id,
  title: row.title,
  ...(row.body === undefined ? {} : { body: row.body }),
  isPinned: row.is_pinned === 1,
  author: toUserSummary(row, 'author'),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/** 공지 목록 (API 명세 9장 GET /api/notices, 10.7 GET /api/admin/notices) */
export const getNotices = async ({ page, size, withBody = false }) => {
  const [rows, totalCount] = await Promise.all([
    noticeRepository.findActiveNotices({ limit: size, offset: (page - 1) * size, withBody }),
    noticeRepository.countActiveNotices(),
  ]);

  return { notices: rows.map(toNotice), meta: { page, size, totalCount } };
};

export const getNoticeById = async (noticeId) => {
  const row = await noticeRepository.findActiveNoticeById(noticeId);

  if (row === null) {
    throwNoticeNotFound();
  }

  return toNotice(row);
};

/**
 * 본문 HTML을 저장 규칙대로 정리하고(허용 태그, 사용 중인 에디터 이미지만) 글자 수를 검사한다 (API 명세 1.9).
 * 이미지 조회가 있으므로 트랜잭션 밖에서 먼저 부른다.
 */
export const prepareNoticeBody = async (rawBody) => {
  const prepared = await attachmentService.sanitizeEditorBody(rawBody);
  validateRichTextLength(prepared.body, { minLength: BODY_MIN_LENGTH });

  return prepared;
};

// 아래 쓰기 함수는 관리자 공지 관리(admin 모듈)가 활동 로그와 같은 트랜잭션 안에서 부른다

export const createNotice = async (authorId, { title, body, imageIds, isPinned }) => {
  const noticeId = await noticeRepository.createNotice({ authorId, title, body, isPinned });
  await attachmentService.syncEditorImageLinks(TARGET_TYPE, noticeId, imageIds);

  return noticeId;
};

/** 수정·삭제 전에 공지를 잠그고 읽는다. 없거나 삭제됐으면 404 */
export const findNoticeForUpdate = async (noticeId) => {
  const row = await noticeRepository.findActiveNoticeByIdForUpdate(noticeId);

  if (row === null) {
    throwNoticeNotFound();
  }

  return { id: row.id, title: row.title, body: row.body, isPinned: row.is_pinned === 1 };
};

/** next: 바꾼 뒤의 제목·본문·고정 여부 전체. imageIds를 주면 본문 이미지 연결도 맞춘다 */
export const updateNotice = async (noticeId, { title, body, isPinned }, imageIds) => {
  await noticeRepository.updateNotice(noticeId, { title, body, isPinned });

  if (imageIds !== undefined) {
    await attachmentService.syncEditorImageLinks(TARGET_TYPE, noticeId, imageIds);
  }
};

// 삭제 상태로 바꾸고 본문 이미지 연결만 끊는다 (API 명세 1.7)
export const deleteNotice = async (noticeId) => {
  await noticeRepository.deleteNotice(noticeId);
  await attachmentService.deleteAttachmentLinksByTarget(TARGET_TYPE, noticeId);
};

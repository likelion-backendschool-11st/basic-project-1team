import { randomUUID } from 'node:crypto';

import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../common/error/http-errors.js';
import { deleteFileByUrl, saveFile } from '../../common/utils/file-storage.js';
import { findImageSources, sanitizeRichText } from '../../common/utils/html.js';
import { logger } from '../../common/utils/logger.js';
import { withTransaction } from '../../config/database.js';

import * as attachmentRepository from './attachment.repository.js';

// 본문 <img src>로 쓸 수 있는 것은 사용 중인 에디터 이미지뿐이다 (API 명세 6장)
export const findEditorImagesByUrls = async (urls) => {
  if (urls.length === 0) {
    return [];
  }

  return attachmentRepository.findActiveEditorImagesByUrls(urls);
};

// 본문 HTML을 정리하면서 <img>는 사용 중인 에디터 이미지만 남긴다. 연결할 이미지 id를 함께 돌려준다
export const sanitizeEditorBody = async (rawBody) => {
  const images = await findEditorImagesByUrls(findImageSources(rawBody));
  const body = sanitizeRichText(rawBody, new Set(images.map((image) => image.url)));

  return { body, imageIds: images.map((image) => image.id) };
};

// 글의 에디터 이미지 연결을 본문에 있는 이미지와 같게 맞춘다.
// 본문에서 빠진 이미지는 연결을 끊고, 다시 들어온 이미지는 끊긴 행을 되살린다 (DB 설계서 4.13)
export const syncEditorImageLinks = async (targetType, targetId, attachmentIds) => {
  const links = await attachmentRepository.findAttachmentLinksByTarget(targetType, targetId);
  const linksByAttachmentId = new Map(links.map((link) => [link.attachment_id, link]));
  const nextAttachmentIds = new Set(attachmentIds);

  const unlinkIds = links
    .filter((link) => link.deleted_at === null && !nextAttachmentIds.has(link.attachment_id))
    .map((link) => link.id);
  const relinkIds = attachmentIds
    .map((attachmentId) => linksByAttachmentId.get(attachmentId))
    .filter((link) => link !== undefined && link.deleted_at !== null)
    .map((link) => link.id);
  const newAttachmentIds = attachmentIds.filter(
    (attachmentId) => !linksByAttachmentId.has(attachmentId),
  );

  if (unlinkIds.length > 0) {
    await attachmentRepository.updateAttachmentLinksDeletedAt(unlinkIds, new Date());
  }

  if (relinkIds.length > 0) {
    await attachmentRepository.updateAttachmentLinksDeletedAt(relinkIds, null);
  }

  if (newAttachmentIds.length > 0) {
    await attachmentRepository.createAttachmentLinks(targetType, targetId, newAttachmentIds);
  }
};

// 글을 삭제하면 그 글의 연결만 끊는다. 파일은 연결이 하나도 남지 않을 때 정리 작업이 지운다
export const deleteAttachmentLinksByTarget = async (targetType, targetId) => {
  await attachmentRepository.deleteAttachmentLinksByTarget(targetType, targetId);
};

// 신고 증빙으로 쓸 수 있는 파일: 신고자가 올린 사용 중인 report_evidence이고 다른 신고에 연결되지 않은 것.
// 신고 증빙은 신고 1건에만 연결한다 (API 명세 6장, DB 설계서 4.13)
export const linkReportEvidences = async (uploaderId, reportId, attachmentIds) => {
  if (attachmentIds.length === 0) {
    return;
  }

  const attachments = await attachmentRepository.findAttachmentsByIds(attachmentIds);
  const isUsable = (attachment) =>
    attachment.uploader_id === uploaderId &&
    attachment.purpose === 'report_evidence' &&
    attachment.status === 'active' &&
    attachment.has_active_link === 0;

  if (attachments.length !== attachmentIds.length || !attachments.every(isUsable)) {
    throw new BadRequestError('ATTACHMENT_INVALID', '사용할 수 없는 첨부파일이 있습니다.');
  }

  await attachmentRepository.createOrderedAttachmentLinks('report', reportId, attachmentIds);
};

// 파일 형식은 클라이언트가 보낸 이름·Content-Type이 아니라 파일 앞부분(시그니처)으로 판단한다
const IMAGE_TYPES = {
  png: {
    mimeType: 'image/png',
    matches: (buffer) =>
      buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  jpg: {
    mimeType: 'image/jpeg',
    matches: (buffer) => buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
  },
  gif: {
    mimeType: 'image/gif',
    matches: (buffer) => ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('latin1')),
  },
  webp: {
    mimeType: 'image/webp',
    matches: (buffer) =>
      buffer.subarray(0, 4).toString('latin1') === 'RIFF' &&
      buffer.subarray(8, 12).toString('latin1') === 'WEBP',
  },
};

// 용도별 허용 형식 (API 명세 6장)
const ALLOWED_TYPES = {
  editor_image: ['png', 'jpg', 'gif', 'webp'],
  report_evidence: ['png', 'jpg', 'webp'],
};

const ORIGINAL_NAME_MAX_LENGTH = 15;

const detectImageType = (buffer) =>
  Object.keys(IMAGE_TYPES).find((type) => IMAGE_TYPES[type].matches(buffer)) ?? null;

// 원본 파일명은 최대 15자. 더 길면 확장자는 두고 앞부분만 남긴다 (API 명세 1.6)
// 예: error-screen-2024.png → error-scree.png
const shortenFileName = (fileName, fallbackExtension) => {
  const baseName = fileName.split(/[\\/]/).pop().trim() || `image.${fallbackExtension}`;
  const characters = Array.from(baseName);

  if (characters.length <= ORIGINAL_NAME_MAX_LENGTH) {
    return baseName;
  }

  const dotIndex = baseName.lastIndexOf('.');
  const extension = dotIndex > 0 ? baseName.slice(dotIndex) : '';
  const extensionLength = Array.from(extension).length;

  if (extensionLength === 0 || extensionLength >= ORIGINAL_NAME_MAX_LENGTH) {
    return characters.slice(0, ORIGINAL_NAME_MAX_LENGTH).join('');
  }

  const name = Array.from(baseName.slice(0, dotIndex));

  return name.slice(0, ORIGINAL_NAME_MAX_LENGTH - extensionLength).join('') + extension;
};

// 저장 경로: <용도>/<연>/<월>/<uuid>.<확장자>. 이름을 추측할 수 없게 uuid를 쓴다
const createStorageKey = (purpose, extension) => {
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');

  return `${purpose}/${now.getUTCFullYear()}/${month}/${randomUUID()}.${extension}`;
};

const toAttachment = ({ id, originalName, url, size, kind }) => ({
  id,
  name: originalName,
  url,
  size,
  kind,
});

export const uploadAttachment = async (uploaderId, { purpose, file }) => {
  const type = detectImageType(file.buffer);

  if (type === null || !ALLOWED_TYPES[purpose].includes(type)) {
    const allowed = ALLOWED_TYPES[purpose].map((name) => name.toUpperCase()).join(', ');

    throw new BadRequestError('FILE_TYPE_NOT_ALLOWED', `${allowed} 파일만 올릴 수 있습니다.`);
  }

  const attachment = {
    uploaderId,
    purpose,
    kind: 'image',
    originalName: shortenFileName(file.originalname, type),
    url: await saveFile(createStorageKey(purpose, type), file.buffer),
    mimeType: IMAGE_TYPES[type].mimeType,
    size: file.size,
  };

  try {
    const id = await attachmentRepository.createAttachment(attachment);

    return toAttachment({ id, ...attachment });
  } catch (error) {
    // DB에 남기지 못한 파일은 저장소에 남지 않게 지운다
    await deleteFileByUrl(attachment.url);
    throw error;
  }
};

// 아직 글에 연결되지 않은 신고 증빙을 지운다. 행은 deleted로 남기고 저장소의 파일은 지운다 (API 명세 6장, 1.7)
export const deleteAttachment = async (userId, attachmentId) => {
  const url = await withTransaction(async () => {
    const attachment = await attachmentRepository.findAttachmentByIdForUpdate(attachmentId);

    if (attachment === null || attachment.status !== 'active') {
      throw new NotFoundError('ATTACHMENT_NOT_FOUND', '첨부파일을 찾을 수 없습니다.');
    }

    if (attachment.uploader_id !== userId) {
      throw new ForbiddenError('FORBIDDEN', '업로드한 회원만 삭제할 수 있습니다.');
    }

    // 에디터 이미지는 본문에서 빼고 글을 저장하면 연결이 끊기고, 정리 작업이 지운다 (#129)
    if (attachment.purpose === 'editor_image') {
      throw new ForbiddenError('FORBIDDEN', '에디터 이미지는 본문에서 지우면 자동으로 정리됩니다.');
    }

    if (attachment.has_active_link === 1) {
      throw new ConflictError('ATTACHMENT_IN_USE', '이미 글에 연결된 첨부파일입니다.');
    }

    await attachmentRepository.deleteAttachment(attachmentId);

    return attachment.url;
  });

  // DB는 이미 deleted라 파일 삭제가 실패해도 요청은 성공으로 처리하고 기록만 남긴다
  try {
    await deleteFileByUrl(url);
  } catch (error) {
    logger.error(error);
  }
};

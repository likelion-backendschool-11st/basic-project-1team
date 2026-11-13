import { BadRequestError } from '../../common/error/http-errors.js';
import { findImageSources, sanitizeRichText } from '../../common/utils/html.js';

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

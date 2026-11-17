import { getExecutor } from '../../config/database.js';

export const findActiveEditorImagesByUrls = async (urls) => {
  const [rows] = await getExecutor().query(
    `SELECT id, url
     FROM attachments
     WHERE url IN (?) AND purpose = 'editor_image' AND status = 'active'`,
    [urls],
  );

  return rows;
};

// 끊긴 연결까지 모두 가져온다. 같은 글에 다시 연결할 때 새 행 대신 그 행을 되살린다
export const findAttachmentLinksByTarget = async (targetType, targetId) => {
  const [rows] = await getExecutor().query(
    `SELECT id, attachment_id, deleted_at
     FROM attachment_links
     WHERE target_type = ? AND target_id = ?`,
    [targetType, targetId],
  );

  return rows;
};

export const createAttachmentLinks = async (targetType, targetId, attachmentIds) => {
  await getExecutor().query(
    'INSERT INTO attachment_links (attachment_id, target_type, target_id) VALUES ?',
    [attachmentIds.map((attachmentId) => [attachmentId, targetType, targetId])],
  );
};

export const updateAttachmentLinksDeletedAt = async (linkIds, deletedAt) => {
  await getExecutor().query('UPDATE attachment_links SET deleted_at = ? WHERE id IN (?)', [
    deletedAt,
    linkIds,
  ]);
};

export const deleteAttachmentLinksByTarget = async (targetType, targetId) => {
  await getExecutor().query(
    `UPDATE attachment_links
     SET deleted_at = NOW(3)
     WHERE target_type = ? AND target_id = ? AND deleted_at IS NULL`,
    [targetType, targetId],
  );
};

// 첨부파일과, 지금 연결된 글이 있는지(has_active_link).
// 행을 잠가 같은 파일을 동시에 연결하거나 삭제하지 못하게 한다 (트랜잭션 안에서 호출)
export const findAttachmentsByIds = async (attachmentIds) => {
  const [rows] = await getExecutor().query(
    `SELECT
       a.id,
       a.uploader_id,
       a.purpose,
       a.url,
       a.status,
       EXISTS (
         SELECT 1 FROM attachment_links l WHERE l.attachment_id = a.id AND l.deleted_at IS NULL
       ) AS has_active_link
     FROM attachments a
     WHERE a.id IN (?)
     FOR UPDATE OF a`,
    [attachmentIds],
  );

  return rows;
};

// 신고 증빙처럼 순서가 있는 연결. sort_order는 1부터 (에디터 이미지는 0)
export const createOrderedAttachmentLinks = async (targetType, targetId, attachmentIds) => {
  await getExecutor().query(
    'INSERT INTO attachment_links (attachment_id, target_type, target_id, sort_order) VALUES ?',
    [attachmentIds.map((attachmentId, index) => [attachmentId, targetType, targetId, index + 1])],
  );
};

export const createAttachment = async ({
  uploaderId,
  purpose,
  kind,
  originalName,
  url,
  mimeType,
  size,
}) => {
  const [result] = await getExecutor().query(
    `INSERT INTO attachments (uploader_id, purpose, kind, original_name, url, mime_type, size)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [uploaderId, purpose, kind, originalName, url, mimeType, size],
  );

  return result.insertId;
};

export const findAttachmentByIdForUpdate = async (attachmentId) => {
  const [attachment] = await findAttachmentsByIds([attachmentId]);

  return attachment ?? null;
};

// 정리 후보: 업로드 후 일정 시간이 지났는데 남은 연결이 없는 사용 중인 파일.
// idx_attachments_status_created 로 오래된 파일만 읽고, 연결 여부는 idx_attachment_links_attachment 로 본다 (DB 설계서 4.12).
// 잠그면 읽은 행이 모두 잠기므로 잠그지 않고 고른 뒤 후보만 findAttachmentsByIds 로 잠근다
export const findUnlinkedAttachmentIds = async (olderThanHours, limit) => {
  const [rows] = await getExecutor().query(
    `SELECT a.id
     FROM attachments a
     WHERE a.status = 'active'
       AND a.created_at < NOW(3) - INTERVAL ? HOUR
       AND NOT EXISTS (
         SELECT 1 FROM attachment_links l WHERE l.attachment_id = a.id AND l.deleted_at IS NULL
       )
     ORDER BY a.created_at, a.id
     LIMIT ?`,
    [olderThanHours, limit],
  );

  return rows.map((row) => row.id);
};

// 잠근 정리 후보 중 그 사이 연결이 생긴 파일. 다른 트랜잭션이 커밋한 연결까지 보도록 잠금 읽기를 쓴다
export const findLinkedAttachmentIdsForShare = async (attachmentIds) => {
  const [rows] = await getExecutor().query(
    `SELECT DISTINCT attachment_id
     FROM attachment_links
     WHERE attachment_id IN (?) AND deleted_at IS NULL
     FOR SHARE`,
    [attachmentIds],
  );

  return rows.map((row) => row.attachment_id);
};

// 글에 연결하기 직전에 파일이 아직 사용 중인지 다시 보고, 정리 작업이 지우지 못하게 잠근다 (트랜잭션 안에서 호출)
export const findActiveAttachmentIdsForShare = async (attachmentIds) => {
  const [rows] = await getExecutor().query(
    "SELECT id FROM attachments WHERE id IN (?) AND status = 'active' FOR SHARE",
    [attachmentIds],
  );

  return rows.map((row) => row.id);
};

export const deleteAttachments = async (attachmentIds) => {
  await getExecutor().query(
    "UPDATE attachments SET status = 'deleted', deleted_at = NOW(3) WHERE id IN (?)",
    [attachmentIds],
  );
};

export const deleteAttachment = async (attachmentId) => {
  await getExecutor().query(
    "UPDATE attachments SET status = 'deleted', deleted_at = NOW(3) WHERE id = ?",
    [attachmentId],
  );
};

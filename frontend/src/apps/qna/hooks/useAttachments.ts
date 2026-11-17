import { useRef, useState, type ChangeEvent } from 'react';
import type { Attachment } from '../data/types';

/** 신고 증빙 1건당 첨부 상한 (API_SPEC 6장). 질문·답변 본문 이미지·영상은 에디터로 넣는다 */
export const MAX_ATTACHMENTS = 3;
const FILE_NAME_MAX = 15;
/** 신고 증빙 허용 형식·크기 (API_SPEC 6장). 서버도 파일 내용으로 다시 확인한다 */
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** 고른 증빙 파일. 신고를 접수할 때 file 을 올린다 */
export interface SelectedFile extends Attachment {
  readonly file: File;
}

/** 서버와 같은 규칙: 확장자는 두고 앞부분만 남겨 15자로 줄인다 (API_SPEC 1.6) */
function shortenFileName(name: string): string {
  if (name.length <= FILE_NAME_MAX) return name;
  const dot = name.lastIndexOf('.');
  const ext = dot > 0 ? name.slice(dot) : '';
  return name.slice(0, Math.max(FILE_NAME_MAX - ext.length, 1)) + ext;
}

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;

export function useAttachments(
  limitMessage = `첨부파일은 최대 ${MAX_ATTACHMENTS}개까지 올릴 수 있습니다.`,
  invalidMessage = 'PNG, JPG, WEBP 이미지만 10MB 이하로 올릴 수 있습니다.',
) {
  const [items, setItems] = useState<SelectedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => inputRef.current?.click();

  const onFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    const valid = picked.filter((f) => ALLOWED_TYPES.includes(f.type) && f.size <= MAX_FILE_SIZE);
    if (valid.length < picked.length) window.alert(invalidMessage);
    const room = MAX_ATTACHMENTS - items.length;
    if (valid.length > room) window.alert(limitMessage);
    setItems((prev) => [
      ...prev,
      ...valid.slice(0, Math.max(room, 0)).map((file) => ({
        id: `${file.name}-${file.lastModified}-${file.size}`,
        name: shortenFileName(file.name),
        size: formatSize(file.size),
        kind: 'image' as const,
        file,
      })),
    ]);
    e.target.value = '';
  };

  const remove = (id: string) => setItems((prev) => prev.filter((a) => a.id !== id));

  return { items, inputRef, openPicker, onFilesSelected, remove };
}

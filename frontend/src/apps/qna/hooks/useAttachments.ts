import { useRef, useState, type ChangeEvent } from 'react';
import type { Attachment } from '../data/types';

const LOG_EXT = /\.(log|txt)$/i;

/** 질문·답변·신고 1건당 첨부 상한 (API_SPEC 6장) */
export const MAX_ATTACHMENTS = 3;
const FILE_NAME_MAX = 15;

/** 서버와 같은 규칙: 확장자는 두고 앞부분만 남겨 15자로 줄인다 (API_SPEC 1.6) */
function shortenFileName(name: string): string {
  if (name.length <= FILE_NAME_MAX) return name;
  const dot = name.lastIndexOf('.');
  const ext = dot > 0 ? name.slice(dot) : '';
  return name.slice(0, Math.max(FILE_NAME_MAX - ext.length, 1)) + ext;
}

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

export function useAttachments(initial: readonly Attachment[], limitMessage = `첨부파일은 최대 ${MAX_ATTACHMENTS}개까지 올릴 수 있습니다.`) {
  const [items, setItems] = useState<Attachment[]>([...initial]);
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => inputRef.current?.click();

  const onFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const room = MAX_ATTACHMENTS - items.length;
    if (files.length > room) window.alert(limitMessage);
    setItems((prev) => [
      ...prev,
      ...files.slice(0, Math.max(room, 0)).map((f) => ({
        id: `${f.name}-${f.lastModified}`,
        name: shortenFileName(f.name),
        size: formatSize(f.size),
        kind: LOG_EXT.test(f.name) ? ('log' as const) : ('image' as const),
      })),
    ]);
    e.target.value = '';
  };

  const remove = (id: string) => setItems((prev) => prev.filter((a) => a.id !== id));

  return { items, inputRef, openPicker, onFilesSelected, remove } as const;
}

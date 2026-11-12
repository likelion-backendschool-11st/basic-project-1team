import { useRef, useState, type ChangeEvent } from 'react';
import type { Attachment } from '../data/types';

const LOG_EXT = /\.(log|txt)$/i;

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

export function useAttachments(initial: readonly Attachment[]) {
  const [items, setItems] = useState<Attachment[]>([...initial]);
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => inputRef.current?.click();

  const onFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setItems((prev) => [
      ...prev,
      ...files.map((f) => ({
        id: `${f.name}-${f.lastModified}`,
        name: f.name,
        size: formatSize(f.size),
        kind: LOG_EXT.test(f.name) ? ('log' as const) : ('image' as const),
      })),
    ]);
    e.target.value = '';
  };

  const remove = (id: string) => setItems((prev) => prev.filter((a) => a.id !== id));

  return { items, inputRef, openPicker, onFilesSelected, remove } as const;
}

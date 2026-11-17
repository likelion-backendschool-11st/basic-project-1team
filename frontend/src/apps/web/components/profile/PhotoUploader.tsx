import React from 'react';
import { Icon } from '../ui/Icon';

interface PhotoUploaderProps {
  readonly id: string;
  readonly backgroundUrl: string;
  /** Newly picked image preview; replaces the background when present. */
  readonly previewUrl: string | null;
  readonly accept: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
  readonly hoverTitle: string;
  readonly hoverDescription: string;
  readonly onSelect: (file: File | undefined) => void;
  readonly removeLabel: string;
  /** 있으면 사진 삭제 버튼을 보여 준다 (보여 줄 사진이 있을 때만 넘긴다) */
  readonly onRemove?: () => void;
}

/** Click-to-upload profile photo card with hover overlay. */
export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  id,
  backgroundUrl,
  previewUrl,
  accept,
  emptyTitle,
  emptyDescription,
  hoverTitle,
  hoverDescription,
  onSelect,
  removeLabel,
  onRemove,
}) => (
  <div className="relative">
    <label
      htmlFor={id}
      className="group relative flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl bg-surface-2 shadow-md transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/60 sm:aspect-[16/10]"
    >
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 ${previewUrl ? 'opacity-100' : 'opacity-60'}`}
        style={{ backgroundImage: `url('${previewUrl ?? backgroundUrl}')` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-canvas/90 via-surface-1/40 to-transparent"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-1/70 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-lg transition-transform group-hover:scale-110">
          <Icon name="photo_camera" className="text-[24px]" />
        </div>
        <span className="font-headline-sm text-headline-sm text-ink">{hoverTitle}</span>
        <span className="font-body-sm text-body-sm text-ink-subtle">{hoverDescription}</span>
      </div>

      {/* Resting state */}
      <div className="relative z-10 flex flex-col items-center gap-2 p-4 text-center transition-opacity duration-200 group-hover:opacity-0">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-3/80 text-primary shadow-inner backdrop-blur-sm">
          <Icon name="add_a_photo" className="text-[28px]" />
        </div>
        <p className="font-body-lg text-body-lg font-semibold text-ink">{emptyTitle}</p>
        <p className="font-body-sm text-body-sm text-ink-muted">{emptyDescription}</p>
      </div>

      <input
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          onSelect(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </label>
    {/* label 밖에 두어 누를 때 파일 선택 창이 열리지 않게 한다 */}
    {onRemove && (
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-space-sm top-space-sm z-20 inline-flex items-center gap-1 rounded-lg bg-canvas/80 px-2.5 py-1.5 font-label-md text-label-md text-ink-muted backdrop-blur-sm transition-colors hover:bg-semantic-danger/20 hover:text-semantic-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-semantic-danger/60"
      >
        <Icon name="delete" className="text-[16px]" />
        <span>{removeLabel}</span>
      </button>
    )}
  </div>
);

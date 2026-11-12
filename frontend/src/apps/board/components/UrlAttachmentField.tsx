import React from 'react';
import { labels } from '../data/mockData';
import { Icon } from './Icon';

interface UrlAttachmentFieldProps {
  readonly draft: string;
  readonly onDraftChange: (value: string) => void;
  readonly urls: string[];
  readonly onAdd: () => void;
  readonly onRemove: (index: number) => void;
}

const isVideo = (url: string) => /youtu|twitch/i.test(url);

export const UrlAttachmentField: React.FC<UrlAttachmentFieldProps> = ({
  draft,
  onDraftChange,
  urls,
  onAdd,
  onRemove,
}) => (
  <div className="flex flex-col gap-3 rounded-xl bg-raised-light p-4 dark:bg-raised-dark/60">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-sm font-medium text-ink-light dark:text-ink-dark">
        <Icon name="link" className="text-[18px] text-accent-light dark:text-accent-dark" />
        {labels.write.urlHeading}
      </div>
      <span className="font-mono text-xs text-ink-subtle-light dark:text-ink-subtle-dark">
        {labels.write.urlHint}
      </span>
    </div>

    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Icon
          name="find_replace"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-ink-faint-light dark:text-ink-subtle-dark"
        />
        <input
          type="url"
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder={labels.write.urlPlaceholder}
          aria-label={labels.write.urlHeading}
          className="w-full rounded-control border border-line-light bg-field-light py-2 pl-10 pr-4 font-mono text-xs text-ink-light placeholder-ink-faint-light transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand dark:border-transparent dark:bg-raised-dark dark:text-ink-dark dark:placeholder-ink-subtle-dark"
        />
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-control border border-line-strong-light bg-card-light px-4 py-2 text-sm font-medium text-ink-light transition-colors hover:bg-card-head-light dark:border-transparent dark:bg-raised-dark dark:text-ink-dark dark:hover:bg-field-dark"
      >
        <Icon name="add_circle" className="text-[16px]" />
        {labels.write.urlAdd}
      </button>
    </div>

    {urls.length > 0 && (
      <ul className="flex flex-wrap gap-2 pt-1">
        {urls.map((url, i) => (
          <li
            key={`${url}-${i}`}
            className="inline-flex items-center gap-2 rounded-md bg-card-light px-3 py-1 font-mono text-xs text-ink-muted-light dark:bg-raised-dark dark:text-ink-muted-dark"
          >
            <Icon
              name={isVideo(url) ? 'play_circle' : 'link'}
              className="text-[14px] text-accent-light dark:text-accent-dark"
            />
            <span className="max-w-[280px] truncate">{url}</span>
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label="remove"
              className="ml-1 text-ink-faint-light transition-colors hover:text-warn-light dark:text-ink-subtle-dark dark:hover:text-warn-dark"
            >
              <Icon name="close" className="text-[14px]" />
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

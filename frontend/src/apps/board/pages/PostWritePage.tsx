import React from 'react';
import { BackLink } from '../components/BackLink';
import { Icon } from '../components/Icon';
import { PageCard } from '../components/PageCard';
import { UrlAttachmentField } from '../components/UrlAttachmentField';
import { labels } from '../data/mockData';
import { usePostForm } from '../hooks/usePostForm';

interface PostWritePageProps {
  readonly className?: string;
}

const fieldLabel =
  'flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink-muted-light dark:text-ink-muted-dark';
const fieldBox =
  'w-full rounded-control border border-line-light bg-field-light text-ink-light placeholder-ink-faint-light transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand dark:border-transparent dark:bg-raised-dark/60 dark:text-ink-dark dark:placeholder-ink-subtle-dark dark:focus:bg-raised-dark';

export const PostWritePage: React.FC<PostWritePageProps> = () => {
  const f = usePostForm();
  const w = labels.write;

  return (
    <PageCard padded>
      <div className="flex flex-col gap-1 pb-6">
        <BackLink />
        <div className="mt-2 flex items-center gap-3">
          <span className="inline-block h-2 w-2 rounded-full bg-brand" />
          <h1 className="text-2xl font-bold tracking-tight text-ink-light dark:text-ink-dark">
            {w.title}
          </h1>
          <span className="rounded-full bg-raised-light px-2 py-0.5 font-mono text-xs text-ink-subtle-light dark:bg-raised-dark dark:text-ink-subtle-dark">
            {w.feedTag}
          </span>
        </div>
      </div>

      <form className="flex flex-col gap-6" onSubmit={f.publish}>
        <div className="flex flex-col gap-2">
          <label htmlFor="post-title" className={fieldLabel}>
            <span className="flex items-center gap-1.5">
              {w.titleLabel}
              <span className="text-accent-light dark:text-accent-dark">*</span>
            </span>
            <span className="font-mono font-normal text-ink-subtle-light dark:text-ink-subtle-dark">
              {f.title.length} / {w.titleMax}
            </span>
          </label>
          <input
            id="post-title"
            type="text"
            maxLength={w.titleMax}
            value={f.title}
            onChange={(e) => f.setTitle(e.target.value)}
            placeholder={w.titlePlaceholder}
            className={`${fieldBox} px-4 py-3`}
          />
        </div>

        <UrlAttachmentField
          draft={f.urlDraft}
          onDraftChange={f.setUrlDraft}
          urls={f.urls}
          onAdd={f.addUrl}
          onRemove={f.removeUrl}
        />

        <div className="flex flex-col gap-2">
          <label htmlFor="post-body" className={fieldLabel}>
            <span className="flex items-center gap-1.5">
              {w.bodyLabel}
              <span className="text-accent-light dark:text-accent-dark">*</span>
            </span>
          </label>
          <textarea
            id="post-body"
            value={f.body}
            onChange={(e) => f.setBody(e.target.value)}
            placeholder={w.bodyPlaceholder}
            className={`${fieldBox} min-h-[320px] resize-y rounded-xl p-5 leading-relaxed`}
          />
        </div>

        <div className="my-1 h-px w-full bg-line-light dark:bg-line-dark" />

        <div className="flex flex-col-reverse items-center justify-between gap-4 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={f.cancel}
            className="inline-flex w-full items-center justify-center gap-2 rounded-control bg-raised-light px-6 py-3 text-sm font-medium text-ink-muted-light transition-colors hover:text-ink-light dark:bg-raised-dark dark:text-ink-muted-dark dark:hover:text-ink-dark sm:w-auto"
          >
            <Icon name="close" className="text-[18px]" />
            {w.cancel}
          </button>
          <button
            type="submit"
            disabled={f.publishing}
            className="inline-flex w-full items-center justify-center gap-2 rounded-control bg-brand px-8 py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-brand-hover active:scale-[0.99] disabled:opacity-70 sm:w-auto"
          >
            <Icon
              name={f.publishing ? 'refresh' : 'send'}
              className={`text-[18px] ${f.publishing ? 'animate-spin' : ''}`}
            />
            {f.publishing ? w.publishing : w.publish}
          </button>
        </div>
      </form>
    </PageCard>
  );
};

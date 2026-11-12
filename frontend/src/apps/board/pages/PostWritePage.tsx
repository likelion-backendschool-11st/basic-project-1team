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
  'flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink-muted';
const fieldBox =
  'w-full rounded-lg border transition-all focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container border-hairline bg-surface-1 text-ink placeholder-ink-subtle';

export const PostWritePage: React.FC<PostWritePageProps> = () => {
  const f = usePostForm();
  const w = labels.write;

  return (
    <PageCard padded>
      <div className="flex flex-col gap-1 pb-6">
        <BackLink />
        <div className="mt-2 flex items-center gap-3">
          <span className="inline-block h-2 w-2 rounded-full bg-primary-container" />
          <h1 className="text-2xl font-bold tracking-tight text-ink">{w.title}</h1>
          <span className="rounded-full px-2 py-0.5 font-mono text-xs bg-surface-3 text-ink-subtle">
            {w.feedTag}
          </span>
        </div>
      </div>

      <form className="flex flex-col gap-6" onSubmit={f.publish}>
        <div className="flex flex-col gap-2">
          <label htmlFor="post-title" className={fieldLabel}>
            <span className="flex items-center gap-1.5">
              {w.titleLabel}
              <span className="text-primary">*</span>
            </span>
            <span className="font-mono font-normal text-ink-subtle">
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
              <span className="text-primary">*</span>
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

        <div className="my-1 h-px w-full bg-hairline" />

        <div className="flex flex-col-reverse items-center justify-between gap-4 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={f.cancel}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-colors bg-surface-3 text-ink-muted hover:text-ink sm:w-auto"
          >
            <Icon name="close" className="text-[18px]" />
            {w.cancel}
          </button>
          <button
            type="submit"
            disabled={f.publishing}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container px-8 py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-primary-hover active:scale-[0.99] disabled:opacity-70 sm:w-auto"
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

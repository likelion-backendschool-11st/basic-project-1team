import React from 'react';
import { RichTextView } from '../../../shared/editor/RichTextView';
import { type PostDetail, labels } from '../data/mockData';
import { Icon } from './Icon';
import { PostMeta } from './PostMeta';

interface PostArticleProps {
  readonly post: PostDetail;
  readonly title: string;
  readonly commentCount: number;
}

export const PostArticle: React.FC<PostArticleProps> = ({ post, title, commentCount }) => (
  <article className="mb-10 overflow-hidden rounded-lg border border-hairline bg-surface-1">
    <section className="border-b px-6 py-5 border-hairline bg-surface-3/70 sm:px-8">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-bold leading-snug text-ink sm:text-2xl">{title}</h2>
      </div>
      <PostMeta author={post.author} date={post.date} views={post.views} comments={commentCount} />
    </section>

    <section className="min-h-[280px] space-y-4 p-6 text-sm leading-relaxed text-ink-muted sm:p-8 sm:text-base">
      <RichTextView html={post.body} className="text-ink" />

      <div className="mt-6 border-t pt-8 border-hairline">
        <div className="flex max-w-xl items-center gap-2 truncate rounded-lg border px-3.5 py-2.5 text-xs border-hairline-strong bg-surface-2 sm:text-sm">
          <Icon name="link" className="text-[16px] text-ink-subtle" />
          <span className="font-medium text-ink-muted">{labels.attachment}</span>
          <a
            href={post.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate hover:underline text-primary"
          >
            {post.attachmentUrl}
          </a>
        </div>
      </div>
    </section>
  </article>
);

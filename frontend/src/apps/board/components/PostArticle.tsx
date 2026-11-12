import React from 'react';
import { type PostDetail, labels } from '../data/mockData';
import Icon from './Icon';
import PostMeta from './PostMeta';

interface PostArticleProps {
  readonly post: PostDetail;
  readonly title: string;
  readonly commentCount: number;
}

export const PostArticle: React.FC<PostArticleProps> = ({ post, title, commentCount }) => (
  <article className="mb-10 overflow-hidden rounded-xl border border-line-light bg-card-light shadow-sm dark:border-line-dark dark:bg-card-dark dark:shadow-lg">
    <section className="border-b border-line-light bg-card-head-light px-6 py-5 dark:border-line-dark dark:bg-raised-dark/70 sm:px-8">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded border border-warn-line-light bg-warn-bg-light px-2 py-0.5 text-xs font-semibold text-warn-light dark:border-warn-line-dark dark:bg-warn-bg-dark dark:text-warn-dark">
          {post.category}
        </span>
        <h2 className="text-xl font-bold leading-snug text-ink-light dark:text-ink-dark sm:text-2xl">{title}</h2>
      </div>
      <PostMeta author={post.author} date={post.date} views={post.views} comments={commentCount} />
    </section>

    <section className="min-h-[280px] space-y-4 p-6 text-sm leading-relaxed text-ink-muted-light dark:text-ink-muted-dark sm:p-8 sm:text-base">
      <p className="text-ink-light dark:text-ink-dark">{post.intro}</p>
      {post.sections.map((s) => (
        <React.Fragment key={s.heading}>
          <h3 className="border-b border-line-light pb-1 pt-2 text-base font-bold text-ink-light dark:border-line-dark dark:text-ink-dark">
            {s.heading}
          </h3>
          <p>{s.body}</p>
        </React.Fragment>
      ))}

      <div className="mt-6 border-t border-line-light pt-8 dark:border-line-dark">
        <div className="flex max-w-xl items-center gap-2 truncate rounded-control border border-line-strong-light bg-raised-light px-3.5 py-2.5 text-xs dark:border-line-strong-dark dark:bg-field-dark sm:text-sm">
          <Icon name="link" className="text-[16px] text-ink-subtle-light dark:text-ink-subtle-dark" />
          <span className="font-medium text-ink-muted-light dark:text-ink-muted-dark">{labels.attachment}</span>
          <a
            href={post.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-accent-light hover:underline dark:text-accent-dark"
          >
            {post.attachmentUrl}
          </a>
        </div>
      </div>
    </section>
  </article>
);

export default PostArticle;

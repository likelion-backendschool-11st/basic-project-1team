import React from 'react';
import { labels } from '../data/mockData';

interface PostMetaProps {
  readonly author: string;
  readonly date: string;
  readonly views: number;
  readonly comments: number;
}

const Divider: React.FC = () => <span className="text-ink-faint-light dark:text-ink-faint-dark">|</span>;
const key = 'font-medium text-ink-subtle-light dark:text-ink-muted-dark';
const val = 'text-ink-muted-light dark:text-ink-muted-dark';

export const PostMeta: React.FC<PostMetaProps> = ({ author, date, views, comments }) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-ink-subtle-light dark:text-ink-subtle-dark sm:text-sm">
    <span className="flex items-center gap-1.5">
      <span className={key}>{labels.meta.author}</span>
      <span className="font-semibold text-ink-light dark:text-ink-dark">{author}</span>
    </span>
    <Divider />
    <span className="flex items-center gap-1.5">
      <span className={key}>{labels.meta.date}</span>
      <span className={val}>{date}</span>
    </span>
    <Divider />
    <span className="flex items-center gap-1.5">
      <span className={key}>{labels.meta.views}</span>
      <span className={val}>{views}</span>
    </span>
    <Divider />
    <span className="flex items-center gap-1.5 font-medium text-accent-light dark:text-accent-dark">
      {labels.meta.comments} {comments}
    </span>
  </div>
);

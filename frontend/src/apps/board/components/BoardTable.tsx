import React from 'react';
import { type Post, labels } from '../data/mockData';
import { BoardRow } from './BoardRow';

interface BoardTableProps {
  readonly posts: Post[];
  readonly isOwner: (post: Post) => boolean;
  readonly onEdit: (post: Post) => void;
}

const th = 'border-r border-line-light py-3 dark:border-line-dark';

export const BoardTable: React.FC<BoardTableProps> = ({ posts, isOwner, onEdit }) => (
  <section className="overflow-x-auto px-6 sm:px-8">
    <table className="w-full border-collapse border border-line-strong-light text-center text-sm dark:border-line-dark">
      <thead className="border-b border-line-strong-light bg-raised-light font-semibold text-ink-muted-light dark:border-line-dark dark:bg-card-head-dark dark:text-ink-muted-dark">
        <tr>
          <th scope="col" className={`w-16 px-3 ${th}`}>{labels.columns.no}</th>
          <th scope="col" className={`px-6 text-left ${th}`}>{labels.columns.title}</th>
          <th scope="col" className={`w-28 px-4 ${th}`}>{labels.columns.author}</th>
          <th scope="col" className={`w-28 px-4 ${th}`}>{labels.columns.date}</th>
          <th scope="col" className="w-20 px-4 py-3">{labels.columns.views}</th>
        </tr>
      </thead>
      <tbody>
        {posts.map((post) => (
          <BoardRow key={post.id} post={post} isOwner={isOwner(post)} onEdit={onEdit} />
        ))}
      </tbody>
    </table>
    {posts.length === 0 && (
      <div className="border border-t-0 border-line-strong-light py-16 text-center text-ink-subtle-light dark:border-line-dark dark:bg-card-head-dark dark:text-ink-subtle-dark">
        {labels.empty}
      </div>
    )}
  </section>
);

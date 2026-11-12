import React from 'react';
import { type Post, labels } from '../data/mockData';
import { BoardRow } from './BoardRow';

interface BoardTableProps {
  readonly posts: Post[];
  readonly isOwner: (post: Post) => boolean;
  readonly onEdit: (post: Post) => void;
}

const th = 'border-r py-3 border-hairline';

export const BoardTable: React.FC<BoardTableProps> = ({ posts, isOwner, onEdit }) => (
  <section className="overflow-x-auto px-6 sm:px-8">
    <table className="w-full border-collapse border text-center text-sm border-hairline">
      <thead className="border-b font-semibold border-hairline bg-surface-2 text-ink-muted">
        <tr>
          <th scope="col" className={`w-16 px-3 ${th}`}>
            {labels.columns.no}
          </th>
          <th scope="col" className={`px-6 text-left ${th}`}>
            {labels.columns.title}
          </th>
          <th scope="col" className={`w-28 px-4 ${th}`}>
            {labels.columns.author}
          </th>
          <th scope="col" className={`w-28 px-4 ${th}`}>
            {labels.columns.date}
          </th>
          <th scope="col" className="w-20 px-4 py-3">
            {labels.columns.views}
          </th>
        </tr>
      </thead>
      <tbody>
        {posts.map((post) => (
          <BoardRow key={post.id} post={post} isOwner={isOwner(post)} onEdit={onEdit} />
        ))}
      </tbody>
    </table>
    {posts.length === 0 && (
      <div className="border border-t-0 py-16 text-center border-hairline bg-surface-2 text-ink-subtle">
        {labels.empty}
      </div>
    )}
  </section>
);

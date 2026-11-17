import React from 'react';
import { labels } from '../data/mockData';
import type { PostSummary } from '../data/types';
import { BoardRow } from './BoardRow';

interface BoardTableProps {
  readonly posts: readonly PostSummary[];
  readonly loading: boolean;
  readonly errorMessage: string | null;
}

const th = 'border-r py-3 border-hairline';

export const BoardTable: React.FC<BoardTableProps> = ({ posts, loading, errorMessage }) => {
  // 불러오는 중이면 이전 목록 대신 안내를 보여 준다
  const notice = loading
    ? labels.loading
    : errorMessage
      ? errorMessage
      : posts.length === 0
        ? labels.empty
        : null;

  return (
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
        <tbody>{!loading && posts.map((post) => <BoardRow key={post.id} post={post} />)}</tbody>
      </table>
      {notice && (
        <div
          className={`border border-t-0 py-16 text-center border-hairline bg-surface-2 ${
            errorMessage && !loading ? 'text-semantic-danger' : 'text-ink-subtle'
          }`}
        >
          {notice}
        </div>
      )}
    </section>
  );
};

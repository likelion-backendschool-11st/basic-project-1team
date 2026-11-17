import React from 'react';
import { Link } from 'react-router-dom';
import { labels, routes } from '../data/mockData';
import type { PostSummary } from '../data/types';
import { formatDate } from '../format';

interface MyPostsTableProps {
  readonly posts: readonly PostSummary[];
  /** 빈 줄까지 채워 보여 줄 줄 수 */
  readonly rows: number;
  /** 첫 줄 NO 값. 페이지가 바뀌어도 이어서 센다 */
  readonly startNo: number;
  /** 불러오는 중·오류·빈 목록 안내. 있으면 표 아래에 보여 준다 */
  readonly notice?: string | null;
}

const cell = 'border-r border-hairline';

export const MyPostsTable: React.FC<MyPostsTableProps> = ({
  posts,
  rows,
  startNo,
  notice = null,
}) => {
  const slots = Array.from({ length: Math.max(rows, posts.length) }, (_, i) => posts[i]);
  return (
    <section
      aria-label={labels.myPostsTitle}
      className="overflow-x-auto rounded-lg border border-hairline"
    >
      <table className="w-full table-fixed border-collapse text-left text-sm">
        <thead className="border-b text-center font-semibold border-hairline bg-surface-2 text-ink">
          <tr>
            <th scope="col" className={`w-16 px-3 py-3.5 tracking-wider ${cell}`}>
              {labels.columns.no}
            </th>
            <th scope="col" className={`px-6 py-3.5 tracking-wider ${cell}`}>
              {labels.myPostsColumn}
            </th>
            <th scope="col" className="w-28 px-3 py-3.5 tracking-wider sm:w-36">
              {labels.columns.date}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {slots.map((post, i) =>
            post ? (
              <tr key={post.id} className="group transition-colors hover:bg-surface-3/60">
                <td className={`px-3 py-3.5 text-center font-medium text-ink-subtle ${cell}`}>
                  {startNo + i}
                </td>
                <td className={`truncate px-6 py-3.5 ${cell}`}>
                  <Link
                    to={routes.detail(post.id)}
                    title={post.title}
                    className="block truncate font-medium transition-colors hover:underline text-ink group-hover:text-primary"
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="px-3 py-3.5 text-center text-ink-subtle">
                  {formatDate(post.createdAt)}
                </td>
              </tr>
            ) : (
              <tr key={`empty-${i}`} className="h-12">
                <td className={`px-3 py-3.5 text-center text-ink-tertiary ${cell}`}>
                  {startNo + i}
                </td>
                <td className={cell} />
                <td />
              </tr>
            ),
          )}
        </tbody>
      </table>
      {notice && (
        <p className="border-t py-4 text-center text-sm border-hairline text-ink-subtle">
          {notice}
        </p>
      )}
    </section>
  );
};

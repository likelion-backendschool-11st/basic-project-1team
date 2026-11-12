import React from 'react';
import { Link } from 'react-router-dom';
import { type MyPost, labels, routes } from '../data/mockData';

interface MyPostsTableProps {
  readonly posts: MyPost[];
  readonly rows: number;
}

const cell = 'border-r border-line-light dark:border-line-dark';

export const MyPostsTable: React.FC<MyPostsTableProps> = ({ posts, rows }) => {
  const slots = Array.from({ length: Math.max(rows, posts.length) }, (_, i) => posts[i]);
  return (
    <section aria-label={labels.myPostsTitle} className="overflow-x-auto rounded-control border border-line-light dark:border-line-dark">
      <table className="w-full table-fixed border-collapse text-left text-sm">
        <thead className="border-b border-line-light bg-card-head-light text-center font-semibold text-ink-light dark:border-line-dark dark:bg-card-head-dark dark:text-ink-dark">
          <tr>
            <th scope="col" className={`w-16 px-3 py-3.5 tracking-wider ${cell}`}>{labels.columns.no}</th>
            <th scope="col" className={`px-6 py-3.5 tracking-wider ${cell}`}>{labels.myPostsColumn}</th>
            <th scope="col" className="w-28 px-3 py-3.5 tracking-wider sm:w-36">{labels.columns.date}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-light dark:divide-line-dark">
          {slots.map((post, i) =>
            post ? (
              <tr key={post.id} className="group transition-colors hover:bg-card-head-light dark:hover:bg-raised-dark/60">
                <td className={`px-3 py-3.5 text-center font-medium text-ink-subtle-light dark:text-ink-subtle-dark ${cell}`}>{i + 1}</td>
                <td className={`truncate px-6 py-3.5 ${cell}`}>
                  <Link
                    to={routes.detail(post.id)}
                    title={post.title}
                    className="block truncate font-medium text-ink-light transition-colors hover:underline group-hover:text-accent-light dark:text-ink-dark dark:group-hover:text-accent-dark"
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="px-3 py-3.5 text-center text-ink-subtle-light dark:text-ink-subtle-dark">{post.date}</td>
              </tr>
            ) : (
              <tr key={`empty-${i}`} className="h-12">
                <td className={`px-3 py-3.5 text-center text-ink-faint-light dark:text-ink-faint-dark ${cell}`}>{i + 1}</td>
                <td className={cell} />
                <td />
              </tr>
            ),
          )}
        </tbody>
      </table>
    </section>
  );
};

export default MyPostsTable;

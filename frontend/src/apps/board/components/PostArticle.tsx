import React from 'react';
import { RichTextView } from '../../../shared/editor/RichTextView';
import { labels } from '../data/mockData';
import type { PostDetail } from '../data/types';
import { formatDateTime, isOutdated } from '../format';
import { Icon } from './Icon';
import { PostMeta } from './PostMeta';

interface PostArticleProps {
  readonly post: PostDetail;
  /** 댓글을 쓰거나 지우면 바로 바뀌도록 댓글 목록의 개수를 받는다 */
  readonly commentCount: number;
  /** 제목 오른쪽 버튼 (작성자 수정·삭제, 신고) */
  readonly actions?: React.ReactNode;
}

export const PostArticle: React.FC<PostArticleProps> = ({ post, commentCount, actions }) => (
  <article className="mb-10 overflow-hidden rounded-lg border border-hairline bg-surface-1">
    <section className="border-b px-6 py-5 border-hairline bg-surface-3/70 sm:px-8">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-bold leading-snug text-ink sm:text-2xl">{post.title}</h2>
        {actions && <div className="ml-auto flex items-center gap-1.5">{actions}</div>}
      </div>
      <PostMeta
        author={post.author}
        date={formatDateTime(post.createdAt)}
        views={post.viewCount}
        comments={commentCount}
        isEdited={post.isEdited}
      />
    </section>

    <section className="min-h-[280px] space-y-4 p-6 text-sm leading-relaxed text-ink-muted sm:p-8 sm:text-base">
      {isOutdated(post.updatedAt) && (
        <p className="flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm border-tertiary-container bg-surface-2 text-tertiary">
          <Icon name="schedule" className="text-[18px]" />
          {labels.outdatedNotice}
        </p>
      )}
      <RichTextView html={post.body} className="text-ink" />
    </section>
  </article>
);

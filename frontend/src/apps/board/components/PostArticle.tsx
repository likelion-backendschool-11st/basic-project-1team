import React from 'react';
import { RichTextView } from '../../../shared/editor/RichTextView';
import type { PostDetail } from '../data/types';
import { formatDateTime } from '../format';
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
      <RichTextView html={post.body} className="text-ink" />
    </section>
  </article>
);

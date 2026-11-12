import React from 'react';
import { Link } from 'react-router-dom';
import { useLoginGate } from '../../../shared/LoginGate';
import { reportPath } from '../../../shared/site';
import { BackLink } from '../components/BackLink';
import { CommentSection } from '../components/CommentSection';
import { PageCard } from '../components/PageCard';
import { PostArticle } from '../components/PostArticle';
import { labels, routes } from '../data/mockData';
import { useComments } from '../hooks/useComments';
import { usePostDetail } from '../hooks/usePostDetail';

interface PostDetailPageProps {
  readonly className?: string;
}

const actionButton =
  'inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors border-hairline-strong bg-surface-2 text-ink-muted';

export const PostDetailPage: React.FC<PostDetailPageProps> = () => {
  const post = usePostDetail();
  const comments = useComments();
  const { guardLink } = useLoginGate();
  const postHref = `/board/posts/${post.postId}`;

  return (
    <PageCard padded>
      <header className="mb-8 border-b pb-6 border-hairline">
        <BackLink />
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {labels.boardTitle}
        </h1>
      </header>

      {post.notFound ? (
        <p className="py-12 text-center text-sm text-ink-subtle">{labels.postNotFound}</p>
      ) : (
        <>
          <PostArticle
            post={post.detail}
            title={post.title}
            commentCount={comments.comments.length}
            actions={
              post.isMine ? (
                <>
                  <Link
                    to={routes.edit(post.postId)}
                    className={`${actionButton} hover:bg-surface-3 hover:text-ink`}
                  >
                    {labels.postEdit}
                  </Link>
                  <button
                    type="button"
                    onClick={post.remove}
                    className={`${actionButton} hover:bg-surface-3 hover:text-semantic-danger`}
                  >
                    {labels.postDelete}
                  </button>
                </>
              ) : (
                <a
                  href={reportPath('post', post.postId, postHref)}
                  onClick={guardLink}
                  className={`${actionButton} hover:bg-surface-3 hover:text-semantic-danger`}
                >
                  {labels.report}
                </a>
              )
            }
          />
          <CommentSection comments={comments} postHref={postHref} />
        </>
      )}
    </PageCard>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { useLoginGate } from '../../../shared/LoginGate';
import { blockIfRestricted } from '../../../shared/sanctions';
import { reportPath } from '../../../shared/site';
import { labels, routes } from '../data/mockData';
import { useComments } from '../hooks/useComments';
import { usePostDetail } from '../hooks/usePostDetail';
import { BackLink } from '../components/BackLink';
import { CommentSection } from '../components/CommentSection';
import { PageCard } from '../components/PageCard';
import { PostArticle } from '../components/PostArticle';

interface PostDetailPageProps {
  readonly className?: string;
}

const actionButton =
  'inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors border-hairline-strong bg-surface-2 text-ink-muted';

export const PostDetailPage: React.FC<PostDetailPageProps> = () => {
  const detail = usePostDetail();
  const comments = useComments(detail.postId);
  const { guardLink } = useLoginGate();
  const postHref = routes.detail(detail.postId);
  const { post } = detail;

  // 불러오는 중·없는 글·오류면 본문 대신 안내 한 줄
  const notice = detail.loading
    ? labels.loading
    : detail.notFound
      ? labels.postNotFound
      : detail.errorMessage;

  return (
    <PageCard padded>
      <header className="mb-8 border-b pb-6 border-hairline">
        <BackLink />
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {labels.boardTitle}
        </h1>
      </header>

      {notice || !post ? (
        <p className="py-12 text-center text-sm text-ink-subtle">{notice}</p>
      ) : (
        <>
          <PostArticle
            post={post}
            commentCount={comments.loading ? post.commentCount : comments.totalCount}
            actions={
              post.isMine ? (
                <>
                  <Link
                    to={routes.edit(post.id)}
                    onClick={(e) => blockIfRestricted('write', e)}
                    className={`${actionButton} hover:bg-surface-3 hover:text-ink`}
                  >
                    {labels.postEdit}
                  </Link>
                  <button
                    type="button"
                    onClick={detail.remove}
                    className={`${actionButton} hover:bg-surface-3 hover:text-semantic-danger`}
                  >
                    {labels.postDelete}
                  </button>
                </>
              ) : (
                <a
                  href={reportPath('post', post.id, postHref)}
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

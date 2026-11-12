import React from 'react';
import { BackLink } from '../components/BackLink';
import { CommentSection } from '../components/CommentSection';
import { PageCard } from '../components/PageCard';
import { PostArticle } from '../components/PostArticle';
import { labels } from '../data/mockData';
import { useComments } from '../hooks/useComments';
import { usePostDetail } from '../hooks/usePostDetail';

interface PostDetailPageProps {
  readonly className?: string;
}

export const PostDetailPage: React.FC<PostDetailPageProps> = () => {
  const { detail, title } = usePostDetail();
  const comments = useComments();

  return (
    <PageCard padded>
      <header className="mb-8 border-b pb-6 border-hairline">
        <BackLink />
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {labels.boardTitle}
        </h1>
      </header>

      <PostArticle post={detail} title={title} commentCount={comments.comments.length} />
      <CommentSection comments={comments} />
    </PageCard>
  );
};

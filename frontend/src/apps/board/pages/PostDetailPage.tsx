import React from 'react';
import { BackLink } from '../components/BackLink';
import { BrandLogo } from '../components/BrandLogo';
import { CommentSection } from '../components/CommentSection';
import { PageCard } from '../components/PageCard';
import { PostArticle } from '../components/PostArticle';
import { brand, labels } from '../data/mockData';
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
      <div className="mb-6 flex items-center justify-between border-b border-line-light pb-4 dark:border-line-dark">
        <BrandLogo />
        <span className="hidden text-xs font-medium text-ink-subtle-light dark:text-ink-subtle-dark sm:inline">{brand.tagline}</span>
      </div>

      <header className="mb-8 border-b border-line-light pb-6 dark:border-line-dark">
        <BackLink />
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink-light dark:text-ink-dark sm:text-3xl">
          {labels.boardTitle}
        </h1>
      </header>

      <PostArticle post={detail} title={title} commentCount={comments.comments.length} />
      <CommentSection comments={comments} />
    </PageCard>
  );
};

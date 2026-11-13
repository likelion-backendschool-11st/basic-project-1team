import React from 'react';
import { RichTextView } from '../../../../shared/editor/RichTextView';
import { ProfileLink } from '../../../../shared/layout/ProfileLink';
import { questionAuthor as A } from '../../data/mockData';
import type { UserSummary } from '../../data/types';
import { formatCount, formatDate } from '../../display';
import { useAuthorProfile } from '../../hooks/useAuthorProfile';
import { Avatar } from '../common/Avatar';
import { Card } from '../common/Card';

interface AuthorProfileCardProps {
  readonly author: UserSummary;
  readonly className?: string;
}

/** 질문 작성자 카드. 공개 프로필(GET /api/users/:userId)의 가입일·활동 수·소개글을 보여 준다 */
export const AuthorProfileCard: React.FC<AuthorProfileCardProps> = ({ author, className = '' }) => {
  const profile = useAuthorProfile(author.id);

  return (
    <Card className={`p-space-md space-y-space-sm ${className}`}>
      <div className="flex items-center gap-space-sm">
        <Avatar initial={author.nickname.charAt(0)} size="lg" tone="primary" />
        <div className="flex flex-col">
          <ProfileLink
            userId={author.id}
            className="font-headline-sm text-headline-sm text-ink font-semibold"
          >
            {author.nickname}
          </ProfileLink>
          {profile && (
            <span className="font-caption text-caption text-ink-subtle">
              {A.joined(formatDate(profile.createdAt))}
            </span>
          )}
        </div>
      </div>
      {author.id === null ? (
        <p className="font-body-sm text-body-sm text-ink-tertiary pt-1">{A.withdrawn}</p>
      ) : (
        profile && (
          <>
            {profile.bio ? (
              <RichTextView
                html={profile.bio}
                className="font-body-sm text-body-sm text-ink-muted pt-1"
              />
            ) : (
              <p className="font-body-sm text-body-sm text-ink-tertiary pt-1">{A.noBio}</p>
            )}
            <div className="pt-2 text-caption font-caption text-ink-tertiary">
              {A.activity(formatCount(profile.questionCount), formatCount(profile.answerCount))}
            </div>
          </>
        )
      )}
    </Card>
  );
};

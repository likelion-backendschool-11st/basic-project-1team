import React from 'react';
import { ProfileLink } from '../../../shared/layout/ProfileLink';
import { labels } from '../data/mockData';
import type { UserSummary } from '../data/types';

interface PostMetaProps {
  readonly author: UserSummary;
  /** 화면에 보여 줄 작성 시각 (formatDateTime 결과) */
  readonly date: string;
  readonly views: number;
  readonly comments: number;
  /** 제목·본문을 고친 적이 있으면 "(수정됨)"을 붙인다 */
  readonly isEdited: boolean;
}

const Divider: React.FC = () => <span className="text-ink-tertiary">|</span>;
const key = 'font-medium text-ink-muted';
const val = 'text-ink-muted';

export const PostMeta: React.FC<PostMetaProps> = ({ author, date, views, comments, isEdited }) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-ink-subtle sm:text-sm">
    <span className="flex items-center gap-1.5">
      <span className={key}>{labels.meta.author}</span>
      <ProfileLink userId={author.id} className="font-semibold text-ink">
        {author.nickname}
      </ProfileLink>
    </span>
    <Divider />
    <span className="flex items-center gap-1.5">
      <span className={key}>{labels.meta.date}</span>
      <span className={val}>
        {date}
        {isEdited && <span className="ml-1 text-ink-subtle">{labels.edited}</span>}
      </span>
    </span>
    <Divider />
    <span className="flex items-center gap-1.5">
      <span className={key}>{labels.meta.views}</span>
      <span className={val}>{views.toLocaleString()}</span>
    </span>
    <Divider />
    <span className="flex items-center gap-1.5 font-medium text-primary">
      {labels.meta.comments} {comments}
    </span>
  </div>
);

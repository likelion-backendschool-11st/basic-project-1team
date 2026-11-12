import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { noticeLabels as L, notices } from '../data/mockData';
import { Card } from '../components/common/Card';
import { Icon } from '../components/common/Icon';
import { routes } from '../routes';

interface NoticeDetailPageProps {
  readonly className?: string;
}

export const NoticeDetailPage: React.FC<NoticeDetailPageProps> = ({ className = '' }) => {
  const { id } = useParams();
  // TODO: GET /api/notices/:noticeId 연동 (404 NOTICE_NOT_FOUND)
  const notice = notices.find((n) => String(n.id) === id);

  const backLink = (
    <Link to={routes.notices()} className="inline-flex items-center gap-1 font-caption text-caption text-ink-subtle hover:text-ink transition-colors">
      <Icon name="arrow_back" className="text-[15px]" />
      <span>{L.backToList}</span>
    </Link>
  );

  return (
    <div className={`w-full py-space-lg flex flex-col gap-space-md ${className}`}>
      {backLink}
      {notice ? (
        <Card as="article" className="p-space-md sm:p-space-lg flex flex-col gap-space-md">
          <div className="flex flex-col gap-space-xs pb-space-sm border-b border-hairline">
            {notice.isPinned && (
              <span className="w-fit inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-primary-container/20 border border-primary-container/40 text-primary font-label-sm text-label-sm">
                <Icon name="push_pin" className="text-[13px]" />
                {L.pinned}
              </span>
            )}
            <h1 className="font-headline-lg text-headline-lg text-ink font-semibold tracking-tight">{notice.title}</h1>
            <div className="flex items-center gap-2 font-body-sm text-body-sm text-ink-subtle">
              <span className="text-ink">{notice.author}</span>
              <span className="text-ink-tertiary">•</span>
              <span className="font-code-inline text-caption">{notice.createdAt}</span>
            </div>
          </div>
          <p className="whitespace-pre-line font-body-md text-body-md text-ink leading-relaxed">{notice.body}</p>
        </Card>
      ) : (
        <Card className="py-space-xl flex flex-col items-center gap-space-sm text-center">
          <Icon name="campaign" className="text-[36px] text-ink-tertiary" />
          <p className="font-body-md text-body-md text-ink-subtle">{L.notFound}</p>
        </Card>
      )}
    </div>
  );
};

export default NoticeDetailPage;

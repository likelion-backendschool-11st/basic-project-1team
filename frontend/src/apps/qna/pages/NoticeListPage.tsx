import React from 'react';
import { Link } from 'react-router-dom';
import { noticeLabels as L, notices } from '../../../shared/notices';
import { Card } from '../components/common/Card';
import { Icon } from '../components/common/Icon';
import { routes } from '../routes';

interface NoticeListPageProps {
  readonly className?: string;
}

export const NoticeListPage: React.FC<NoticeListPageProps> = ({ className = '' }) => (
  <div className={`w-full py-space-lg flex flex-col gap-space-lg ${className}`}>
    <div className="flex flex-col gap-space-xxs">
      <h1 className="font-headline-lg text-headline-lg text-ink font-semibold tracking-tight">
        {L.listTitle}
      </h1>
      <p className="font-body-md text-body-md text-ink-subtle">{L.listDescription}</p>
    </div>

    {/* TODO: GET /api/notices 연동 (page, size) */}
    <Card as="section" className="overflow-hidden">
      <div className="hidden sm:grid grid-cols-[1fr_120px_120px] gap-space-sm px-space-md py-space-xs bg-surface-2 border-b border-hairline font-label-sm text-label-sm text-ink-subtle">
        <span>{L.columns.title}</span>
        <span>{L.columns.author}</span>
        <span>{L.columns.createdAt}</span>
      </div>
      {notices.length === 0 ? (
        <p className="py-space-xl text-center font-body-sm text-body-sm text-ink-tertiary">
          {L.empty}
        </p>
      ) : (
        <ul className="divide-y divide-hairline">
          {notices.map((notice) => (
            <li key={notice.id}>
              <Link
                to={routes.notice(notice.id)}
                className="grid grid-cols-1 sm:grid-cols-[1fr_120px_120px] gap-1 sm:gap-space-sm items-center px-space-md py-space-sm hover:bg-surface-2 transition-colors"
              >
                <span className="min-w-0 flex items-center gap-space-xs">
                  {notice.isPinned && (
                    <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-primary-container/20 border border-primary-container/40 text-primary font-label-sm text-label-sm">
                      <Icon name="push_pin" className="text-[13px]" />
                      {L.pinned}
                    </span>
                  )}
                  <span
                    className={`truncate font-body-md text-body-md ${notice.isPinned ? 'text-ink font-semibold' : 'text-ink'}`}
                  >
                    {notice.title}
                  </span>
                </span>
                <span className="font-body-sm text-body-sm text-ink-subtle">{notice.author}</span>
                <span className="font-code-inline text-caption text-ink-tertiary">
                  {notice.createdAt}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  </div>
);

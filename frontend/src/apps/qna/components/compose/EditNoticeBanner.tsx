import React from 'react';
import { editQuestionPage as P } from '../../data/mockData';
import { Icon } from '../common/Icon';

interface EditNoticeBannerProps {
  readonly className?: string;
}

export const EditNoticeBanner: React.FC<EditNoticeBannerProps> = ({ className = '' }) => (
  <div
    className={`mt-space-xs p-space-sm rounded-lg bg-surface-1 flex items-start gap-space-sm ${className}`}
  >
    <Icon name="info" className="text-primary text-[20px] mt-0.5" />
    <div className="flex-1">
      <p className="font-body-sm text-body-sm text-ink-muted">
        <strong className="text-ink font-semibold">{P.noticeStrong}</strong>
        {P.noticePrefix}
        <span className="font-code-inline text-code-inline text-primary">
          {P.noticeContributors}
        </span>
        {P.noticeMiddle}
        <span className="text-tertiary font-medium">{P.noticeEdited}</span>
        {P.noticeSuffix}
      </p>
    </div>
    <a
      className="font-label-sm text-label-sm text-ink-subtle hover:text-ink underline shrink-0"
      href="#"
    >
      {P.noticeLink}
    </a>
  </div>
);

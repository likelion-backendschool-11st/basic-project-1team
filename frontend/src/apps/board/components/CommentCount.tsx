import React from 'react';

interface CommentCountProps {
  readonly count: number;
}

export const CommentCount: React.FC<CommentCountProps> = ({ count }) =>
  count > 0 ? (
    <span
      className="text-xs font-semibold text-accent-light dark:text-accent-dark"
      title={`댓글 ${count}개`}
    >
      [{count}]
    </span>
  ) : null;

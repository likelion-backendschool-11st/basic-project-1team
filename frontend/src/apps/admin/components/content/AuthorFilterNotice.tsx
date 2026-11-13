import React from 'react';
import { qnaCopy } from '../../data/mockData';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

interface AuthorFilterNoticeProps {
  readonly authorId: string;
  readonly onClear: () => void;
}

/** 회원 상세의 질문·답변 수에서 넘어왔을 때, 그 회원 글만 보고 있다는 안내와 해제 버튼 */
export const AuthorFilterNotice: React.FC<AuthorFilterNoticeProps> = ({ authorId, onClear }) => {
  return (
    <div className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-primary-container/40 bg-primary-container/10 px-4 py-3 text-body-md text-ink">
      <span className="flex items-center gap-2">
        <Icon name="person_search" className="text-primary" />
        {qnaCopy.authorFilter(authorId)}
      </span>
      <Button size="sm" variant="secondary" onClick={onClear}>
        {qnaCopy.clearAuthorFilter}
      </Button>
    </div>
  );
};

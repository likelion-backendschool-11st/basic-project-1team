import React from 'react';
import { Icon } from '../ui/Icon';
import { mypageContent } from '../../data/mockData';
import type { useProfileActivity, ActivityTab } from '../../hooks/useProfileActivity';

interface ProfileActivityProps {
  readonly activity: ReturnType<typeof useProfileActivity>;
  readonly counts: Readonly<Record<ActivityTab, number>>;
}

const c = mypageContent.activity;
const TABS: readonly ActivityTab[] = ['questions', 'answers', 'posts'];

interface RowProps {
  readonly href: string;
  readonly title: string;
  readonly sub?: string;
  readonly meta: string;
  readonly accepted?: boolean;
}

/** 다른 모듈(Q&A, 자유게시판) 화면이라 전체 페이지 이동(<a href>)으로 연다. */
const Row: React.FC<RowProps> = ({ href, title, sub, meta, accepted }) => (
  <li>
    <a href={href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-body-md text-body-md text-ink">{title}</p>
        {sub && <p className="truncate font-body-sm text-body-sm text-ink-tertiary">{sub}</p>}
      </div>
      {accepted && (
        <span className="shrink-0 rounded bg-semantic-success/15 px-1.5 py-0.5 font-label-code text-[10px] text-semantic-success">
          {c.accepted}
        </span>
      )}
      <span className="shrink-0 font-label-code text-label-code text-ink-tertiary">{meta}</span>
    </a>
  </li>
);

/** 프로필 아래 질문 / 답변 / 게시글 탭. 본인과 다른 회원·비회원 모두 볼 수 있다. */
export const ProfileActivity: React.FC<ProfileActivityProps> = ({ activity, counts }) => {
  const { tab, setTab } = activity;

  const rows =
    tab === 'questions'
      ? activity.questions.map((q) => (
          <Row
            key={q.id}
            href={`/qna/questions/${q.id}`}
            title={q.title}
            meta={`${c.answersSuffix} ${q.answerCount} · ${q.createdAt}`}
            accepted={q.isAccepted}
          />
        ))
      : tab === 'answers'
        ? activity.answers.map((a) => (
            <Row
              key={a.id}
              href={`/qna/questions/${a.question.id}`}
              title={a.preview}
              sub={a.question.title}
              meta={a.createdAt}
              accepted={a.isAccepted}
            />
          ))
        : activity.posts.map((p) => (
            <Row key={p.id} href={`/board/posts/${p.id}`} title={p.title} meta={`${c.commentsSuffix} ${p.commentCount} · ${p.createdAt}`} />
          ));

  return (
    <div className="rounded-xl bg-surface-2 p-2 shadow-sm">
      <div role="tablist" className="flex gap-1 border-b border-surface-3 px-1 pb-2">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-label-md text-label-md transition-colors ${
              tab === key ? 'bg-surface-3 text-ink' : 'text-ink-subtle hover:text-ink'
            }`}
          >
            {c.tabs[key]}
            <span className="font-label-code text-[10px] text-ink-tertiary">{counts[key]}</span>
          </button>
        ))}
      </div>
      {rows.length > 0 ? (
        <ul role="tabpanel" className="pt-1">
          {rows}
        </ul>
      ) : (
        <p role="tabpanel" className="flex items-center justify-center gap-1.5 py-8 font-body-sm text-body-sm text-ink-tertiary">
          <Icon name="inbox" className="text-[18px]" />
          {c.empty}
        </p>
      )}
    </div>
  );
};

export default ProfileActivity;

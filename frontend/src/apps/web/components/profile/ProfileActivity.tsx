import React, { forwardRef } from 'react';
import { Icon } from '../ui/Icon';
import { SectionHeader } from '../ui/SectionHeader';
import { mypageContent } from '../../data/mockData';
import type { ActivityList, useProfileActivity } from '../../hooks/useProfileActivity';

const c = mypageContent.activity;

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

interface ActivitySectionProps {
  readonly list: ActivityList;
  readonly count: number;
  readonly hasMore: boolean;
  readonly onMore: () => void;
  readonly children: React.ReactNode[];
}

/** 질문 / 답변 / 게시글 목록 하나. 본인과 다른 회원·비회원 모두 볼 수 있다. */
export const ActivitySection = forwardRef<HTMLElement, ActivitySectionProps>(({ list, count, hasMore, onMore, children }, ref) => {
  const meta = c.lists[list];
  return (
    <section ref={ref} className="scroll-mt-6 space-y-2">
      <SectionHeader icon={meta.icon} label={meta.label} meta={count} metaTone="accent" />
      <div className="rounded-xl bg-surface-2 p-2 shadow-sm">
        {children.length > 0 ? (
          <ul>{children}</ul>
        ) : (
          <p className="flex items-center justify-center gap-1.5 py-6 font-body-sm text-body-sm text-ink-tertiary">
            <Icon name="inbox" className="text-[18px]" />
            {meta.empty}
          </p>
        )}
        {hasMore && (
          <button
            type="button"
            onClick={onMore}
            className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg py-2 font-label-md text-label-md text-ink-subtle transition-colors hover:bg-surface-3 hover:text-ink"
          >
            {c.more}
            <Icon name="expand_more" className="text-[16px]" />
          </button>
        )}
      </div>
    </section>
  );
});
ActivitySection.displayName = 'ActivitySection';

interface ProfileActivityProps {
  readonly activity: ReturnType<typeof useProfileActivity>;
  readonly counts: Readonly<Record<ActivityList, number>>;
  readonly sectionRefs: Readonly<Record<ActivityList, React.RefObject<HTMLElement>>>;
}

/**
 * 프로필의 작성 목록 (REQ-MYPAGE-002·003). 제목을 누르면 상세로 이동하고,
 * 답변은 질문 상세의 해당 답변 위치(#answer-<id>)로 이동한다.
 */
export const ProfileActivity: React.FC<ProfileActivityProps> = ({ activity, counts, sectionRefs }) => (
  <>
    <ActivitySection
      ref={sectionRefs.questions}
      list="questions"
      count={counts.questions}
      hasMore={activity.hasMore('questions')}
      onMore={() => activity.loadMore('questions')}
    >
      {activity.questions.map((q) => (
        <Row
          key={q.id}
          href={`/qna/questions/${q.id}`}
          title={q.title}
          meta={`${c.answersSuffix} ${q.answerCount} · ${q.createdAt}`}
          accepted={q.isAccepted}
        />
      ))}
    </ActivitySection>
    <ActivitySection
      ref={sectionRefs.answers}
      list="answers"
      count={counts.answers}
      hasMore={activity.hasMore('answers')}
      onMore={() => activity.loadMore('answers')}
    >
      {activity.answers.map((a) => (
        <Row
          key={a.id}
          href={`/qna/questions/${a.question.id}#answer-${a.id}`}
          title={a.question.title}
          sub={a.preview}
          meta={a.createdAt}
          accepted={a.isAccepted}
        />
      ))}
    </ActivitySection>
    <ActivitySection
      ref={sectionRefs.posts}
      list="posts"
      count={counts.posts}
      hasMore={activity.hasMore('posts')}
      onMore={() => activity.loadMore('posts')}
    >
      {activity.posts.map((p) => (
        <Row key={p.id} href={`/board/posts/${p.id}`} title={p.title} meta={`${c.commentsSuffix} ${p.commentCount} · ${p.createdAt}`} />
      ))}
    </ActivitySection>
  </>
);

export default ProfileActivity;

import React from 'react';
import { SiteLink } from '../../../../shared/layout/SiteLink';
import { Icon } from '../ui/Icon';
import { SectionHeader } from '../ui/SectionHeader';
import { authorListPaths } from '../../../../shared/site';
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

/** Q&A·자유게시판 글로 이동한다. 같은 site 라우터라 페이지를 새로 읽지 않는다. */
const Row: React.FC<RowProps> = ({ href, title, sub, meta, accepted }) => (
  <li>
    <SiteLink
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-3"
    >
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
    </SiteLink>
  </li>
);

interface ActivitySectionProps {
  readonly list: ActivityList;
  readonly count: number;
  /** 그 회원의 전체 목록 화면 (목록 화면 + 검색 조건) */
  readonly allHref: string;
  readonly children: React.ReactNode[];
}

/** 질문 / 답변 / 게시글 목록 하나. 최신 5개까지 보여 주고, 전체는 목록 화면에서 본다. */
export const ActivitySection: React.FC<ActivitySectionProps> = ({
  list,
  count,
  allHref,
  children,
}) => {
  const meta = c.lists[list];
  return (
    <section className="space-y-2">
      <SectionHeader
        icon={meta.icon}
        label={meta.label}
        metaTone="accent"
        meta={
          <span className="flex items-center gap-3">
            {count}
            {count > 0 && (
              <SiteLink
                href={allHref}
                className="flex items-center font-label-md text-label-md text-ink-subtle transition-colors hover:text-ink"
              >
                <span className="sr-only">{meta.label} </span>
                {c.viewAll}
                <Icon name="chevron_right" className="text-[16px]" />
              </SiteLink>
            )}
          </span>
        }
      />
      <div className="rounded-xl bg-surface-2 p-2 shadow-sm">
        {children.length > 0 ? (
          <ul>{children}</ul>
        ) : (
          <p className="flex items-center justify-center gap-1.5 py-6 font-body-sm text-body-sm text-ink-tertiary">
            <Icon name="inbox" className="text-[18px]" />
            {meta.empty}
          </p>
        )}
      </div>
    </section>
  );
};

interface ProfileActivityProps {
  readonly userId: number;
  readonly activity: ReturnType<typeof useProfileActivity>;
  readonly counts: Readonly<Record<ActivityList, number>>;
}

/**
 * 프로필의 작성 목록 (REQ-MYPAGE-002·003). 제목을 누르면 상세로 이동하고,
 * 답변은 질문 상세의 해당 답변 위치(#answer-<id>)로 이동한다.
 * "전체 보기"는 질문·게시글은 그 회원이 쓴 글, 답변은 그 회원이 답변한 질문 목록으로 보낸다.
 */
export const ProfileActivity: React.FC<ProfileActivityProps> = ({ userId, activity, counts }) => (
  <>
    <ActivitySection
      list="questions"
      count={counts.questions}
      allHref={authorListPaths.questions(userId)}
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
      list="answers"
      count={counts.answers}
      allHref={authorListPaths.answers(userId)}
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
    <ActivitySection list="posts" count={counts.posts} allHref={authorListPaths.posts(userId)}>
      {activity.posts.map((p) => (
        <Row
          key={p.id}
          href={`/board/posts/${p.id}`}
          title={p.title}
          meta={`${c.commentsSuffix} ${p.commentCount} · ${p.createdAt}`}
        />
      ))}
    </ActivitySection>
  </>
);

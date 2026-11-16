import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { TierBadge } from '../../../shared/layout/TierBadge';
import { tagDetailPage as T } from '../data/mockData';
import { formatCount, formatDate } from '../display';
import { useTagDetail } from '../hooks/useTagDetail';
import { Card } from '../components/common/Card';
import { Icon } from '../components/common/Icon';
import { TagChip } from '../components/common/TagChip';
import { TagDescription } from '../components/tags/TagDescription';
import { routes } from '../routes';

interface TagDetailPageProps {
  readonly className?: string;
}

/** 태그 상세 (REQ-TAG-002). 이름·설명·질문 수·병합된 이름과 최근 질문 */
export const TagDetailPage: React.FC<TagDetailPageProps> = ({ className = '' }) => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { tag, recentQuestions, loading, notFound, errorMessage, setTag } = useTagDetail(name);

  // 병합된 이름(예: lol)으로 들어오면 병합 대상 태그 주소로 바꾼다 (API_SPEC 5장)
  useEffect(() => {
    if (tag && name !== undefined && tag.name !== name) {
      navigate(routes.tag(tag.name), { replace: true });
    }
  }, [tag, name, navigate]);

  return (
    <div className={`w-full py-space-lg flex flex-col gap-space-md ${className}`}>
      <Link
        to={routes.questions()}
        className="inline-flex items-center gap-1 font-caption text-caption text-ink-subtle hover:text-ink transition-colors"
      >
        <Icon name="arrow_back" className="text-[15px]" />
        <span>{T.back}</span>
      </Link>

      {tag ? (
        <>
          <Card as="section" className="p-space-md sm:p-space-lg flex flex-col gap-space-sm">
            <span className="font-code-inline text-[11px] text-ink-tertiary">{T.label}</span>
            <div className="flex flex-wrap items-baseline justify-between gap-space-sm">
              <h1 className="font-headline-lg text-headline-lg text-ink font-semibold tracking-tight">
                #{tag.name}
              </h1>
              <span className="font-code-inline text-code-inline text-primary">
                {T.questionCount(formatCount(tag.questionCount))}
              </span>
            </div>
            <TagDescription tag={tag} onSaved={setTag} />
            {tag.aliases.length > 0 && (
              <div className="flex flex-wrap items-center gap-space-xs pt-space-xs border-t border-hairline">
                <span className="font-caption text-caption text-ink-tertiary">
                  {T.aliasesLabel}
                </span>
                {tag.aliases.map((alias) => (
                  <TagChip key={alias} label={alias} variant="muted" />
                ))}
              </div>
            )}
          </Card>

          <Card as="section" className="p-space-md sm:p-space-lg flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-ink font-semibold">
                {T.recentTitle}
              </h2>
              {tag.questionCount > 0 && (
                <Link
                  to={routes.questionsByTag(tag.name)}
                  className="flex items-center gap-0.5 font-label-md text-label-md text-ink-subtle hover:text-ink transition-colors"
                >
                  {T.viewAll}
                  <Icon name="chevron_right" className="text-[16px]" />
                </Link>
              )}
            </div>
            {recentQuestions.length === 0 ? (
              <p className="font-body-sm text-body-sm text-ink-tertiary">{T.recentEmpty}</p>
            ) : (
              <ul className="divide-y divide-hairline">
                {recentQuestions.map((q) => (
                  <li key={q.id}>
                    <Link
                      to={routes.question(q.id)}
                      className="flex items-center gap-space-sm py-2.5 group"
                    >
                      <span className="min-w-0 flex-1 truncate font-body-md text-body-md text-ink group-hover:text-primary transition-colors">
                        {q.isAccepted && <span className="text-secondary mr-1">✓</span>}
                        {q.title}
                      </span>
                      <span className="hidden sm:flex items-center gap-1.5 shrink-0 font-body-sm text-body-sm text-ink-subtle">
                        {q.author.nickname}
                        <TierBadge level={q.author.level} tier={q.author.tier} />
                      </span>
                      <span className="shrink-0 font-code-inline text-caption text-ink-tertiary">
                        {T.answers(formatCount(q.answerCount), q.isAccepted)}
                      </span>
                      <span className="hidden md:inline shrink-0 font-code-inline text-caption text-ink-tertiary">
                        {formatDate(q.createdAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      ) : (
        <Card className="py-space-xl flex flex-col items-center gap-space-sm text-center">
          <Icon name="sell" className="text-[36px] text-ink-tertiary" />
          <p className="font-body-md text-body-md text-ink-subtle">
            {loading ? T.loading : notFound ? T.notFound : errorMessage}
          </p>
        </Card>
      )}
    </div>
  );
};

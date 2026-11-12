import { useMemo, useState } from 'react';
import type { QuestionSummary } from '../data/types';

const ALL_TAG = '전체';

const toNumber = (views: string) => Number(views.replace(/,/g, ''));

export function useQuestionFilters(source: readonly QuestionSummary[]) {
  const [scope, setScope] = useState('all');
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [sort, setSort] = useState('latest');
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeTag, setActiveTag] = useState(ALL_TAG);
  const [answerFilter, setAnswerFilter] = useState('all');
  const [acceptedFilter, setAcceptedFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('');

  const selectTag = (tag: string) => {
    setActiveTag(tag);
    const next = tag === ALL_TAG ? '' : tag;
    setQuery(next);
    setSubmittedQuery(next);
  };

  const submitSearch = () => setSubmittedQuery(query.trim());

  const reset = () => {
    setActiveTag(ALL_TAG);
    setQuery('');
    setSubmittedQuery('');
    setAnswerFilter('all');
    setAcceptedFilter('all');
    setTagFilter('');
  };

  const results = useMemo(() => {
    const term = submittedQuery.replace(/^#/, '').toLowerCase();
    const tagTerm = tagFilter.replace(/^#/, '').toLowerCase();
    const matchesTerm = (q: QuestionSummary) => {
      if (!term) return true;
      const fields =
        scope === 'tag' ? [q.tag] : scope === 'title' ? [q.title] : scope === 'author' ? [q.author] : [q.title, q.tag, q.author];
      return fields.some((f) => f.toLowerCase().includes(term));
    };
    const filtered = source.filter(
      (q) =>
        matchesTerm(q) &&
        (!tagTerm || q.tag.toLowerCase().includes(tagTerm)) &&
        (answerFilter === 'all' || (answerFilter === 'has_answer' ? q.answers > 0 : q.answers === 0)) &&
        (acceptedFilter === 'all' || (acceptedFilter === 'accepted_only' ? q.accepted : !q.accepted)),
    );
    return sort === 'views' ? [...filtered].sort((a, b) => toNumber(b.views) - toNumber(a.views)) : filtered;
  }, [source, submittedQuery, scope, tagFilter, answerFilter, acceptedFilter, sort]);

  return {
    scope, setScope,
    query, setQuery, submitSearch,
    sort, setSort,
    panelOpen, togglePanel: () => setPanelOpen((v) => !v),
    activeTag, selectTag,
    answerFilter, setAnswerFilter,
    acceptedFilter, setAcceptedFilter,
    tagFilter, setTagFilter,
    reset,
    results,
  } as const;
}

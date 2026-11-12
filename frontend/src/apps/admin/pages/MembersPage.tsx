import React, { useMemo, useState } from 'react';
import { MemberTable } from '../components/members/MemberTable';
import { FilterBar } from '../components/ui/FilterBar';
import { Select, TextInput } from '../components/ui/FormControls';
import { PageHeader } from '../components/ui/PageHeader';
import { Pagination } from '../components/ui/Pagination';
import { ResultCount } from '../components/ui/ResultCount';
import {
  memberRoleOptions,
  memberSortOptions,
  memberStatusOptions,
  members,
  membersCopy,
  pageCounts,
  ui,
} from '../data/mockData';
import { usePagination } from '../hooks/usePagination';
import { includesText, useSearchFilter } from '../hooks/useSearchFilter';
import { memberStatus } from '../sanction';
import type { Member } from '../types';

interface MemberFilters extends Record<string, string> {
  query: string;
  status: string;
  role: string;
}

const matchMember = (m: Member, f: MemberFilters) =>
  includesText([m.username, m.nickname], f.query) &&
  (f.status === 'all' || memberStatus(m.sanctions) === f.status) &&
  (f.role === 'all' || m.role === f.role);

export const MembersPage: React.FC = () => {
  const filter = useSearchFilter(members, { query: '', status: 'all', role: 'all' }, matchMember);
  const pagination = usePagination(pageCounts.members);
  const [sort, setSort] = useState('newest');

  const rows = useMemo(
    () => (sort === 'oldest' ? filter.results.slice().reverse() : filter.results),
    [filter.results, sort],
  );
  const isFiltered = filter.applied.query !== '' || filter.applied.status !== 'all' || filter.applied.role !== 'all';

  return (
    <>
      <PageHeader title={membersCopy.title} description={membersCopy.description} />

      <FilterBar onSubmit={filter.submit} submitClassName="w-20 !text-headline-sm">
        <TextInput
          leadingIcon="search"
          className="min-w-[280px] flex-1"
          placeholder={membersCopy.searchPlaceholder}
          value={filter.draft.query}
          onChange={(event) => filter.update('query', event.target.value)}
        />
        <Select className="w-[200px]" options={memberStatusOptions} value={filter.draft.status} onChange={(v) => filter.update('status', v)} />
        <Select className="w-[200px]" options={memberRoleOptions} value={filter.draft.role} onChange={(v) => filter.update('role', v)} />
      </FilterBar>

      <div className="mb-4 flex items-center justify-between">
        <ResultCount count={isFiltered ? rows.length : membersCopy.totalCount} unit={` ${ui.personUnit}`} />
        <Select className="w-[152px]" options={memberSortOptions} value={sort} onChange={setSort} />
      </div>

      <MemberTable members={rows} />
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={pagination.goTo} />
    </>
  );
};

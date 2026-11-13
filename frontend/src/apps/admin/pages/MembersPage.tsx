import React from 'react';
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
  membersCopy,
  ui,
} from '../data/mockData';
import { useMembers, type MemberFilters } from '../hooks/useMembers';

export const MembersPage: React.FC = () => {
  const list = useMembers();

  return (
    <>
      <PageHeader title={membersCopy.title} description={membersCopy.description} />

      <FilterBar onSubmit={list.submit} submitClassName="w-20 !text-headline-sm">
        <TextInput
          leadingIcon="search"
          className="min-w-[280px] flex-1"
          placeholder={membersCopy.searchPlaceholder}
          value={list.draft.query}
          onChange={(event) => list.update('query', event.target.value)}
        />
        <Select
          className="w-[200px]"
          options={memberStatusOptions}
          value={list.draft.status}
          onChange={(v) => list.update('status', v)}
        />
        <Select
          className="w-[200px]"
          options={memberRoleOptions}
          value={list.draft.role}
          onChange={(v) => list.update('role', v)}
        />
      </FilterBar>

      <div className="mb-4 flex items-center justify-between">
        <ResultCount count={list.totalCount} unit={` ${ui.personUnit}`} />
        <Select
          className="w-[152px]"
          options={memberSortOptions}
          value={list.applied.sort}
          onChange={(v) => list.applyNow('sort', v as MemberFilters['sort'])}
        />
      </div>

      <MemberTable
        members={list.items}
        message={list.loading ? ui.loading : (list.errorMessage ?? undefined)}
      />
      <Pagination page={list.page} totalPages={list.totalPages} onChange={list.goTo} />
    </>
  );
};

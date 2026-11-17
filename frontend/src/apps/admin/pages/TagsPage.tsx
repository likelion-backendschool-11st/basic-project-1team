import React from 'react';
import { Pagination } from '../../../shared/layout/Pagination';
import { TagBlockModal } from '../components/tags/TagBlockModal';
import { TagCreateForm } from '../components/tags/TagCreateForm';
import { TagMergeModal } from '../components/tags/TagMergeModal';
import { TagTable } from '../components/tags/TagTable';
import { TagUnmergeModal } from '../components/tags/TagUnmergeModal';
import { Select, TextInput } from '../components/ui/FormControls';
import { PageHeader } from '../components/ui/PageHeader';
import { ResultCount } from '../components/ui/ResultCount';
import { tagSortOptions, tagStatusOptions, tagsCopy, ui } from '../data/mockData';
import { useTagBlock } from '../hooks/useTagBlock';
import { useTagManager, type TagSort, type TagStatusFilter } from '../hooks/useTagManager';

export const TagsPage: React.FC = () => {
  const manager = useTagManager();
  const { list } = manager;
  const block = useTagBlock(manager.handleBlocked);

  return (
    <>
      <PageHeader title={tagsCopy.title} description={tagsCopy.description} />

      <TagCreateForm
        name={manager.draftName}
        nameError={manager.nameError}
        description={manager.draftDescription}
        editing={manager.editingId !== null}
        canSubmit={manager.canSubmit}
        onNameChange={manager.setDraftName}
        onDescriptionChange={manager.setDraftDescription}
        onSubmit={manager.create}
        onCancelEdit={manager.cancelEdit}
      />

      <div className="mb-5 flex items-center justify-between gap-4">
        <TextInput
          leadingIcon="search"
          className="w-[360px]"
          placeholder={tagsCopy.searchPlaceholder}
          value={manager.query}
          onChange={(event) => manager.setQuery(event.target.value)}
          aria-label={tagsCopy.searchPlaceholder}
        />
        <div className="flex items-center gap-3">
          <Select<TagStatusFilter>
            className="w-[142px]"
            options={tagStatusOptions as readonly { value: TagStatusFilter; label: string }[]}
            value={manager.statusFilter}
            onChange={manager.setStatusFilter}
          />
          <Select<TagSort>
            className="w-[142px]"
            options={tagSortOptions as readonly { value: TagSort; label: string }[]}
            value={manager.sort}
            onChange={manager.setSort}
          />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <ResultCount count={list.totalCount} />
        {manager.actionError && (
          <p role="alert" className="text-body-md text-error">
            {manager.actionError}
          </p>
        )}
      </div>

      <TagTable
        tags={list.items}
        message={list.loading ? ui.loading : (list.errorMessage ?? undefined)}
        onEdit={manager.startEdit}
        onMerge={manager.openMerge}
        // 삭제 = 차단. 태그가 0개가 되는 질문이 있으면 대체 태그를 고른다 (API_SPEC 10.5)
        onRemove={block.open}
        onRestore={(tag) => manager.restore(tag.id)}
        onUnmerge={manager.openUnmerge}
      />
      <Pagination
        page={list.page}
        totalPages={list.totalPages}
        onChange={list.goTo}
        className="py-5"
      />

      {manager.mergeSource && (
        <TagMergeModal
          key={manager.mergeSource.id}
          source={manager.mergeSource}
          submitting={manager.merging}
          errorMessage={manager.mergeError}
          onClose={manager.closeMerge}
          onMerge={manager.merge}
        />
      )}
      {manager.unmergeTarget && (
        <TagUnmergeModal
          tag={manager.unmergeTarget}
          submitting={manager.unmerging}
          errorMessage={manager.unmergeError}
          onClose={manager.closeUnmerge}
          onConfirm={manager.unmerge}
        />
      )}
      {block.target && (
        <TagBlockModal
          key={block.target.id}
          tag={block.target}
          impact={block.impact}
          impactError={block.impactError}
          submitting={block.submitting}
          errorMessage={block.submitError}
          onClose={block.close}
          onConfirm={block.confirm}
        />
      )}
    </>
  );
};

import React from 'react';
import { TagCreateForm } from '../components/tags/TagCreateForm';
import { TagMergeModal } from '../components/tags/TagMergeModal';
import { TagTable } from '../components/tags/TagTable';
import { ConfirmDeleteModal } from '../components/ui/ConfirmDeleteModal';
import { Select, TextInput } from '../components/ui/FormControls';
import { PageHeader } from '../components/ui/PageHeader';
import { Pagination } from '../components/ui/Pagination';
import { ResultCount } from '../components/ui/ResultCount';
import {
  confirmDeleteCopy,
  tagSortOptions,
  tagStatusOptions,
  tagsCopy,
  ui,
} from '../data/mockData';
import { useConfirmDelete } from '../hooks/useConfirmDelete';
import { useTagManager, type TagSort, type TagStatusFilter } from '../hooks/useTagManager';

export const TagsPage: React.FC = () => {
  const manager = useTagManager();
  const { list } = manager;
  const confirmDelete = useConfirmDelete();

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
        onRemove={(tag) =>
          // 삭제 = 차단. 사용 중이어도 가능하고 질문과의 연결만 끊긴다 (API_SPEC 10.5)
          confirmDelete.ask({
            target: `${confirmDeleteCopy.targets.tag} ${tag.name}`,
            notes: [
              ...(tag.questionCount > 0 ? [confirmDeleteCopy.tagInUse(tag.questionCount)] : []),
              confirmDeleteCopy.tagBlocked,
            ],
            onConfirm: () => manager.remove(tag.id),
          })
        }
        onRestore={(tag) => manager.restore(tag.id)}
      />
      <Pagination page={list.page} totalPages={list.totalPages} onChange={list.goTo} />

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
      <ConfirmDeleteModal state={confirmDelete} />
    </>
  );
};

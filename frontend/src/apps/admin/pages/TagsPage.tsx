import { TagCreateForm } from '../components/tags/TagCreateForm';
import { TagMergeModal } from '../components/tags/TagMergeModal';
import { TagTable } from '../components/tags/TagTable';
import { Select, TextInput } from '../components/ui/FormControls';
import { ConfirmDeleteModal } from '../components/ui/ConfirmDeleteModal';
import { PageHeader } from '../components/ui/PageHeader';
import { Pagination } from '../components/ui/Pagination';
import { confirmDeleteCopy, pageCounts, tagSortOptions, tagStatusOptions, tags, tagsCopy } from '../data/mockData';
import { useConfirmDelete } from '../hooks/useConfirmDelete';
import { usePagination } from '../hooks/usePagination';
import { useTagManager, type TagSort, type TagStatusFilter } from '../hooks/useTagManager';

export function TagsPage() {
  const manager = useTagManager(tags);
  const pagination = usePagination(pageCounts.tags);
  const confirmDelete = useConfirmDelete();

  return (
    <>
      <PageHeader title={tagsCopy.title} description={tagsCopy.description} />

      <TagCreateForm
        name={manager.draftName}
        nameError={manager.nameError}
        description={manager.draftDescription}
        editing={manager.editingName !== null}
        onNameChange={manager.setDraftName}
        onDescriptionChange={manager.setDraftDescription}
        onSubmit={manager.create}
        onCancelEdit={manager.cancelEdit}
      />

      <div className="mb-5 flex items-center justify-between">
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
          <Select<TagSort> className="w-[142px]" options={tagSortOptions as readonly { value: TagSort; label: string }[]} value={manager.sort} onChange={manager.setSort} />
        </div>
      </div>

      <TagTable
        tags={manager.visibleTags}
        onEdit={manager.startEdit}
        onMerge={manager.openMerge}
        onRemove={(tag) =>
          // 삭제 = 차단. 사용 중이어도 가능하고 질문과의 연결만 끊긴다 (API_SPEC 10.5)
          confirmDelete.ask({
            target: `${confirmDeleteCopy.targets.tag} ${tag.name}`,
            notes: [...(tag.usage > 0 ? [confirmDeleteCopy.tagInUse(tag.usage)] : []), confirmDeleteCopy.tagBlocked],
            onConfirm: () => manager.remove(tag.name),
          })
        }
        onRestore={(tag) => manager.restore(tag.name)}
      />
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={pagination.goTo} />

      {manager.mergeSource && (
        <TagMergeModal
          key={manager.mergeSource.name}
          source={manager.mergeSource}
          tags={manager.activeTags}
          onClose={manager.closeMerge}
          onMerge={manager.merge}
        />
      )}
      <ConfirmDeleteModal state={confirmDelete} />
    </>
  );
}

export default TagsPage;

import { TagCreateForm } from '../components/tags/TagCreateForm';
import { TagMergeModal } from '../components/tags/TagMergeModal';
import { TagTable } from '../components/tags/TagTable';
import { Select, TextInput } from '../components/ui/FormControls';
import { PageHeader } from '../components/ui/PageHeader';
import { Pagination } from '../components/ui/Pagination';
import { pageCounts, tagSortOptions, tags, tagsCopy } from '../data/mockData';
import { usePagination } from '../hooks/usePagination';
import { useTagManager, type TagSort } from '../hooks/useTagManager';

interface TagsPageProps {}

export function TagsPage(_props: Readonly<TagsPageProps>) {
  const manager = useTagManager(tags);
  const pagination = usePagination(pageCounts.tags);

  return (
    <>
      <PageHeader title={tagsCopy.title} description={tagsCopy.description} />

      <TagCreateForm
        name={manager.draftName}
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
        <Select<TagSort> className="w-[142px]" options={tagSortOptions as readonly { value: TagSort; label: string }[]} value={manager.sort} onChange={manager.setSort} />
      </div>

      <TagTable
        tags={manager.visibleTags}
        onEdit={manager.startEdit}
        onMerge={manager.openMerge}
        onRemove={(tag) => {
          // 사용 중인 태그도 삭제 가능. 질문과의 연결만 끊긴다 (API_SPEC 10.5)
          const message = tag.usage > 0 ? tagsCopy.removeInUseConfirm(tag.usage) : tagsCopy.removeConfirm;
          if (window.confirm(message)) manager.remove(tag.name);
        }}
      />
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={pagination.goTo} />

      {manager.mergeSource && (
        <TagMergeModal
          key={manager.mergeSource.name}
          source={manager.mergeSource}
          tags={manager.tags}
          onClose={manager.closeMerge}
          onMerge={manager.merge}
        />
      )}
    </>
  );
}

export default TagsPage;

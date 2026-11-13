import React from 'react';
import { NoticeEditor } from '../components/notices/NoticeEditor';
import { NoticeTable } from '../components/notices/NoticeTable';
import { Button } from '../components/ui/Button';
import { ConfirmDeleteModal } from '../components/ui/ConfirmDeleteModal';
import { Pagination } from '../components/ui/Pagination';
import { PageHeader } from '../components/ui/PageHeader';
import { confirmDeleteCopy, noticesCopy, ui } from '../data/mockData';
import { useConfirmDelete } from '../hooks/useConfirmDelete';
import { useNoticeEditor } from '../hooks/useNoticeEditor';

export const NoticesPage: React.FC = () => {
  const editor = useNoticeEditor();
  const { list } = editor;
  const confirmDelete = useConfirmDelete();

  const remove = (id: number) =>
    confirmDelete.ask({
      target: `${confirmDeleteCopy.targets.notice} #${id}`,
      onConfirm: () => editor.remove(id),
    });

  return (
    <>
      <PageHeader
        title={noticesCopy.title}
        description={noticesCopy.description}
        actions={
          <Button
            variant="primary"
            icon="add"
            onClick={editor.startNew}
            className="!h-11 !text-body-lg"
          >
            {noticesCopy.newNotice}
          </Button>
        }
      />

      <div className="flex items-start gap-8">
        <div className="min-w-0 flex-1 self-start">
          <NoticeTable
            notices={list.items}
            message={list.loading ? ui.loading : (list.errorMessage ?? undefined)}
            editingId={editor.draft?.id ?? null}
            onEdit={editor.startEdit}
            onRemove={remove}
          />
          <Pagination page={list.page} totalPages={list.totalPages} onChange={list.goTo} />
        </div>
        <NoticeEditor
          draft={editor.draft}
          isNew={editor.isNew}
          canSave={editor.canSave}
          errorMessage={editor.errorMessage}
          onFieldChange={editor.setField}
          onSave={editor.save}
          onCancel={editor.cancel}
        />
      </div>
      <ConfirmDeleteModal state={confirmDelete} />
    </>
  );
};

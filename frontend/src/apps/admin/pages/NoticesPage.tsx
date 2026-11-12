import React from 'react';
import { NoticeEditor } from '../components/notices/NoticeEditor';
import { NoticeTable } from '../components/notices/NoticeTable';
import { Button } from '../components/ui/Button';
import { ConfirmDeleteModal } from '../components/ui/ConfirmDeleteModal';
import { PageHeader } from '../components/ui/PageHeader';
import { confirmDeleteCopy, notices, noticesCopy } from '../data/mockData';
import { useConfirmDelete } from '../hooks/useConfirmDelete';
import { useNoticeEditor } from '../hooks/useNoticeEditor';

const editorOptions = { author: noticesCopy.defaultAuthor, createdAt: noticesCopy.newNoticeDate };

export const NoticesPage: React.FC = () => {
  const editor = useNoticeEditor(notices, editorOptions);
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
        <NoticeTable
          notices={editor.notices}
          editingId={editor.draft?.id ?? null}
          onEdit={editor.startEdit}
          onRemove={remove}
        />
        <NoticeEditor
          draft={editor.draft}
          isNew={editor.isNew}
          canSave={editor.canSave}
          onFieldChange={editor.setField}
          onSave={editor.save}
          onCancel={editor.cancel}
        />
      </div>
      <ConfirmDeleteModal state={confirmDelete} />
    </>
  );
};

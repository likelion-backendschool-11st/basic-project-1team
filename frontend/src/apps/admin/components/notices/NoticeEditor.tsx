import type { FormEvent } from 'react';
import { noticesCopy, ui } from '../../data/mockData';
import type { NoticeDraft } from '../../hooks/useNoticeEditor';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Checkbox, FieldLabel, TextArea, TextInput } from '../ui/FormControls';

interface NoticeEditorProps {
  readonly draft: NoticeDraft | null;
  readonly isNew: boolean;
  readonly canSave: boolean;
  readonly onFieldChange: <K extends 'title' | 'body' | 'pinned'>(key: K, value: NoticeDraft[K]) => void;
  readonly onSave: (event: FormEvent) => void;
  readonly onCancel: () => void;
}

export function NoticeEditor({ draft, isNew, canSave, onFieldChange, onSave, onCancel }: NoticeEditorProps) {
  const c = noticesCopy;

  if (!draft) {
    return (
      <Card as="aside" className="w-[450px] shrink-0 self-start text-center text-body-md text-ink-subtle">
        {c.emptyEditor}
      </Card>
    );
  }

  return (
    <Card as="aside" className="w-[450px] shrink-0 self-start">
      <div className="flex items-center gap-2.5 border-b border-hairline pb-4">
        <h2 className="text-headline-sm font-bold text-ink">{isNew ? c.editorNewTitle : c.editorEditTitle}</h2>
        {draft.pinned && (
          <Badge tone="primary" shape="chip">
            {c.pinnedNoticeBadge}
          </Badge>
        )}
      </div>

      <form onSubmit={onSave} className="mt-5 space-y-5">
        <div>
          <FieldLabel htmlFor="notice-title">{c.titleLabel}</FieldLabel>
          <TextInput
            id="notice-title"
            placeholder={c.titlePlaceholder}
            value={draft.title}
            onChange={(event) => onFieldChange('title', event.target.value)}
            className="[&>input]:h-11 [&>input]:bg-surface-2"
          />
        </div>
        <div>
          <FieldLabel htmlFor="notice-body">{c.bodyLabel}</FieldLabel>
          <TextArea
            id="notice-body"
            rows={8}
            placeholder={c.bodyPlaceholder}
            value={draft.body}
            onChange={(event) => onFieldChange('body', event.target.value)}
            className="bg-surface-2 !leading-7"
          />
        </div>
        <Checkbox label={c.pinLabel} checked={draft.pinned} onChange={(value) => onFieldChange('pinned', value)} />
        <div className="flex justify-end gap-2 border-t border-hairline pt-5">
          <Button onClick={onCancel}>{ui.cancel}</Button>
          <Button type="submit" variant="primary" disabled={!canSave}>
            {ui.save}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default NoticeEditor;

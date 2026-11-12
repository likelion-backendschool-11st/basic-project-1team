import React from 'react';
import { editAnswerPage as P } from '../../data/mockData';
import type { useAttachments } from '../../hooks/useAttachments';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { AttachmentTile } from '../editor/AttachmentTile';
import { HiddenFileInput } from '../editor/HiddenFileInput';

interface AnswerAttachmentsCardProps {
  readonly files: ReturnType<typeof useAttachments>;
}

export const AnswerAttachmentsCard: React.FC<AnswerAttachmentsCardProps> = ({ files }) => (
  <Card as="section" className="p-space-md">
    <div className="flex items-center justify-between gap-space-sm mb-space-sm">
      <div className="flex items-center gap-2">
        <Icon name="attachment" className="text-ink-subtle text-[18px]" />
        <h3 className="font-headline-sm text-headline-sm text-ink font-semibold">{P.attachmentsTitle}</h3>
        <span className="font-code-inline text-[11px] text-ink-tertiary px-1.5 py-0.5 rounded bg-surface-2 border border-hairline">
          {P.attachmentsCount.replace('2', String(files.items.length))}
        </span>
      </div>
      <span className="font-caption text-caption text-ink-tertiary">{P.attachmentsLimit}</span>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs mb-space-sm">
      {files.items.map((a) => (
        <AttachmentTile key={a.id} variant="answer" attachment={a} onRemove={files.remove} />
      ))}
    </div>
    <button
      type="button"
      onClick={files.openPicker}
      className="w-full rounded-lg border border-dashed border-hairline-strong hover:border-primary-container p-space-md text-center bg-surface-2/40 hover:bg-surface-2/80 transition-all flex flex-col items-center justify-center gap-1.5"
    >
      <div className="w-9 h-9 rounded-full bg-surface-3 flex items-center justify-center text-ink-subtle">
        <Icon name="cloud_upload" className="text-[20px]" />
      </div>
      <p className="font-label-md text-label-md text-ink font-medium">{P.dropTitle}</p>
      <p className="font-caption text-caption text-ink-tertiary">
        {P.dropHintPrefix}
        <span className="text-primary underline underline-offset-2">{P.dropHintLink}</span>
      </p>
    </button>
    <HiddenFileInput inputRef={files.inputRef} onChange={files.onFilesSelected} />
  </Card>
);

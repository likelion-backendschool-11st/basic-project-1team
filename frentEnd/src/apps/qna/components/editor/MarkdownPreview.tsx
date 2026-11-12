import React from 'react';

interface MarkdownPreviewProps {
  readonly source: string;
}

/** Minimal block-level preview mirroring the Stitch inline renderer: numbered items, 💡 tips, paragraphs. */
export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ source }) => (
  <div className="w-full min-h-[300px] text-ink font-body-md text-body-md leading-relaxed space-y-4 p-space-xs">
    {source.split(/\n{2,}/).map((block, i) => {
      if (block.startsWith('💡')) {
        return (
          <div key={i} className="p-3 my-2 rounded bg-surface-2 border border-hairline text-tertiary font-body-sm text-body-sm whitespace-pre-line">
            {block}
          </div>
        );
      }
      const numbered = block.match(/^(\d+)\.\s([\s\S]*)$/);
      if (numbered) {
        return (
          <div key={i} className="flex items-start gap-2 my-1">
            <span className="font-code-inline text-primary font-bold">{numbered[1]}.</span>
            <span className="whitespace-pre-line">{numbered[2]}</span>
          </div>
        );
      }
      return (
        <p key={i} className="whitespace-pre-line">
          {block}
        </p>
      );
    })}
  </div>
);

export default MarkdownPreview;

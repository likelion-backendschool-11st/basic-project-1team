import React, { lazy, Suspense } from 'react';
import type { RichTextEditorProps } from './FroalaRichTextEditor';

export type { RichTextEditorProps, RichTextPreset } from './FroalaRichTextEditor';

// Froala 는 JS·CSS 가 커서 에디터가 있는 화면을 열 때만 불러온다
const FroalaRichTextEditor = lazy(() =>
  import('./FroalaRichTextEditor').then((m) => ({ default: m.FroalaRichTextEditor })),
);

/** WYSIWYG 에디터. 불러오는 동안은 같은 높이의 빈 칸을 보여 준다. */
export const RichTextEditor: React.FC<RichTextEditorProps> = (props) => {
  const minHeight = props.minHeight ?? (props.preset === 'simple' ? 120 : 280);
  return (
    <Suspense
      fallback={
        <div
          aria-busy="true"
          className="rounded-lg border border-hairline bg-surface-1"
          style={{ minHeight: minHeight + 50 }}
        />
      }
    >
      <FroalaRichTextEditor {...props} />
    </Suspense>
  );
};

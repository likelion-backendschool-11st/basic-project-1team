import { useRef, useState } from 'react';

export type FormatCommand =
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'heading'
  | 'quote'
  | 'codeblock'
  | 'bullet'
  | 'number'
  | 'link';

const wrap = (cmd: FormatCommand, selected: string): string => {
  switch (cmd) {
    case 'bold':
      return `**${selected || '텍스트'}**`;
    case 'italic':
      return `*${selected || '텍스트'}*`;
    case 'strikethrough':
      return `~~${selected || '텍스트'}~~`;
    case 'heading':
      return `\n### ${selected || '소제목'}\n`;
    case 'quote':
      return `\n> ${selected || '인용구'}\n`;
    case 'codeblock':
      return `\n\`\`\`log\n${selected || '// 여기에 로그 또는 코드를 붙여넣으세요'}\n\`\`\`\n`;
    case 'bullet':
      return `\n- ${selected || '항목'}`;
    case 'number':
      return `\n1. ${selected || '항목'}`;
    case 'link':
      return `[${selected || '링크 제목'}](https://)`;
  }
};

export function useMarkdownEditor(initial = '') {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (cmd: FormatCommand) => {
    const el = ref.current;
    if (!el) return;
    el.setRangeText(
      wrap(cmd, el.value.substring(el.selectionStart, el.selectionEnd)),
      el.selectionStart,
      el.selectionEnd,
      'end',
    );
    setValue(el.value);
    el.focus();
  };

  /** Appends a template block; when `confirmMessage` is set and content exists, asks first. */
  const appendTemplate = (template: string, separator = '\n\n', confirmMessage?: string) => {
    if (value && confirmMessage && !window.confirm(confirmMessage)) return;
    setValue((prev) => (prev ? prev + separator + template : template));
    ref.current?.focus();
  };

  return { value, setValue, ref, length: value.length, applyFormat, appendTemplate } as const;
}

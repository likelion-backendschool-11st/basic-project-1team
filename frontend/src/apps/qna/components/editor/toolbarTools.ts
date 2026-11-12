import type { FormatCommand } from '../../hooks/useMarkdownEditor';

export interface ToolbarTool {
  readonly cmd: FormatCommand;
  readonly icon: string;
  readonly title: string;
  readonly label?: string;
  readonly dividerBefore?: boolean;
}

export const reportTools: readonly ToolbarTool[] = [
  { cmd: 'bold', icon: 'format_bold', title: '굵게' },
  { cmd: 'italic', icon: 'format_italic', title: '기울임' },
  { cmd: 'quote', icon: 'format_quote', title: '인용구' },
  { cmd: 'codeblock', icon: 'code', title: '코드 블록' },
];

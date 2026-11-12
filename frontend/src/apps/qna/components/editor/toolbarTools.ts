import type { FormatCommand } from '../../hooks/useMarkdownEditor';

export interface ToolbarTool {
  readonly cmd: FormatCommand;
  readonly icon: string;
  readonly title: string;
  readonly label?: string;
  readonly dividerBefore?: boolean;
}

export const newQuestionTools: readonly ToolbarTool[] = [
  { cmd: 'bold', icon: 'format_bold', title: '굵게 (Ctrl+B)' },
  { cmd: 'italic', icon: 'format_italic', title: '기울임 (Ctrl+I)' },
  { cmd: 'strikethrough', icon: 'format_strikethrough', title: '취소선' },
  { cmd: 'heading', icon: 'title', title: '제목 (Heading)', dividerBefore: true },
  { cmd: 'quote', icon: 'format_quote', title: '인용구' },
  { cmd: 'codeblock', icon: 'terminal', title: '코드 및 로그 블록 삽입', label: '로그 블록' },
  { cmd: 'bullet', icon: 'format_list_bulleted', title: '순서 없는 목록', dividerBefore: true },
  { cmd: 'number', icon: 'format_list_numbered', title: '순서 있는 목록' },
  { cmd: 'link', icon: 'link', title: '외부 링크 첨부', dividerBefore: true },
];

export const editQuestionTools: readonly ToolbarTool[] = [
  { cmd: 'bold', icon: 'format_bold', title: 'Bold' },
  { cmd: 'italic', icon: 'format_italic', title: 'Italic' },
  { cmd: 'strikethrough', icon: 'strikethrough_s', title: 'Strikethrough' },
  { cmd: 'heading', icon: 'title', title: 'Heading', dividerBefore: true },
  { cmd: 'quote', icon: 'format_quote', title: 'Quote' },
  { cmd: 'codeblock', icon: 'code_blocks', title: 'Code Block' },
  { cmd: 'bullet', icon: 'format_list_bulleted', title: 'Bulleted List' },
  { cmd: 'link', icon: 'link', title: 'Link', dividerBefore: true },
];

export const answerEditTools: readonly ToolbarTool[] = [
  { cmd: 'bold', icon: 'format_bold', title: '굵게 (Ctrl+B)' },
  { cmd: 'italic', icon: 'format_italic', title: '기울임 (Ctrl+I)' },
  { cmd: 'strikethrough', icon: 'strikethrough_s', title: '취소선' },
  { cmd: 'codeblock', icon: 'code_blocks', title: '코드 블록 삽입', dividerBefore: true },
  { cmd: 'quote', icon: 'format_quote', title: '인용구' },
  { cmd: 'bullet', icon: 'format_list_bulleted', title: '글머리 기호 목록', dividerBefore: true },
  { cmd: 'number', icon: 'format_list_numbered', title: '번호 매기기 목록' },
  { cmd: 'link', icon: 'link', title: '하이퍼링크 삽입', dividerBefore: true },
];

export const reportTools: readonly ToolbarTool[] = [
  { cmd: 'bold', icon: 'format_bold', title: '굵게' },
  { cmd: 'italic', icon: 'format_italic', title: '기울임' },
  { cmd: 'quote', icon: 'format_quote', title: '인용구' },
  { cmd: 'codeblock', icon: 'code', title: '코드 블록' },
];

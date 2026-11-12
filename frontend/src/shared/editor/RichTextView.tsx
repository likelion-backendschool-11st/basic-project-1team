import 'froala-editor/css/froala_style.min.css';
import React from 'react';
import './view.css';

interface RichTextViewProps {
  /** 에디터로 작성한 본문(HTML) */
  readonly html: string;
  readonly className?: string;
}

/**
 * 에디터로 작성한 본문을 보여 준다.
 * 서버가 저장 전에 허용 목록 방식으로 정리한 HTML 만 내려주므로(API_SPEC 1.9) 그대로 그린다.
 */
export const RichTextView: React.FC<RichTextViewProps> = ({ html, className = '' }) => (
  <div className={`fr-view rich-text ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
);

import React, { useCallback } from 'react';
import { SPOILER_CLASS, SPOILER_REVEALED_CLASS } from './richText';
import './view.css';

interface RichTextViewProps {
  /** 에디터로 작성한 본문(HTML) */
  readonly html: string;
  readonly className?: string;
}

/**
 * 에디터로 작성한 본문을 보여 준다.
 * 서버가 저장 전에 허용 목록 방식으로 정리한 HTML 만 내려주므로(API_SPEC 1.9) 그대로 그린다.
 * 스포일러로 가린 부분은 누르면 보여 준다 (REQ-BOARD-019)
 */
export const RichTextView: React.FC<RichTextViewProps> = ({ html, className = '' }) => {
  // 본문은 HTML 문자열이라 스포일러마다 핸들러를 달 수 없어, 바깥에서 눌린 곳을 찾는다
  const revealSpoiler = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const spoiler = (e.target as HTMLElement).closest(`.${SPOILER_CLASS}`);
    if (!spoiler || spoiler.classList.contains(SPOILER_REVEALED_CLASS)) return;
    // 가린 채로 안의 링크가 눌리지 않게 첫 클릭은 보여 주기만 한다
    e.preventDefault();
    spoiler.classList.add(SPOILER_REVEALED_CLASS);
  }, []);

  return (
    <div
      className={`rich-text ${className}`}
      onClick={revealSpoiler}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

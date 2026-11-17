import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { questionListPage as P } from '../../data/mockData';
import { routes } from '../../routes';

/** 마우스가 태그 칸에서 플로팅 창으로 옮겨 가는 동안 닫히지 않게 기다리는 시간 */
const CLOSE_DELAY_MS = 200;
/** 플로팅 창 최대 너비. 화면 오른쪽을 넘지 않게 왼쪽 위치를 당긴다 */
const FLOATING_WIDTH = 260;

const chipClass =
  'inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded bg-surface-2 border border-hairline font-code-inline text-[11px] text-ink-muted hover:bg-surface-3 hover:border-primary hover:text-primary-hover transition-colors';

interface TagLinkProps {
  readonly tag: string;
}

// 질문 행 전체가 상세로 가는 링크라, 태그를 누르면 행 이동을 막고 태그 상세로 간다
const TagLink: React.FC<TagLinkProps> = ({ tag }) => (
  <Link to={routes.tag(tag)} onClick={(e) => e.stopPropagation()} className={chipClass}>
    {tag}
  </Link>
);

interface QuestionTagListProps {
  readonly tags: readonly string[];
  readonly className?: string;
}

/**
 * 질문 목록의 태그. 첫 태그는 줄이지 않고 그대로 보여 주고, 나머지는 +N 으로 접는다.
 * 태그 칸에 마우스를 올리면(키보드 포커스·터치는 +N 을 누르면) 전체 태그를 플로팅 창으로 보여 준다.
 * 표가 overflow 로 잘리므로 플로팅 창은 화면 기준(fixed)으로 띄운다.
 */
export const QuestionTagList: React.FC<QuestionTagListProps> = ({ tags, className = '' }) => {
  const [first, ...rest] = tags;
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  const open = () => {
    if (rest.length === 0) return;
    window.clearTimeout(closeTimer.current);
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      top: rect.bottom + 4,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - FLOATING_WIDTH - 8)),
    });
  };
  const close = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setPosition(null), CLOSE_DELAY_MS);
  };

  // 펼친 채로 스크롤하면 위치가 어긋나므로 닫는다
  useEffect(() => {
    if (!position) return undefined;
    const hide = () => setPosition(null);
    window.addEventListener('scroll', hide, true);
    return () => window.removeEventListener('scroll', hide, true);
  }, [position]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  if (first === undefined) return null;

  return (
    <div
      ref={anchorRef}
      onMouseEnter={open}
      onMouseLeave={close}
      className={`inline-flex items-center gap-1 ${className}`}
    >
      <TagLink tag={first} />
      {rest.length > 0 && (
        <button
          type="button"
          aria-label={P.moreTagsLabel(rest.length)}
          aria-expanded={position !== null}
          onClick={(e) => {
            e.stopPropagation();
            if (position) setPosition(null);
            else open();
          }}
          onFocus={open}
          onBlur={close}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setPosition(null);
          }}
          className="shrink-0 px-1.5 py-0.5 rounded bg-surface-3 font-code-inline text-[11px] text-ink-subtle hover:text-ink"
        >
          +{rest.length}
        </button>
      )}
      {position && (
        <div
          role="tooltip"
          onMouseEnter={open}
          onMouseLeave={close}
          onClick={(e) => e.stopPropagation()}
          style={{ top: position.top, left: position.left, maxWidth: FLOATING_WIDTH }}
          className="fixed z-[60] w-max flex flex-col gap-1.5 p-2.5 rounded-lg bg-surface-1 border border-hairline shadow-xl"
        >
          <span className="font-caption text-caption text-ink-tertiary">
            {P.allTagsLabel(tags.length)}
          </span>
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <TagLink key={tag} tag={tag} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

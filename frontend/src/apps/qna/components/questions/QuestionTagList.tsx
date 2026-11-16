import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { questionListPage as P } from '../../data/mockData';
import { routes } from '../../routes';

/** 칸이 좁을 때 몇 글자까지 칩으로 보여 줄지. 넘는 태그는 +N 으로 접는다 */
const DEFAULT_CHAR_BUDGET = 12;
/** 마우스가 +N 에서 펼친 목록으로 옮겨 가는 동안 닫히지 않게 기다리는 시간 */
const CLOSE_DELAY_MS = 200;

const chipClass =
  'inline-flex items-center max-w-full px-2 py-0.5 rounded bg-surface-2 border border-hairline font-code-inline text-[11px] text-ink-muted hover:bg-surface-3 hover:border-primary hover:text-primary-hover transition-colors';

/** 앞에서부터 글자 수 합이 budget 을 넘지 않는 만큼 보여 준다. 첫 태그는 길어도 말줄임으로 보여 준다 */
function splitVisible(tags: readonly string[], budget: number) {
  let used = 0;
  let count = 0;
  for (const tag of tags) {
    const length = Array.from(tag).length;
    if (count > 0 && used + length > budget) break;
    used += length;
    count += 1;
  }
  return { visible: tags.slice(0, count), hidden: tags.slice(count) };
}

interface TagLinkProps {
  readonly tag: string;
}

// 질문 행 전체가 상세로 가는 링크라, 태그를 누르면 행 이동을 막고 태그 상세로 간다
const TagLink: React.FC<TagLinkProps> = ({ tag }) => (
  <Link
    to={routes.tag(tag)}
    title={`#${tag}`}
    onClick={(e) => e.stopPropagation()}
    className={chipClass}
  >
    <span className="truncate">{tag}</span>
  </Link>
);

interface QuestionTagListProps {
  readonly tags: readonly string[];
  /** 칩으로 보여 줄 글자 수 합 */
  readonly charBudget?: number;
  readonly className?: string;
}

/**
 * 질문 목록의 태그. 등록된 태그를 모두 보여 주되, 칸을 넘으면 +N 으로 접고
 * 마우스를 올리거나(키보드로 포커스하면) 나머지 태그를 펼쳐 보여 준다.
 * 표가 overflow 로 잘리므로 펼친 목록은 화면 기준(fixed)으로 띄운다.
 */
export const QuestionTagList: React.FC<QuestionTagListProps> = ({
  tags,
  charBudget = DEFAULT_CHAR_BUDGET,
  className = '',
}) => {
  const { visible, hidden } = splitVisible(tags, charBudget);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  const open = () => {
    window.clearTimeout(closeTimer.current);
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({ top: rect.bottom + 4, left: Math.min(rect.left, window.innerWidth - 248) });
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

  if (tags.length === 0) return null;

  return (
    <div className={`flex items-center gap-1 min-w-0 ${className}`}>
      {visible.map((tag) => (
        <span key={tag} className="min-w-0 flex">
          <TagLink tag={tag} />
        </span>
      ))}
      {hidden.length > 0 && (
        <>
          <button
            ref={triggerRef}
            type="button"
            aria-label={P.moreTagsLabel(hidden.length)}
            aria-expanded={position !== null}
            onClick={(e) => {
              e.stopPropagation();
              if (position) setPosition(null);
              else open();
            }}
            onMouseEnter={open}
            onMouseLeave={close}
            onFocus={open}
            onBlur={close}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setPosition(null);
            }}
            className="shrink-0 px-1.5 py-0.5 rounded bg-surface-3 font-code-inline text-[11px] text-ink-subtle hover:text-ink"
          >
            +{hidden.length}
          </button>
          {position && (
            <div
              role="tooltip"
              onMouseEnter={open}
              onMouseLeave={close}
              onClick={(e) => e.stopPropagation()}
              style={{ top: position.top, left: position.left }}
              className="fixed z-[60] w-max max-w-[240px] flex flex-wrap gap-1 p-2 rounded-lg bg-surface-1 border border-hairline shadow-xl"
            >
              {hidden.map((tag) => (
                <TagLink key={tag} tag={tag} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

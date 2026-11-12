import React from 'react';
import { Link } from 'react-router-dom';
import { noticeLabels as L, notices } from '../../data/mockData';
import { useRollingIndex } from '../../hooks/useRollingIndex';
import { routes } from '../../routes';
import { Icon } from '../common/Icon';

const TICKER_SIZE = 5;

/** 헤더 아래 공지 제목 롤링. 제목을 누르면 공지 상세로 이동한다. */
export const NoticeTicker: React.FC = () => {
  // TODO: GET /api/notices?size=5 연동
  const items = notices.slice(0, TICKER_SIZE);
  const rolling = useRollingIndex(items.length);

  if (items.length === 0) return null;

  // 끊김 없는 순환을 위해 첫 공지를 맨 뒤에 한 번 더 붙인다
  const track = items.length > 1 ? [...items, items[0]] : items;

  return (
    <div className="border-t border-hairline">
      <div className="h-9 max-w-[1280px] mx-auto px-margin flex items-center gap-space-sm">
        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary-container/20 border border-primary-container/40 text-primary font-label-sm text-label-sm">
          <Icon name="campaign" className="text-[15px]" />
          {L.tickerLabel}
        </span>
        <div
          className="relative flex-1 min-w-0 h-9 overflow-hidden"
          aria-live="off"
          onMouseEnter={rolling.pause}
          onMouseLeave={rolling.resume}
          onFocus={rolling.pause}
          onBlur={rolling.resume}
        >
          <ul
            onTransitionEnd={rolling.onTransitionEnd}
            className={`${rolling.animate ? 'transition-transform duration-500 ease-out motion-reduce:transition-none' : ''}`}
            style={{ transform: `translateY(-${rolling.index * 100}%)` }}
          >
            {track.map((notice, i) => {
              const visible = i === rolling.index;
              return (
                <li key={`${notice.id}-${i}`} className="h-9 flex items-center" aria-hidden={!visible}>
                  <Link
                    to={routes.notice(notice.id)}
                    tabIndex={visible ? 0 : -1}
                    className="min-w-0 flex items-center gap-space-xs font-body-sm text-body-sm text-ink-muted hover:text-ink transition-colors"
                  >
                    {notice.isPinned && <Icon name="push_pin" className="shrink-0 text-[14px] text-primary" />}
                    <span className="truncate">{notice.title}</span>
                    <span className="shrink-0 font-code-inline text-caption text-ink-tertiary">{notice.createdAt}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <Link
          to={routes.notices()}
          className="shrink-0 inline-flex items-center gap-0.5 font-label-sm text-label-sm text-ink-subtle hover:text-ink transition-colors"
        >
          {L.tickerAll}
          <Icon name="chevron_right" className="text-[16px]" />
        </Link>
      </div>
    </div>
  );
};

export default NoticeTicker;

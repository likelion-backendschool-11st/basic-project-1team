import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../api';
import { goToLogin, isLoggedIn } from '../auth';
import { useNotificationCenter } from '../notificationCenter';
import {
  formatNotificationTime,
  getNotifications,
  type Notification,
  NOTIFICATION_MESSAGES,
  notificationHref,
  notificationLabels as L,
  readAllNotifications,
  readNotification,
} from '../notifications';
import { Icon } from './Icon';
import { useSiteNavigate } from './siteRouting';

const PAGE_SIZE = 10;
const MAX_BADGE = 99;

interface NotificationItemProps {
  readonly notification: Notification;
  readonly onSelect: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification: n, onSelect }) => {
  const message = NOTIFICATION_MESSAGES[n.type];
  const clickable = notificationHref(n) !== null || !n.isRead;
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(n)}
        disabled={!clickable}
        className={`w-full flex items-start gap-space-xs px-space-sm py-2.5 text-left transition-colors disabled:cursor-default ${
          n.isRead ? 'hover:bg-surface-2' : 'bg-primary-container/10 hover:bg-primary-container/15'
        }`}
      >
        <span
          className={`mt-0.5 w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${
            n.type === 'report_action'
              ? 'bg-semantic-danger/15 text-semantic-danger'
              : n.type === 'rank_achieved'
                ? 'bg-tier-challenger/15 text-tier-challenger'
                : 'bg-surface-3 text-ink-subtle'
          }`}
        >
          <Icon name={message.icon} className="text-[17px]" />
        </span>
        <span className="min-w-0 flex-1 flex flex-col gap-0.5">
          <span
            className={`font-body-sm text-body-sm ${n.isRead ? 'text-ink-subtle' : 'text-ink'}`}
          >
            {message.text(n)}
          </span>
          {n.type !== 'rank_achieved' && (
            <span className="truncate font-caption text-caption text-ink-tertiary">{n.title}</span>
          )}
          {n.detail && n.type !== 'report_processed' && (
            <span className="font-caption text-caption text-ink-tertiary">{n.detail}</span>
          )}
          <span className="font-code-inline text-[11px] text-ink-tertiary">
            {formatNotificationTime(n.createdAt)}
          </span>
        </span>
        {!n.isRead && (
          <span aria-hidden="true" className="mt-2 w-2 h-2 shrink-0 rounded-full bg-primary" />
        )}
      </button>
    </li>
  );
};

/**
 * 헤더 알림 버튼과 최근 알림 목록 (REQ-NOTI-006·007).
 * 누르면 읽음 처리하고 관련 화면으로 이동한다. 비회원이 누르면 로그인 화면으로 보낸다.
 */
export const NotificationMenu: React.FC = () => {
  const { unreadCount, refreshUnreadCount } = useNotificationCenter();
  const navigate = useSiteNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (nextPage: number) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await getNotifications(nextPage, PAGE_SIZE);
      setItems((prev) => (nextPage === 1 ? [...result.items] : [...prev, ...result.items]));
      setTotalCount(result.meta.totalCount);
      setPage(nextPage);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const handleMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const toggle = () => {
    if (!isLoggedIn()) {
      goToLogin();
      return;
    }
    if (!open) void load(1);
    setOpen((v) => !v);
  };

  const select = async (n: Notification) => {
    if (!n.isRead) {
      setItems((prev) => prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)));
      await readNotification(n.id).catch(() => {});
      refreshUnreadCount();
    }
    const href = notificationHref(n);
    if (href) {
      setOpen(false);
      navigate(href);
    }
  };

  const readAll = async () => {
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    await readAllNotifications().catch(() => {});
    refreshUnreadCount();
  };

  const badge = unreadCount > MAX_BADGE ? `${MAX_BADGE}+` : String(unreadCount);

  return (
    <div ref={containerRef} className="relative">
      <button
        aria-label={unreadCount > 0 ? `${L.button} (${L.unread(unreadCount)})` : L.button}
        aria-haspopup="dialog"
        aria-expanded={open}
        type="button"
        onClick={toggle}
        className="relative p-1.5 rounded text-ink-subtle hover:text-ink hover:bg-surface-1 transition-colors flex items-center justify-center"
      >
        <Icon name="notifications" className="text-[20px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-semantic-danger text-white font-code-inline text-[10px] font-bold leading-4 text-center ring-2 ring-canvas">
            {badge}
          </span>
        )}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={L.title}
          className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-32px)] rounded-xl border border-hairline bg-surface-1 shadow-2xl overflow-hidden z-50"
        >
          <div className="flex items-center justify-between px-space-sm py-2.5 border-b border-hairline">
            <span className="font-label-md text-label-md text-ink font-semibold">
              {L.title}
              {unreadCount > 0 && <span className="ml-1.5 text-primary">{unreadCount}</span>}
            </span>
            <button
              type="button"
              onClick={readAll}
              disabled={unreadCount === 0}
              className="font-label-sm text-label-sm text-ink-subtle hover:text-ink disabled:opacity-40 disabled:pointer-events-none"
            >
              {L.readAll}
            </button>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {errorMessage && (
              <p className="px-space-sm py-3 font-body-sm text-body-sm text-semantic-danger">
                {L.loadError} {errorMessage}
              </p>
            )}
            {!loading && !errorMessage && items.length === 0 ? (
              <p className="px-space-sm py-6 text-center font-body-sm text-body-sm text-ink-tertiary">
                {L.empty}
              </p>
            ) : (
              <ul className="divide-y divide-hairline">
                {items.map((n) => (
                  <NotificationItem key={n.id} notification={n} onSelect={select} />
                ))}
              </ul>
            )}
            {loading && (
              <p className="px-space-sm py-3 text-center font-caption text-caption text-ink-tertiary">
                {L.loading}
              </p>
            )}
            {!loading && items.length < totalCount && (
              <button
                type="button"
                onClick={() => void load(page + 1)}
                className="w-full py-2.5 border-t border-hairline font-label-sm text-label-sm text-ink-subtle hover:text-ink hover:bg-surface-2"
              >
                {L.more}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

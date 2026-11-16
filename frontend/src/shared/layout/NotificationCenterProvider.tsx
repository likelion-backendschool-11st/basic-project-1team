import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { isLoggedIn } from '../auth';
import { NotificationCenterContext } from '../notificationCenter';
import {
  getNotifications,
  getUnreadNotificationCount,
  type Notification,
  readNotification,
} from '../notifications';

/** 읽지 않은 수를 다시 확인하는 주기 (API_SPEC 12.1) */
const POLL_INTERVAL_MS = 60 * 1000;
/** 축하 모달을 띄울 달성 알림을 찾을 때 보는 최근 알림 수 */
const RECENT_SIZE = 20;

interface NotificationCenterProviderProps {
  readonly children: ReactNode;
}

/**
 * 읽지 않은 알림 수를 화면을 옮길 때와 60초마다 확인한다. 실시간 전송은 하지 않는다 (API_SPEC 12.1).
 * 읽지 않은 수가 늘면 최근 알림에서 Grandmaster·Challenger 달성을 찾아 축하 모달로 넘긴다.
 */
export const NotificationCenterProvider: React.FC<NotificationCenterProviderProps> = ({
  children,
}) => {
  const { pathname } = useLocation();
  const loggedIn = isLoggedIn();
  const [unreadCount, setUnreadCount] = useState(0);
  const [rankAchievement, setRankAchievement] = useState<Notification | null>(null);
  const lastCount = useRef<number | null>(null);
  const shownRankIds = useRef(new Set<number>());

  const findRankAchievement = useCallback(async () => {
    const { items } = await getNotifications(1, RECENT_SIZE);
    const found = items.find(
      (n) => n.type === 'rank_achieved' && !n.isRead && !shownRankIds.current.has(n.id),
    );
    if (found) setRankAchievement(found);
  }, []);

  const refreshUnreadCount = useCallback(() => {
    if (!isLoggedIn()) return;
    getUnreadNotificationCount()
      .then((count) => {
        // 처음 불러왔거나 늘었으면 새 달성 알림이 있는지 본다
        if (count > 0 && (lastCount.current === null || count > lastCount.current)) {
          findRankAchievement().catch(() => {});
        }
        lastCount.current = count;
        setUnreadCount(count);
      })
      // 알림 수를 못 불러와도 화면은 그대로 쓴다. 다음 확인 때 다시 부른다
      .catch(() => {});
  }, [findRankAchievement]);

  useEffect(() => {
    if (loggedIn) refreshUnreadCount();
  }, [loggedIn, pathname, refreshUnreadCount]);

  useEffect(() => {
    if (!loggedIn) return undefined;
    const timer = window.setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [loggedIn, refreshUnreadCount]);

  const dismissRankAchievement = useCallback(() => {
    if (!rankAchievement) return;
    shownRankIds.current.add(rankAchievement.id);
    setRankAchievement(null);
    readNotification(rankAchievement.id)
      .catch(() => {})
      .finally(refreshUnreadCount);
  }, [rankAchievement, refreshUnreadCount]);

  const value = useMemo(
    () => ({ unreadCount, refreshUnreadCount, rankAchievement, dismissRankAchievement }),
    [unreadCount, refreshUnreadCount, rankAchievement, dismissRankAchievement],
  );

  return (
    <NotificationCenterContext.Provider value={value}>
      {children}
    </NotificationCenterContext.Provider>
  );
};

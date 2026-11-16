import { createContext, useContext } from 'react';
import type { Notification } from './notifications';

/** 헤더 알림 버튼·축하 모달이 함께 쓰는 알림 상태. layout/NotificationCenterProvider 가 채운다 */
export interface NotificationCenterValue {
  /** 읽지 않은 알림 수. 비로그인이면 0 */
  readonly unreadCount: number;
  /** 읽지 않은 수를 다시 불러온다 (읽음 처리 뒤) */
  readonly refreshUnreadCount: () => void;
  /** 아직 읽지 않은 Grandmaster·Challenger 달성 알림. 축하 모달로 보여 준다 (REQ-NOTI-011) */
  readonly rankAchievement: Notification | null;
  /** 축하 모달을 닫으며 달성 알림을 읽음 처리한다 */
  readonly dismissRankAchievement: () => void;
}

const EMPTY: NotificationCenterValue = {
  unreadCount: 0,
  refreshUnreadCount: () => {},
  rankAchievement: null,
  dismissRankAchievement: () => {},
};

export const NotificationCenterContext = createContext<NotificationCenterValue>(EMPTY);

export const useNotificationCenter = (): NotificationCenterValue =>
  useContext(NotificationCenterContext);

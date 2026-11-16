import React, { useEffect, useState } from 'react';
import { useMe } from '../me';
import { useNotificationCenter } from '../notificationCenter';
import { TIER_LABELS, TIER_STYLES, type Tier } from '../points';
import { site } from '../site';
import { Icon } from './Icon';
import { useSiteNavigate } from './siteRouting';
import { TierBadge } from './TierBadge';

const copy = {
  rankTitle: (tierLabel: string) => `${tierLabel} 달성!`,
  rankBody: (tierLabel: string, detail: string | null) =>
    `${detail ? `${detail}로 ` : ''}${tierLabel} 등급에 올랐습니다. 축하합니다!`,
  rankMyPage: '마이페이지에서 보기',
  visitTitle: '오늘의 출석 보상',
  visitBody: (points: number) => `오늘 첫 접속으로 ${points} P를 받았습니다.`,
  visitTotal: (points: string) => `지금 포인트 ${points} P`,
  confirm: '확인',
};

interface ModalFrameProps {
  readonly labelledBy: string;
  readonly onClose: () => void;
  readonly children: React.ReactNode;
}

/** 축하·보상 모달 틀. 바깥을 누르거나 Escape 로 닫는다 */
const ModalFrame: React.FC<ModalFrameProps> = ({ labelledBy, onClose, children }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-margin">
      <div className="absolute inset-0 bg-canvas/75 backdrop-blur-[6px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="relative w-full max-w-[380px] bg-surface-1 border border-hairline rounded-2xl p-space-lg shadow-2xl flex flex-col items-center text-center gap-space-md"
      >
        {children}
      </div>
    </div>
  );
};

const confirmClass =
  'flex-1 px-space-md py-2 rounded-lg bg-primary-container hover:bg-primary-hover text-on-primary font-label-md text-label-md font-semibold transition-colors';

/**
 * Grandmaster·Challenger 달성 축하 모달(REQ-NOTI-011)과 하루 첫 접속 보상 모달(REQ-NOTI-012).
 * 둘 다 있으면 달성 모달을 먼저 보여 준다. 달성 모달을 닫으면 그 알림을 읽음 처리한다.
 */
export const CelebrationModals: React.FC = () => {
  const { rankAchievement, dismissRankAchievement } = useNotificationCenter();
  const me = useMe();
  const navigate = useSiteNavigate();
  const [visitClosed, setVisitClosed] = useState(false);

  if (rankAchievement) {
    const tier = rankAchievement.title.toLowerCase() as Tier;
    const style = TIER_STYLES[tier] ?? TIER_STYLES.challenger;
    const tierLabel = TIER_LABELS[tier] ?? rankAchievement.title;
    return (
      <ModalFrame labelledBy="rank-achieved-title" onClose={dismissRankAchievement}>
        <div
          className={`w-20 h-20 rounded-full border-2 flex items-center justify-center ${style.chip} ${style.text}`}
        >
          <Icon name={style.icon} className="text-[44px]" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2
            id="rank-achieved-title"
            className={`text-headline-md font-headline-md font-bold ${style.text}`}
          >
            {copy.rankTitle(tierLabel)}
          </h2>
          <p className="text-body-sm font-body-sm text-ink-subtle">
            {copy.rankBody(tierLabel, rankAchievement.detail)}
          </p>
        </div>
        {me?.grade.level !== null && me?.grade.level !== undefined && (
          <TierBadge level={me.grade.level} tier={tier} size="md" />
        )}
        <div className="w-full flex gap-space-xs pt-space-xs">
          <button
            type="button"
            onClick={() => {
              dismissRankAchievement();
              navigate(site.myPagePath);
            }}
            className="flex-1 px-space-md py-2 rounded-lg bg-surface-2 hover:bg-surface-3 border border-hairline text-ink font-label-md text-label-md transition-colors"
          >
            {copy.rankMyPage}
          </button>
          <button type="button" autoFocus onClick={dismissRankAchievement} className={confirmClass}>
            {copy.confirm}
          </button>
        </div>
      </ModalFrame>
    );
  }

  const reward = me?.visitReward ?? null;
  if (reward === null || visitClosed) return null;

  const close = () => setVisitClosed(true);
  return (
    <ModalFrame labelledBy="visit-reward-title" onClose={close}>
      <div className="w-16 h-16 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center">
        <Icon name="redeem" className="text-[34px]" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h2
          id="visit-reward-title"
          className="text-headline-sm font-headline-sm font-semibold text-ink"
        >
          {copy.visitTitle}
        </h2>
        <p className="text-body-sm font-body-sm text-ink-subtle">{copy.visitBody(reward)}</p>
        <p className="font-code-inline text-code-inline text-secondary font-semibold">
          {copy.visitTotal(me?.grade.points.toLocaleString() ?? '0')}
        </p>
      </div>
      {me && <TierBadge level={me.grade.level} tier={me.grade.tier} size="md" />}
      <div className="w-full flex pt-space-xs">
        <button type="button" autoFocus onClick={close} className={confirmClass}>
          {copy.confirm}
        </button>
      </div>
    </ModalFrame>
  );
};

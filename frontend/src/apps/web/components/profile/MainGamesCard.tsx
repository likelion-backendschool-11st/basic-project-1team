import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { mypageContent, type MainGame } from '../../data/mockData';

const c = mypageContent.mainGames;

interface MainGamesCardProps {
  readonly games: readonly MainGame[];
  /** 본인 프로필이면 고른 게임이 없어도 안내 문구와 함께 보여 준다 */
  readonly isOwner: boolean;
}

/**
 * 주력 게임과 게임마다 그 태그 질문에 단 답변·채택 수 (API_SPEC 2장 mainGames, REQ-MYPAGE-007).
 * 공개 프로필에서 고른 게임이 없으면 그리지 않는다
 */
export const MainGamesCard: React.FC<MainGamesCardProps> = ({ games, isOwner }) => {
  if (games.length === 0 && !isOwner) return null;

  return (
    <section className="flex flex-col gap-3 rounded-xl bg-surface-2 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-label-md text-label-md text-ink-subtle">
          <Icon name={c.icon} className="text-[18px] text-primary" />
          {c.label}
        </span>
        <span className="font-label-code text-label-code text-ink-tertiary">
          {c.count(games.length)}
        </span>
      </div>
      {games.length === 0 ? (
        <p className="font-body-sm text-body-sm text-ink-tertiary">{c.empty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-hairline rounded-lg bg-surface-3/60">
          {games.map((game) => (
            <li key={game.tagId} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <Link
                to={c.tagLink(game.name)}
                className="min-w-0 truncate font-label-code text-label-code text-ink transition-colors hover:text-primary"
              >
                #{game.name}
              </Link>
              <span className="shrink-0 font-label-code text-label-code text-ink-tertiary">
                {c.answers} <span className="text-ink">{game.answerCount.toLocaleString()}</span>
                {' · '}
                {c.accepted}{' '}
                <span className="text-semantic-success">{game.acceptedCount.toLocaleString()}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

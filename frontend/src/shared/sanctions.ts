import { useEffect, useMemo } from 'react';
import { useMe, useRefreshMe } from './me';

/** 회원 제재 (API_SPEC 1.2). suspend: 이용 정지, write_ban: 글쓰기 제한, comment_ban: 댓글 제한 */
export type SanctionType = 'suspend' | 'write_ban' | 'comment_ban';

export interface MySanction {
  readonly type: SanctionType;
  /** 해제 시각 (ISO 8601). null 이면 영구 */
  readonly until: string | null;
}

/** 막는 동작. write: 질문·답변·게시글 작성·수정, comment: 댓글 작성 */
export type RestrictedAction = 'write' | 'comment';

const NO_SANCTIONS: readonly MySanction[] = [];

const pad = (n: number) => String(n).padStart(2, '0');
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const LABEL: Record<SanctionType, string> = {
  suspend: '이용이 정지된',
  write_ban: '글쓰기가 제한된',
  comment_ban: '댓글 작성이 제한된',
};

/** 서버 에러 메시지와 같은 형식의 안내 (예: "2026-12-01까지 글쓰기가 제한된 계정입니다.") */
export function sanctionMessage(sanction: MySanction): string {
  if (sanction.until === null) {
    return sanction.type === 'suspend'
      ? '영구 정지된 계정입니다.'
      : `영구히 ${LABEL[sanction.type]} 계정입니다.`;
  }
  return `${formatDate(sanction.until)}까지 ${LABEL[sanction.type]} 계정입니다.`;
}

/**
 * 이 동작을 막는 제재가 있으면 안내 문구, 없으면 null. 이용 정지가 가장 먼저다.
 * 기간이 지난 제재는 서버처럼 자동으로 풀린 것으로 본다.
 */
export function findRestriction(
  action: RestrictedAction,
  sanctions: readonly MySanction[],
  now = new Date(),
): string | null {
  const blocking: SanctionType[] =
    action === 'write' ? ['suspend', 'write_ban'] : ['suspend', 'comment_ban'];
  const found = blocking
    .map((type) =>
      sanctions.find((s) => s.type === type && (s.until === null || new Date(s.until) > now)),
    )
    .find((s): s is MySanction => s !== undefined);
  return found ? sanctionMessage(found) : null;
}

/**
 * 내 제재로 작성·댓글을 막는다. 회원 화면의 ProfileProvider 가 받은 GET /api/users/me 의 sanctions 를 쓴다 (API_SPEC 2장).
 * 비회원이거나 내 정보를 아직 받지 못했으면 막지 않는다 (서버가 403 으로 한 번 더 막는다).
 * 화면을 연 뒤 관리자가 건 제재도 작성 전에 막도록, 이 hook 을 쓰는 화면에 들어올 때 내 정보를 다시 받는다.
 * - restrictionFor: 화면에 보여 줄 안내. 없으면 null
 * - blockIfRestricted: 작성 버튼·링크용. 막힌 동작이면 안내를 띄우고 이동을 막는다. 막았으면 true.
 *   비회원 처리(로그인 안내)는 LoginGate 가 먼저 한다.
 */
export function useSanctionGuard() {
  const sanctions = useMe()?.sanctions ?? NO_SANCTIONS;
  const refreshMe = useRefreshMe();
  useEffect(() => {
    refreshMe();
  }, [refreshMe]);
  return useMemo(() => {
    const restrictionFor = (action: RestrictedAction) => findRestriction(action, sanctions);
    const blockIfRestricted = (
      action: RestrictedAction,
      event?: { preventDefault: () => void },
    ): boolean => {
      const message = restrictionFor(action);
      if (!message) return false;
      event?.preventDefault();
      window.alert(message);
      return true;
    };
    return { restrictionFor, blockIfRestricted };
  }, [sanctions]);
}

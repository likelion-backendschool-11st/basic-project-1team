import { isLoggedIn } from './auth';

/** 회원 제재 (API_SPEC 1.2). suspend: 이용 정지, write_ban: 글쓰기 제한, comment_ban: 댓글 제한 */
export type SanctionType = 'suspend' | 'write_ban' | 'comment_ban';

export interface MySanction {
  readonly type: SanctionType;
  /** 해제 시각 (ISO 8601). null 이면 영구 */
  readonly until: string | null;
}

/** 막는 동작. write: 질문·답변·게시글 작성·수정, comment: 댓글 작성 */
export type RestrictedAction = 'write' | 'comment';

/** 개발 중 제재 화면을 확인하려면 이 키에 MySanction[] JSON 을 넣는다 */
const MOCK_KEY = 'gamers:mock-sanctions';

/**
 * 지금 걸려 있는 내 제재. TODO: GET /api/users/me 의 sanctions 로 바꾼다.
 * 기간이 지난 제재는 서버처럼 자동으로 풀린 것으로 본다.
 */
export function getMySanctions(now = new Date()): MySanction[] {
  if (!isLoggedIn()) return [];
  try {
    const raw = window.localStorage.getItem(MOCK_KEY);
    const list = raw ? (JSON.parse(raw) as MySanction[]) : [];
    return list.filter((s) => s.until === null || new Date(s.until) > now);
  } catch {
    return [];
  }
}

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

/** 이 동작을 막는 제재가 있으면 안내 문구, 없으면 null. 이용 정지가 가장 먼저다 */
export function restrictionFor(
  action: RestrictedAction,
  sanctions = getMySanctions(),
): string | null {
  const blocking: SanctionType[] =
    action === 'write' ? ['suspend', 'write_ban'] : ['suspend', 'comment_ban'];
  const found = blocking
    .map((type) => sanctions.find((s) => s.type === type))
    .find((s): s is MySanction => s !== undefined);
  return found ? sanctionMessage(found) : null;
}

/**
 * 작성 버튼·링크용. 막힌 동작이면 안내를 띄우고 이동을 막는다. 막았으면 true.
 * 비회원 처리(로그인 안내)는 LoginGate 가 먼저 한다.
 */
export function blockIfRestricted(
  action: RestrictedAction,
  event?: { preventDefault: () => void },
): boolean {
  const message = restrictionFor(action);
  if (!message) return false;
  event?.preventDefault();
  window.alert(message);
  return true;
}

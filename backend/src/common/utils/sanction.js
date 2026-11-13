import { ForbiddenError } from '../error/http-errors.js';

/*
 * 회원 제재 확인 (API_SPEC 1.2).
 * user.sanctions 에는 인증 미들웨어가 넣은 "지금 걸려 있는" 제재만 들어 있다.
 */

export const SANCTION_TYPE = Object.freeze({
  SUSPEND: 'suspend',
  WRITE_BAN: 'write_ban',
  COMMENT_BAN: 'comment_ban',
});

const SANCTION_ERRORS = {
  [SANCTION_TYPE.SUSPEND]: {
    code: 'USER_SUSPENDED',
    label: '이용이 정지된',
    permanent: '영구 정지된',
  },
  [SANCTION_TYPE.WRITE_BAN]: {
    code: 'WRITE_BANNED',
    label: '글쓰기가 제한된',
    permanent: '글쓰기가 영구 제한된',
  },
  [SANCTION_TYPE.COMMENT_BAN]: {
    code: 'COMMENT_BANNED',
    label: '댓글 작성이 제한된',
    permanent: '댓글 작성이 영구 제한된',
  },
};

// 해제일은 화면 기준(한국 시간) 날짜로 보여 준다. 'sv-SE' 형식이 YYYY-MM-DD
const formatDate = (date) => date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });

const toSanctionError = ({ type, endsAt }) => {
  const { code, label, permanent } = SANCTION_ERRORS[type];
  const message =
    endsAt === null ? `${permanent} 계정입니다.` : `${formatDate(endsAt)}까지 ${label} 계정입니다.`;

  return new ForbiddenError(code, message);
};

/**
 * types 중 걸려 있는 제재가 있으면 ForbiddenError 를 던진다.
 * 이용 정지는 모든 쓰기 API 를 막으므로 types 에 없어도 항상 확인한다.
 */
export const assertNotSanctioned = (user, types = []) => {
  const checkTypes = [SANCTION_TYPE.SUSPEND, ...types];

  for (const type of checkTypes) {
    const sanction = user.sanctions.find((item) => item.type === type);

    if (sanction !== undefined) {
      throw toSanctionError(sanction);
    }
  }
};

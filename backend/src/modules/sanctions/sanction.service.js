import { ForbiddenError } from '../../common/error/http-errors.js';

import * as sanctionRepository from './sanction.repository.js';

export const SANCTION_TYPE = {
  SUSPEND: 'suspend',
  WRITE_BAN: 'write_ban',
  COMMENT_BAN: 'comment_ban',
};

const SANCTION_ERRORS = {
  [SANCTION_TYPE.SUSPEND]: {
    code: 'USER_SUSPENDED',
    temporary: '이용이 정지된',
    permanent: '영구 정지된 계정입니다.',
  },
  [SANCTION_TYPE.WRITE_BAN]: {
    code: 'WRITE_BANNED',
    temporary: '글쓰기가 제한된',
    permanent: '글쓰기가 영구 제한된 계정입니다.',
  },
  [SANCTION_TYPE.COMMENT_BAN]: {
    code: 'COMMENT_BANNED',
    temporary: '댓글 작성이 제한된',
    permanent: '댓글 작성이 영구 제한된 계정입니다.',
  },
};

// 해제일은 서비스 이용자 기준(한국 시간) 날짜로 보여 준다
const formatReleaseDate = (date) =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(date);

// 같은 종류가 여러 건이면 가장 늦게 풀리는 제재를 안내한다 (영구가 가장 늦음)
const findLongestSanction = (sanctions) =>
  sanctions.reduce((longest, sanction) => {
    if (longest.ends_at === null || sanction.ends_at === null) {
      return longest.ends_at === null ? longest : sanction;
    }

    return sanction.ends_at > longest.ends_at ? sanction : longest;
  });

// types 중 걸려 있는 제재가 있으면 403을 던진다. 앞에 있는 종류를 먼저 안내한다 (API 명세 1.2)
export const ensureNotSanctioned = async (userId, types) => {
  const sanctions = await sanctionRepository.findActiveSanctionsByUserId(userId, types);

  for (const type of types) {
    const sanctionsOfType = sanctions.filter((sanction) => sanction.type === type);

    if (sanctionsOfType.length === 0) {
      continue;
    }

    const sanction = findLongestSanction(sanctionsOfType);
    const error = SANCTION_ERRORS[type];
    const message =
      sanction.ends_at === null
        ? error.permanent
        : `${formatReleaseDate(sanction.ends_at)}까지 ${error.temporary} 계정입니다.`;

    throw new ForbiddenError(error.code, message);
  }
};

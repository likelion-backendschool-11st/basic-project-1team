import crypto, { randomUUID } from 'node:crypto';

import argon2 from 'argon2';
import sanitizeHtml from 'sanitize-html';

import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../../common/error/http-errors.js';
import { deleteFileByUrl, saveFile } from '../../common/utils/file-storage.js';
import { countCharacters, toPlainText } from '../../common/utils/html.js';
import { logger } from '../../common/utils/logger.js';
import { withTransaction } from '../../config/database.js';
import * as attachmentService from '../attachments/attachment.service.js';

import * as userRepository from './user.repository.js';

// 이용 정지가 가장 먼저 걸리도록 우선순위 순서로 둔다
const SANCTION_ERRORS = {
  suspend: { code: 'USER_SUSPENDED', label: '이용이 정지된' },
  write_ban: { code: 'WRITE_BANNED', label: '글쓰기가 제한된' },
  comment_ban: { code: 'COMMENT_BANNED', label: '댓글 작성이 제한된' },
};

// 회원은 한국 사용자이므로 해제일은 한국 날짜로 안내한다
const seoulDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const toSanction = (row) => ({ type: row.type, endsAt: row.ends_at });

const buildSanctionMessage = ({ type, endsAt }) => {
  const { label } = SANCTION_ERRORS[type];

  if (endsAt === null) {
    return type === 'suspend' ? '영구 정지된 계정입니다.' : `영구히 ${label} 계정입니다.`;
  }

  return `${seoulDateFormatter.format(endsAt)}까지 ${label} 계정입니다.`;
};

// 같은 종류가 여러 개면 가장 늦게 풀리는 제재로 안내한다 (영구가 가장 늦다)
const findLongestSanction = (sanctions) =>
  sanctions.reduce((longest, sanction) => {
    if (longest.endsAt === null || sanction.endsAt === null) {
      return longest.endsAt === null ? longest : sanction;
    }

    return sanction.endsAt > longest.endsAt ? sanction : longest;
  });

/** 로그인용 회원 조회. 탈퇴한 회원은 찾지 않는다. */
export const findUserForLogin = async (loginId) => {
  const row = await userRepository.findActiveUserByLoginId(loginId);

  if (row === null) {
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    role: row.role,
    passwordHash: row.password_hash,
  };
};

export const findActiveSanctionsByUserId = async (userId) => {
  const rows = await userRepository.findActiveSanctionsByUserId(userId);

  return rows.map(toSanction);
};

/**
 * 인증 미들웨어가 매 요청마다 읽는 회원 정보. 권한·제재를 토큰이 아니라 DB 기준으로 판단하기 위해
 * 요청마다 다시 조회한다 (API 명세 1.2). 탈퇴했거나 없는 회원이면 null.
 */
export const findAuthUserById = async (userId) => {
  const [user, permissionRows, sanctions] = await Promise.all([
    userRepository.findActiveUserById(userId),
    userRepository.findActivePermissionsByUserId(userId),
    findActiveSanctionsByUserId(userId),
  ]);

  if (user === null) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    role: user.role,
    permissions: permissionRows.map((row) => row.permission),
    sanctions,
  };
};

/**
 * 막을 제재 종류(types) 중 걸려 있는 제재가 있으면 403을 던진다. 이용 정지를 가장 먼저 확인한다.
 * 예: 글 작성은 ['suspend', 'write_ban'], 댓글 작성은 ['suspend', 'comment_ban']
 */
export const assertNotSanctioned = (sanctions, types) => {
  const blockingTypes = Object.keys(SANCTION_ERRORS).filter((type) => types.includes(type));

  for (const type of blockingTypes) {
    const matched = sanctions.filter((sanction) => sanction.type === type);

    if (matched.length > 0) {
      throw new ForbiddenError(
        SANCTION_ERRORS[type].code,
        buildSanctionMessage(findLongestSanction(matched)),
      );
    }
  }
};

// 재설정 토큰은 10분간, 1회만 유효하다 (API 명세 2장 비밀번호 찾기)
const PASSWORD_RESET_EXPIRES_IN = 10 * 60;
const PASSWORD_RESET_TOKEN_BYTES = 32;

const throwResetTokenInvalid = () => {
  throw new BadRequestError(
    'RESET_TOKEN_INVALID',
    '비밀번호 재설정 요청이 만료되었거나 이미 사용되었습니다. 본인 확인을 다시 해주세요.',
  );
};

const throwUserNotFound = () => {
  throw new NotFoundError('USER_NOT_FOUND', '입력한 정보와 일치하는 회원이 없습니다.');
};

// 앞 3자(5자 이하면 앞 2자)만 보여 주고 나머지는 같은 개수의 *로 가린다 (API 명세 2장, REQ-FINDID-003)
const maskUsername = (username) => {
  const visibleLength = username.length <= 5 ? 2 : 3;

  return username.slice(0, visibleLength) + '*'.repeat(username.length - visibleLength);
};

// DB에는 토큰 원문 대신 SHA-256 해시만 저장한다 (DB 설계 4.4)
const hashResetToken = (resetToken) => crypto.createHash('sha256').update(resetToken).digest('hex');

/** 비밀번호를 Argon2id로 해시한다 (API 명세 1.8). 회원가입·비밀번호 변경에서도 이 함수를 쓴다. */
export const hashPassword = (password) => argon2.hash(password, { type: argon2.argon2id });

// 이름과 이메일만 알면 남의 아이디를 알 수 있으므로 가린 아이디만 돌려준다
export const getMaskedUsername = async ({ name, email }) => {
  const user = await userRepository.findActiveUserByNameAndEmail(name, email);

  if (user === null) {
    throwUserNotFound();
  }

  return { maskedUsername: maskUsername(user.username) };
};

/** 비밀번호 찾기 1단계: 아이디·이메일로 본인 확인 후 재설정 토큰을 발급한다. */
export const createPasswordResetToken = async ({ username, email }) => {
  const user = await userRepository.findActiveUserByUsernameAndEmail(username, email);

  if (user === null) {
    throwUserNotFound();
  }

  const resetToken = crypto.randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString('hex');

  await userRepository.createPasswordResetToken({
    userId: user.id,
    tokenHash: hashResetToken(resetToken),
    expiresInSeconds: PASSWORD_RESET_EXPIRES_IN,
  });

  return { resetToken, expiresIn: PASSWORD_RESET_EXPIRES_IN };
};

/** 비밀번호 찾기 2단계: 재설정 토큰이 유효하면 새 비밀번호로 바꾼다. */
export const resetPassword = async ({ resetToken, newPassword }) => {
  // 해시 계산은 오래 걸리므로 트랜잭션 밖에서 먼저 한다 (연결과 잠금을 오래 잡지 않도록)
  const passwordHash = await hashPassword(newPassword);

  await withTransaction(async () => {
    const token = await userRepository.findUsableResetTokenByHashForUpdate(
      hashResetToken(resetToken),
    );

    if (token === null) {
      throwResetTokenInvalid();
    }

    // 토큰을 받은 뒤 탈퇴한 회원은 바꾸지 않는다
    const isUpdated = await userRepository.updateActiveUserPassword(token.user_id, passwordHash);

    if (!isUpdated) {
      throwResetTokenInvalid();
    }

    // 이 토큰과 함께, 같은 회원이 전에 받아 둔 다른 토큰도 더는 못 쓰게 한다
    await userRepository.updateResetTokensUsedByUserId(token.user_id);
  });
};

const findActiveUserByField = {
  username: userRepository.findActiveUserByUsername,
  nickname: userRepository.findActiveUserByNickname,
  email: userRepository.findActiveUserByEmail,
};

/** 아이디·닉네임·이메일 중복 확인. 이미 쓰는 값이어도 에러가 아니라 isAvailable: false (API 명세 2장) */
export const getAvailability = async ({ field, value }) => {
  const user = await findActiveUserByField[field](value);

  return { field, value, isAvailable: user === null };
};

// 여러 값이 겹치면 아이디 → 닉네임 → 이메일 순서로 하나만 알린다 (API 명세 에러 코드 표 순서)
const DUPLICATE_ERRORS = [
  {
    field: 'username',
    uniqueKey: 'uk_users_username',
    code: 'USERNAME_DUPLICATED',
    message: '이미 사용 중인 아이디입니다.',
  },
  {
    field: 'nickname',
    uniqueKey: 'uk_users_nickname',
    code: 'NICKNAME_DUPLICATED',
    message: '이미 사용 중인 닉네임입니다.',
  },
  {
    field: 'email',
    uniqueKey: 'uk_users_email',
    code: 'EMAIL_DUPLICATED',
    message: '이미 사용 중인 이메일입니다.',
  },
];

const throwDuplicateError = ({ code, message }) => {
  throw new ConflictError(code, message);
};

/** 회원가입. 중복 확인을 했더라도 가입 시점에 다시 검사한다 (API 명세 2장) */
export const createUser = async ({ name, username, nickname, password, email }) => {
  const values = { username, nickname, email };

  for (const duplicateError of DUPLICATE_ERRORS) {
    const { field } = duplicateError;

    if ((await findActiveUserByField[field](values[field])) !== null) {
      throwDuplicateError(duplicateError);
    }
  }

  const passwordHash = await hashPassword(password);

  try {
    const id = await userRepository.createUser({ name, username, nickname, email, passwordHash });

    return { id, username, nickname };
  } catch (error) {
    // 위 검사와 INSERT 사이에 같은 값으로 먼저 가입한 요청이 있으면 unique 제약에 걸린다
    const duplicateError =
      error.code === 'ER_DUP_ENTRY' &&
      DUPLICATE_ERRORS.find(({ uniqueKey }) => error.sqlMessage?.includes(uniqueKey));

    if (duplicateError) {
      throwDuplicateError(duplicateError);
    }

    throw error;
  }
};

/**
 * 로그인 상태에서 비밀번호 변경 (API 명세 2장 PATCH /api/users/me/password).
 * 바꾼 뒤에도 기존 토큰은 만료 전까지 유효하다. 프론트엔드가 토큰을 지우고 로그인 화면으로 보낸다 (명세 1.2)
 */
export const changePassword = async ({ userId, currentPassword, newPassword }) => {
  const user = await userRepository.findActiveUserPasswordHashById(userId);

  // 인증 미들웨어를 통과한 뒤 그사이 탈퇴한 경우
  if (user === null) {
    throw new UnauthorizedError('UNAUTHORIZED', '로그인 정보가 만료되었거나 올바르지 않습니다.');
  }

  if (!(await argon2.verify(user.password_hash, currentPassword))) {
    throw new BadRequestError('PASSWORD_MISMATCH', '현재 비밀번호가 일치하지 않습니다.');
  }

  const passwordHash = await hashPassword(newPassword);

  await userRepository.updateActiveUserPassword(userId, passwordHash);
};

const throwUnauthorized = () => {
  throw new UnauthorizedError('UNAUTHORIZED', '로그인 정보가 만료되었거나 올바르지 않습니다.');
};

// 저장소 파일 삭제가 실패해도 DB는 이미 바뀌었으므로 요청은 성공으로 두고 기록만 남긴다
const deleteFileQuietly = async (url) => {
  try {
    await deleteFileByUrl(url);
  } catch (error) {
    logger.warn(`프로필 사진 파일을 지우지 못했습니다: ${url}`, error);
  }
};

/**
 * 회원 탈퇴 (API 명세 2장 DELETE /api/users/me).
 * 작성글·추천·신고·제재 이력은 회원 id로 연결된 채 남는다. 인증 미들웨어가 매 요청 회원 상태를 확인하므로
 * 탈퇴 뒤에는 기존 토큰도 바로 401이 된다 (명세 1.2). 프로필 사진 파일은 저장소에서 지운다 (명세 1.7)
 */
export const withdrawUser = async (userId) => {
  const profileImageUrl = await withTransaction(async () => {
    const user = await userRepository.findActiveUserProfileImageUrlByIdForUpdate(userId);

    // 같은 회원의 탈퇴 요청이 동시에 와서 먼저 처리된 경우
    if (user === null) {
      throwUnauthorized();
    }

    await userRepository.updateUserWithdrawn(userId);

    return user.profile_image_url;
  });

  if (profileImageUrl !== null) {
    await deleteFileQuietly(profileImageUrl);
  }
};

// ---------------------------------------------------------------------
// 프로필 (마이페이지·공개 프로필)
// ---------------------------------------------------------------------

const INTEREST_TAG_LIMIT = 5;

// 화면에 보여 줄 지금 걸린 제재. 같은 종류가 여러 개면 가장 늦게 풀리는 제재 하나로 보낸다 (until이 null이면 영구)
const toCurrentSanctions = (rows) => {
  const sanctionsByType = Map.groupBy(rows.map(toSanction), (sanction) => sanction.type);

  return Object.keys(SANCTION_ERRORS)
    .filter((type) => sanctionsByType.has(type))
    .map((type) => {
      const { endsAt } = findLongestSanction(sanctionsByType.get(type));

      return { type, until: endsAt };
    });
};

// 다른 회원·비회원에게도 보이는 공개 항목 (API 명세 2장 GET /api/users/:userId)
const buildPublicProfile = async (user) => {
  const [counts, interestTags] = await Promise.all([
    userRepository.findActivityCountsByUserId(user.id),
    userRepository.findInterestTagNamesByUserId(user.id, INTEREST_TAG_LIMIT),
  ]);

  return {
    id: user.id,
    nickname: user.nickname,
    profileImageUrl: user.profile_image_url,
    bio: user.bio,
    questionCount: Number(counts.question_count),
    answerCount: Number(counts.answer_count),
    postCount: Number(counts.post_count),
    interestTags,
    createdAt: user.created_at,
  };
};

/** 내 프로필 (API 명세 2장 GET /api/users/me). 공개 항목에 아이디·실명·이메일·권한·제재를 더한다 */
export const getMyProfile = async (userId) => {
  const user = await userRepository.findActiveUserProfileById(userId);

  // 인증 미들웨어를 통과한 뒤 그사이 탈퇴한 경우
  if (user === null) {
    throwUnauthorized();
  }

  const [profile, permissions, sanctions] = await Promise.all([
    buildPublicProfile(user),
    userRepository.findActivePermissionsByUserId(userId),
    userRepository.findActiveSanctionsByUserId(userId),
  ]);

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    nickname: user.nickname,
    email: user.email,
    role: user.role,
    permissions: permissions.map((row) => row.permission),
    sanctions: toCurrentSanctions(sanctions),
    profileImageUrl: profile.profileImageUrl,
    bio: profile.bio,
    questionCount: profile.questionCount,
    answerCount: profile.answerCount,
    postCount: profile.postCount,
    interestTags: profile.interestTags,
    createdAt: profile.createdAt,
  };
};

/** 회원 공개 프로필 (API 명세 2장 GET /api/users/:userId). 본인이 조회해도 공개 항목만 보낸다 */
export const getPublicProfile = async (userId) => {
  const user = await userRepository.findActiveUserProfileById(userId);

  if (user === null) {
    throw new NotFoundError('USER_NOT_FOUND', '존재하지 않거나 탈퇴한 회원입니다.');
  }

  return buildPublicProfile(user);
};

// 소개글은 간단 에디터(굵게·기울임·밑줄·링크)로 쓴다. 이미지·영상·표는 받지 않는다 (API 명세 1.9)
const BIO_MAX_TEXT_LENGTH = 200;
const BIO_MAX_HTML_LENGTH = 1_000;

const sanitizeBio = (html) =>
  sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a'],
    allowedAttributes: { a: ['href', 'target', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    // 다른 사이트로 가는 링크가 이 페이지를 조작하지 못하게 한다
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        target: '_blank',
        rel: 'noopener noreferrer nofollow',
      }),
    },
  });

const throwBioValidationError = (message) => {
  throw new BadRequestError('VALIDATION_ERROR', message);
};

/** 소개글 수정 (API 명세 2장 PATCH /api/users/me). 응답은 GET /api/users/me와 같다 */
export const updateMyBio = async ({ userId, bio }) => {
  const sanitizedBio = sanitizeBio(bio);
  const text = toPlainText(sanitizedBio);

  if (countCharacters(text) > BIO_MAX_TEXT_LENGTH) {
    throwBioValidationError(`소개글은 ${BIO_MAX_TEXT_LENGTH}자 이하여야 합니다.`);
  }

  if (countCharacters(sanitizedBio) > BIO_MAX_HTML_LENGTH) {
    throwBioValidationError(
      `소개글 HTML은 ${BIO_MAX_HTML_LENGTH.toLocaleString()}자 이하여야 합니다.`,
    );
  }

  // 글자 없이 빈 태그만 남으면(<p><br></p>) 소개글을 지운 것으로 본다
  const isUpdated = await userRepository.updateActiveUserBio(
    userId,
    text.trim() === '' ? null : sanitizedBio,
  );

  if (!isUpdated) {
    throwUnauthorized();
  }

  return getMyProfile(userId);
};

// 프로필 사진은 PNG/JPG만 받는다. 형식은 파일 이름이 아니라 내용으로 판단한다 (API 명세 2장)
const PROFILE_IMAGE_TYPES = ['png', 'jpg'];

// 저장 경로: profile_image/<연>/<월>/<uuid>.<확장자> (첨부파일과 같은 저장소)
const createProfileImageKey = (extension) => {
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');

  return `profile_image/${now.getUTCFullYear()}/${month}/${randomUUID()}.${extension}`;
};

/** 프로필 사진 업로드 (API 명세 2장 POST /api/users/me/profile-image). 이전 사진 파일은 지운다 */
export const updateMyProfileImage = async ({ userId, file }) => {
  const type = attachmentService.detectImageType(file.buffer);

  if (!PROFILE_IMAGE_TYPES.includes(type)) {
    throw new BadRequestError('FILE_TYPE_NOT_ALLOWED', 'PNG, JPG 파일만 올릴 수 있습니다.');
  }

  // 파일 저장은 느리므로 트랜잭션 밖에서 먼저 한다
  const profileImageUrl = await saveFile(createProfileImageKey(type), file.buffer);
  let previousUrl;

  try {
    previousUrl = await withTransaction(async () => {
      const user = await userRepository.findActiveUserProfileImageUrlByIdForUpdate(userId);

      if (user === null) {
        throwUnauthorized();
      }

      await userRepository.updateActiveUserProfileImageUrl(userId, profileImageUrl);

      return user.profile_image_url;
    });
  } catch (error) {
    // DB에 남기지 못한 파일은 저장소에 남지 않게 지운다
    await deleteFileQuietly(profileImageUrl);
    throw error;
  }

  if (previousUrl !== null) {
    await deleteFileQuietly(previousUrl);
  }

  return { profileImageUrl };
};

import { isValidTagName, normalizeTagName } from '../../common/utils/tag-name.js';
import {
  readBodyObject,
  readPageQuery,
  readQueryEnum,
  readQueryPositiveInteger,
  readQueryString,
  throwValidationError,
  validateIdParam,
} from '../../common/utils/validation.js';

const SORTS = ['usage_desc', 'name_asc', 'recent'];
const STATUSES = ['active', 'blocked', 'merged'];
const DESCRIPTION_MAX_LENGTH = 100;

export const validateTagId = validateIdParam('tagId');

// Express 5의 req.query는 읽기 전용이라 검증·변환한 값을 req.validatedQuery에 담는다
export const validateGetTags = (req, _res, next) => {
  const keyword = readQueryString(req.query, 'keyword');
  // 이름은 정규화해서 저장하므로 검색어도 같은 규칙(# 제거, 영문 소문자)으로 맞춘다 (API 명세 5.1)
  const normalizedKeyword = keyword === undefined ? '' : normalizeTagName(keyword);

  req.validatedQuery = {
    ...readPageQuery(req.query),
    keyword: normalizedKeyword === '' ? undefined : normalizedKeyword,
    sort: readQueryEnum(req.query, 'sort', SORTS, 'usage_desc'),
    status: readQueryEnum(req.query, 'status', STATUSES, undefined),
  };

  next();
};

// 태그 이름 규칙: 1~30자, 한글·영문·숫자·_·-, 정규화해서 저장 (API 명세 5.1)
const readName = (name) => {
  if (typeof name !== 'string') {
    throwValidationError('name은 문자열이어야 합니다.');
  }

  const normalizedName = normalizeTagName(name);

  if (!isValidTagName(normalizedName)) {
    throwValidationError(
      '태그 이름은 1~30자의 한글·영문·숫자·_·-만 사용할 수 있습니다. (공백 불가)',
    );
  }

  return normalizedName;
};

// 설명은 선택, 최대 100자. 비우면 null로 둔다
const readDescription = (description) => {
  if (description === undefined || description === null) {
    return null;
  }

  if (typeof description !== 'string') {
    throwValidationError('description은 문자열이어야 합니다.');
  }

  const trimmedDescription = description.trim();

  if (Array.from(trimmedDescription).length > DESCRIPTION_MAX_LENGTH) {
    throwValidationError(`description은 ${DESCRIPTION_MAX_LENGTH}자 이하여야 합니다.`);
  }

  return trimmedDescription === '' ? null : trimmedDescription;
};

export const validateCreateTag = (req, _res, next) => {
  const body = readBodyObject(req.body);

  req.body = { name: readName(body.name), description: readDescription(body.description) };

  next();
};

// 같은 경로에 ?mergeInto=<대상 태그 id> 가 있으면 삭제(차단)가 아니라 병합이다 (API 명세 10.5)
export const validateDeleteTag = (req, _res, next) => {
  req.validatedQuery = { mergeInto: readQueryPositiveInteger(req.query, 'mergeInto') };

  next();
};

// 보낸 필드만 수정한다. status는 차단 해제("active")만 받는다 (API 명세 10.5 PATCH)
export const validateUpdateTag = (req, _res, next) => {
  const body = readBodyObject(req.body);

  if (body.name === undefined && body.description === undefined && body.status === undefined) {
    throwValidationError('수정할 항목(name, description, status)을 하나 이상 보내야 합니다.');
  }

  if (body.status !== undefined && body.status !== 'active') {
    throwValidationError(
      'status는 차단 해제(active)만 보낼 수 있습니다. 차단은 DELETE 요청으로 합니다.',
    );
  }

  req.body = {
    name: body.name === undefined ? undefined : readName(body.name),
    description: body.description === undefined ? undefined : readDescription(body.description),
    status: body.status,
  };

  next();
};

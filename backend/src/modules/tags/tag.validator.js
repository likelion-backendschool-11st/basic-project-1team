import { isValidTagName, normalizeTagName } from '../../common/utils/tag-name.js';
import {
  readBodyObject,
  readEnum,
  readSearchText,
  readSize,
  throwValidationError,
} from '../../common/utils/validation.js';

const DEFAULT_SIZE = 10;
const SORTS = ['popular', 'name'];
const DESCRIPTION_MAX_LENGTH = 100;

// Express 5의 req.query는 읽기 전용이라 검증·변환한 값을 req.validatedQuery에 담는다
export const validateGetTags = (req, _res, next) => {
  req.validatedQuery = {
    keyword: readSearchText(req.query, 'keyword'),
    sort: readEnum(req.query, 'sort', SORTS, 'popular'),
    size: readSize(req.query, DEFAULT_SIZE),
  };

  next();
};

// 경로의 태그 이름은 태그 이름 규칙에 맞아야 한다 (API 명세 5.1). 정규화는 Service에서 한다
export const validateTagName = (req, _res, next) => {
  if (!isValidTagName(normalizeTagName(req.params.tagName))) {
    throwValidationError('태그 이름 형식이 올바르지 않습니다.');
  }

  next();
};

// 설명은 키가 꼭 있어야 하고, 최대 100자. 빈 값이나 null이면 설명을 지운다 (API 명세 5장 PATCH)
export const validateUpdateTagDescription = (req, _res, next) => {
  const body = readBodyObject(req.body);

  if (!('description' in body)) {
    throwValidationError('description을 보내야 합니다.');
  }

  const { description } = body;

  if (description !== null && typeof description !== 'string') {
    throwValidationError('description은 문자열이어야 합니다.');
  }

  const trimmed = description === null ? '' : description.trim();

  if (Array.from(trimmed).length > DESCRIPTION_MAX_LENGTH) {
    throwValidationError(`description은 ${DESCRIPTION_MAX_LENGTH}자 이하여야 합니다.`);
  }

  req.body = { description: trimmed === '' ? null : trimmed };

  next();
};

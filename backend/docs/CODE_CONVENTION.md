# CODE CONVENTION (Backend)

GAMERS 백엔드(Node.js + Express 5)의 공통 코드 컨벤션입니다.
새 코드는 이 문서를 따르고, 문서와 다르게 작성해야 할 이유가 생기면 코드보다 문서를 먼저 논의/수정합니다.

---

## 1. 기본 환경

| 항목 | 내용 |
| --- | --- |
| Runtime | Node.js 26.x |
| Framework | Express 5 |
| Language | JavaScript |
| Module | ESM (`"type": "module"`) |
| 비동기 | `async/await` |
| Lint / Format | ESLint (flat config) / Prettier |
| API | RESTful |
| 구조 | Feature(도메인) 기반 모듈 구조 |

---

## 2. 모듈 시스템 (ESM)

- `import` / `export`만 사용합니다. `require`, `module.exports`는 사용하지 않습니다.
- 상대 경로 import에는 **확장자 `.js`를 반드시 붙입니다.** (ESM은 확장자를 생략할 수 없습니다.)
- `export default`는 사용하지 않고 **named export**만 사용합니다. (Express `router`, `app` 인스턴스는 예외)
- 다른 레이어의 함수 묶음은 namespace import로 가져옵니다.
- Node 내장 모듈은 `node:` prefix를 붙입니다.

```javascript
// Bad
const express = require('express');
import { createQuestion } from './question.service';
import path from 'path';

// Good
import express from 'express';
import path from 'node:path';
import * as questionService from './question.service.js';
```

### import 순서

그룹 사이에 빈 줄을 하나 둡니다.

1. Node 내장 모듈 (`node:*`)
2. 외부 패키지
3. 프로젝트 내부 모듈 (`common`, `config`, 다른 module)
4. 같은 module 내부 파일

```javascript
import crypto from 'node:crypto';

import express from 'express';

import { NotFoundError } from '../../common/error/http-errors.js';

import * as questionRepository from './question.repository.js';
```

---

## 3. ESLint

`@eslint/js` recommended를 기본으로 하고, 아래 규칙을 추가합니다.

```javascript
// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
];
```

- 사용하지 않는 변수는 제거합니다.
- 시그니처상 필요하지만 쓰지 않는 인자는 `_` prefix를 붙입니다. (예: Error Middleware의 `_next`)
- `==`, `!=` 대신 `===`, `!==`를 사용합니다.
- 조건문 중괄호는 한 줄이어도 생략하지 않습니다.
- `var`는 사용하지 않고, 재할당이 없으면 `const`를 사용합니다.
- `console.*`는 남기지 않고 공통 logger(`common/utils/logger.js`)를 사용합니다.

```javascript
// Bad
if (user == null) return;

// Good
if (user === null) {
  return;
}
```

---

## 4. Prettier

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "endOfLine": "lf"
}
```

| 항목 | 규칙 |
| --- | --- |
| 들여쓰기 | 2 spaces |
| 따옴표 | Single Quote |
| 세미콜론 | 사용 |
| 최대 줄 길이 | 100 |
| Trailing Comma | 사용 |
| 줄바꿈 | LF |

포맷팅은 사람이 맞추지 않고 Prettier에 맡깁니다.

---

## 5. Naming Convention

| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| 변수 / 함수 | `camelCase` | `questionCount`, `getQuestionById()` |
| Boolean | `is` / `has` / `can` / `should` prefix | `isActive`, `hasPermission` |
| 클래스 | `PascalCase` | `NotFoundError` |
| 상수 | `UPPER_SNAKE_CASE` | `DEFAULT_PAGE_SIZE` |
| 에러 코드 | `UPPER_SNAKE_CASE` | `QUESTION_NOT_FOUND` |
| module 디렉터리 | 복수형 `kebab-case` | `questions/`, `tag-synonyms/` |
| module 파일 | `<도메인 단수>.<레이어>.js` | `question.service.js`, `tag-synonym.route.js` |
| common 파일 | `kebab-case` (+ `.<역할>`) | `auth.middleware.js`, `http-errors.js` |
| URL 경로 | 복수형 `kebab-case` | `/questions`, `/tag-synonyms` |
| URL 파라미터 | `camelCase` + `Id` | `:questionId` |
| JSON 필드 | `camelCase` | `createdAt`, `answerCount` |

- 약어는 쓰지 않습니다. (`qst`, `usr`, `cnt` ❌)
- 같은 개념은 프로젝트 전체에서 같은 단어를 씁니다. (예: 회원은 항상 `user`, `member`/`account` 혼용 ❌)

---

## 6. 함수 네이밍 (동사 규칙)

| 동사 | 의미 | 사용 레이어 |
| --- | --- | --- |
| `get` | 반드시 존재해야 하는 대상 조회. **없으면 `NotFoundError`를 던집니다.** | Service |
| `find` | 없을 수도 있는 대상 조회. **없으면 `null` / 빈 배열을 반환합니다.** | Repository, Service |
| `create` | 생성 | Service, Repository |
| `update` | 수정 | Service, Repository |
| `delete` | 삭제 | Service, Repository |
| `count` | 개수 조회 | Repository |
| `is` / `has` / `can` | Boolean 반환 | 전체 |
| 도메인 동사 | 도메인 행위 | Service (예: `acceptAnswer`, `mergeTags`) |

- 조건은 `By<조건>`으로 붙입니다: `findUserByEmail`, `findAnswersByQuestionId`
- 목록은 복수형을 사용합니다: `getQuestions`, `findQuestions`
- `search`, `select`, `fetch`, `remove` 등 같은 의미의 다른 동사는 쓰지 않습니다.

```javascript
// Service
export const getQuestionById = async (questionId) => {
  const question = await questionRepository.findQuestionById(questionId);

  if (question === null) {
    throw new NotFoundError('QUESTION_NOT_FOUND', '질문을 찾을 수 없습니다.');
  }

  return question;
};
```

### 도메인 예시

```javascript
// Question
getQuestions();      getQuestionById();
createQuestion();    updateQuestion();    deleteQuestion();

// Answer
getAnswersByQuestionId();
createAnswer();      updateAnswer();      deleteAnswer();
acceptAnswer();

// Tag
getTags();           getTagById();        findTagsByIds();
createTag();         updateTag();         deleteTag();
createTagSynonym();  mergeTags();

// User
getUserById();       findUserByEmail();
createUser();        updateUser();        deleteUser();

// Boolean
isQuestionOwner();   hasAcceptedAnswer(); canEditQuestion();
```

---

## 7. 디렉터리 구조

```text
backend/
├── src/
│   ├── modules/
│   │   ├── questions/
│   │   │   ├── question.route.js
│   │   │   ├── question.controller.js
│   │   │   ├── question.service.js
│   │   │   ├── question.repository.js
│   │   │   └── question.validator.js
│   │   ├── answers/
│   │   ├── tags/
│   │   └── users/
│   │
│   ├── common/
│   │   ├── middleware/   # auth.middleware.js, error-handler.middleware.js, not-found.middleware.js
│   │   ├── error/        # http-errors.js
│   │   └── utils/        # logger.js 등
│   │
│   ├── config/           # env.js(환경 변수), database.js(DB 커넥션 풀·트랜잭션)
│   │
│   ├── app.js            # Express app 생성, middleware/router 등록 (listen 하지 않음)
│   └── server.js         # app.listen, 프로세스 시작/종료 처리
│
├── docs/
├── eslint.config.js
├── .prettierrc
└── package.json
```

- 한 도메인의 Route ~ Repository는 같은 module 디렉터리에 둡니다.
- 다른 module의 **Repository를 직접 import 하지 않고 Service를 통해** 사용합니다.
- 두 군데 이상의 module에서 쓰는 코드만 `common/`으로 올립니다.
- `app.js`는 `listen`하지 않습니다. (테스트에서 `app`만 import 할 수 있도록)
- 주기적으로 도는 정리 작업(미연결 첨부파일 정리, 기간 지난 기록 삭제 등)은 작업 내용을 해당 module의 Service 함수로 만들고, `server.js`에서 `common/utils/periodic-job.js`의 `startPeriodicJob(이름, 주기, 함수)`로 등록합니다. 서버 종료 처리에서 돌려받은 함수로 멈춥니다. 별도 스케줄러 패키지나 외부 cron은 쓰지 않습니다.

---

## 8. Layer 책임

```text
Route → (Middleware: 인증 / 권한 / Validator) → Controller → Service → Repository → Database
```

| 레이어 | 하는 일 | 하지 않는 일 |
| --- | --- | --- |
| Route | URL·Method 정의, Middleware와 Controller 연결 | 로직 작성 |
| Validator | `req.params` / `query` / `body` 형식 검증, 검증한 값 정리(trim·기본값·타입 변환) | DB 조회, 비즈니스 규칙 판단 |
| Controller | `req`에서 값 추출, Service 호출, Status·Response 반환 | 비즈니스 로직, DB 접근, `try/catch` 반복 |
| Service | 비즈니스 규칙, 권한/상태 검증, Repository 조합, Custom Error 발생 | `req` / `res` 접근 |
| Repository | DB 조회/생성/수정/삭제 | 비즈니스 규칙, HTTP Error 발생 |

### Route

```javascript
// src/modules/questions/question.route.js
import { Router } from 'express';

import { authMiddleware } from '../../common/middleware/auth.middleware.js';

import * as questionController from './question.controller.js';
import { validateCreateQuestion } from './question.validator.js';

const router = Router();

router.get('/', questionController.getQuestions);
router.get('/:questionId', questionController.getQuestionById);
router.post('/', authMiddleware, validateCreateQuestion, questionController.createQuestion);

export default router;
```

### Validator

Validator는 Middleware로 만들고, 형식이 틀리면 `BadRequestError('VALIDATION_ERROR', ...)`를 던집니다. 검증하면서 정리한 값(trim, 기본값, 숫자·boolean 변환)은 아래처럼 넘깁니다.

| 대상 | 정리한 값을 넘기는 곳 | 이유 |
| --- | --- | --- |
| `req.query` | **`req.validatedQuery`** 에 새 객체로 담음 | Express 5에서 `req.query`는 읽기 전용이라 다시 넣을 수 없음 |
| `req.body` | `req.body`를 정리한 객체로 **교체** | `req.body`는 바꿀 수 있음. 허용한 필드만 담아 넘김 |
| `req.params` | 형식만 검사하고 바꾸지 않음. Controller에서 `Number(req.params.questionId)`로 변환 | |

- Controller는 `req.query` 대신 `req.validatedQuery`를 Service에 넘깁니다.
- 같은 query 키를 여러 번 보내면 배열이 되므로, 문자열 하나만 받는 값은 배열이면 `VALIDATION_ERROR`로 막습니다.
- 경로 id(`:questionId` 등)가 1 이상의 정수가 아니면 `VALIDATION_ERROR`입니다. (API 명세 1.3)

```javascript
// src/modules/questions/question.validator.js
export const validateGetQuestions = (req, _res, next) => {
  req.validatedQuery = {
    page: readPositiveInteger(req.query, 'page') ?? DEFAULT_PAGE,
    sort: readEnum(req.query, 'sort', SORTS, 'latest'),
  };

  next();
};

export const validateCreateQuestion = (req, _res, next) => {
  const body = readBodyObject(req.body);

  req.body = {
    title: readTitle(body.title),
    tags: readTags(body.tags),
  };

  next();
};

// src/modules/questions/question.controller.js
export const getQuestions = async (req, res) => {
  const { questions, meta } = await questionService.getQuestions(req.validatedQuery);

  res.status(200).json({ success: true, data: questions, meta });
};
```

### Controller

```javascript
// src/modules/questions/question.controller.js
import * as questionService from './question.service.js';

export const createQuestion = async (req, res) => {
  const question = await questionService.createQuestion(req.user.id, req.body);

  res.status(201).json({ success: true, data: question });
};
```

### Service

```javascript
// src/modules/questions/question.service.js
import { BadRequestError } from '../../common/error/http-errors.js';
import * as tagService from '../tags/tag.service.js';

import * as questionRepository from './question.repository.js';

export const createQuestion = async (userId, data) => {
  const tags = await tagService.findTagsByIds(data.tagIds);

  if (tags.length === 0) {
    throw new BadRequestError('TAG_REQUIRED', '태그를 하나 이상 선택해주세요.');
  }

  return questionRepository.createQuestion({ userId, ...data });
};
```

### Repository

DB는 `mysql2`로 SQL을 직접 작성합니다. Repository는 **`getExecutor()`로 쿼리할 대상을 얻습니다.** `pool`을 직접 import 하지 않습니다.

- `getExecutor()`는 `withTransaction` 안이면 그 트랜잭션의 연결을, 밖이면 `pool`을 돌려줍니다. 그래서 Repository 함수는 연결 객체를 인자로 받지 않고, 같은 함수를 트랜잭션 안팎에서 그대로 씁니다.
- 값은 항상 `?` 자리표시자로 넘깁니다. SQL 문자열에 값을 이어 붙이지 않습니다. (`IN (?)`에는 배열을 넘기면 펼쳐집니다)
- DB 컬럼(`snake_case`)을 그대로 돌려주고, API 필드(`camelCase`)로 바꾸는 일은 Service에서 합니다.
- 한 건 조회(`find...ById`)는 없으면 `null`을 돌려줍니다.

```javascript
// src/modules/questions/question.repository.js
import { getExecutor } from '../../config/database.js';

export const findQuestionById = async (questionId) => {
  const [rows] = await getExecutor().query(
    "SELECT id, title, author_id FROM questions WHERE id = ? AND status = 'active'",
    [questionId],
  );

  return rows[0] ?? null;
};
```

### 트랜잭션

여러 쿼리를 함께 성공·실패시켜야 하면 **Service에서 `withTransaction`으로 묶습니다.** 콜백 안에서 호출한 Repository 함수(다른 module의 Service를 거친 것 포함)는 모두 같은 트랜잭션에서 실행됩니다.

- 콜백이 끝나면 commit, 에러가 나면 rollback 후 그 에러를 다시 던집니다. Service에서 `try/catch`로 감싸지 않습니다.
- 다른 요청과 동시에 바뀌면 안 되는 행은 트랜잭션 안에서 `SELECT ... FOR UPDATE`로 잠근 뒤 확인합니다. (예: 질문 수정·삭제 전 질문 행)
- 외부 저장소 업로드처럼 DB가 아닌 작업과 오래 걸리는 계산은 트랜잭션 밖에서 먼저 합니다. (트랜잭션 동안 연결과 잠금을 오래 잡지 않도록)

```javascript
// src/modules/questions/question.service.js
import { withTransaction } from '../../config/database.js';

export const deleteQuestion = async (userId, questionId) => {
  await withTransaction(async () => {
    const question = await questionRepository.findQuestionByIdForUpdate(questionId);
    ensureQuestionOwner(question, userId);

    await questionRepository.deleteQuestion(questionId);
    await questionRepository.deleteQuestionTagsByQuestionId(questionId);
    await attachmentService.deleteAttachmentLinksByTarget('question', questionId);
  });
};
```

---

## 9. 비동기 처리 & Express 5 주의사항

- 비동기 코드는 `async/await`로 통일합니다. `.then()` 체인과 callback은 쓰지 않습니다.
- 서로 의존하지 않는 비동기 작업은 `Promise.all`로 병렬 처리합니다.
- Express 5는 async handler에서 throw/reject된 에러를 자동으로 Error Middleware로 전달합니다.
  **Controller에서 `try/catch`로 감싸거나 `asyncHandler` wrapper를 쓰지 않습니다.**
- Express 5에서 `req.query`는 읽기 전용입니다. 가공한 값은 `req.query`에 다시 넣지 않고, Validator에서는 `req.validatedQuery`에, 그 밖에는 지역 변수에 담습니다. ([8장 Validator](#validator))
- Express 5의 경로 문법을 따릅니다. (wildcard는 `/*splat` 처럼 이름을 붙입니다.)

```javascript
// Bad
export const getQuestionById = async (req, res, next) => {
  try {
    const question = await questionService.getQuestionById(req.params.questionId);
    res.json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

// Good
export const getQuestionById = async (req, res) => {
  const question = await questionService.getQuestionById(req.params.questionId);

  res.status(200).json({ success: true, data: question });
};

// 병렬 처리
const [question, answers] = await Promise.all([
  questionService.getQuestionById(questionId),
  answerService.getAnswersByQuestionId(questionId),
]);
```

---

## 10. Error 처리

### Custom Error

모든 의도된 에러는 `AppError`를 상속한 클래스로 던집니다. 생성자 인자는 `(code, message)` 순서입니다.

```javascript
// src/common/error/http-errors.js
export class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
  }
}

export class BadRequestError extends AppError {
  constructor(code = 'BAD_REQUEST', message = '잘못된 요청입니다.') {
    super(400, code, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(code = 'UNAUTHORIZED', message = '로그인이 필요합니다.') {
    super(401, code, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(code = 'FORBIDDEN', message = '권한이 없습니다.') {
    super(403, code, message);
  }
}

export class NotFoundError extends AppError {
  constructor(code = 'NOT_FOUND', message = '리소스를 찾을 수 없습니다.') {
    super(404, code, message);
  }
}

export class ConflictError extends AppError {
  constructor(code = 'CONFLICT', message = '이미 존재하는 리소스입니다.') {
    super(409, code, message);
  }
}
```

- `throw new Error('...')`나 문자열 throw로 HTTP 에러를 표현하지 않습니다.
- 에러 코드는 `<도메인>_<상황>` 형식입니다: `QUESTION_NOT_FOUND`, `ANSWER_ALREADY_ACCEPTED`
- 입력값 검증 실패는 `BadRequestError('VALIDATION_ERROR', ...)`로 통일합니다.

### Error Middleware

```javascript
// src/common/middleware/error-handler.middleware.js
import { AppError } from '../error/http-errors.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
  }

  logger.error(err);

  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' },
  });
};
```

- Error Middleware는 인자가 4개여야 Express가 인식하므로 `_next`를 유지합니다.
- 예상하지 못한 에러(500)는 **내부 메시지를 응답에 노출하지 않고** 로그로만 남깁니다.
- `app.js`에서 모든 router 등록 후 `notFoundHandler` → `errorHandler` 순서로 마지막에 등록합니다.

---

## 11. Response 형식

모든 응답은 아래 형식을 따릅니다. 필드명은 `camelCase`, 날짜는 ISO 8601 문자열입니다.

### 성공

```json
{
  "success": true,
  "data": { "id": 1, "title": "...", "createdAt": "2026-11-12T03:00:00.000Z" }
}
```

### 목록 (페이지네이션)

```json
{
  "success": true,
  "data": [{ "id": 1 }, { "id": 2 }],
  "meta": { "page": 1, "size": 20, "totalCount": 135 }
}
```

### 실패

```json
{
  "success": false,
  "error": { "code": "QUESTION_NOT_FOUND", "message": "질문을 찾을 수 없습니다." }
}
```

### Status Code

| 상황 | Status |
| --- | --- |
| 조회 / 수정 성공 | `200` |
| 생성 성공 | `201` |
| 삭제 성공 | `204` (body 없음) |
| 입력값 오류 | `400` |
| 인증 필요 | `401` |
| 권한 없음 | `403` |
| 리소스 없음 | `404` |
| 중복 / 상태 충돌 | `409` |
| 서버 오류 | `500` |

비밀번호 등 민감 정보는 Service에서 응답 객체를 만들 때 제외합니다.

---

## 12. REST API

- URL에는 동사 대신 **복수형 리소스명**을 씁니다.
- 하위 리소스는 한 단계까지만 중첩합니다.
- 리소스 CRUD로 표현하기 어려운 행위만 하위 경로 동사를 허용합니다. (예: 답변 채택)
- 정렬/필터/페이지는 query string으로 받습니다: `?page=1&size=20&sort=latest&tag=lol`
- 실제 URL·필드·prefix는 **API 명세가 우선**입니다.

| Method | 역할 |
| --- | --- |
| `GET` | 조회 |
| `POST` | 생성 |
| `PATCH` | 일부 수정 |
| `DELETE` | 삭제 |

```http
GET    /questions
GET    /questions/:questionId
POST   /questions
PATCH  /questions/:questionId
DELETE /questions/:questionId

GET    /questions/:questionId/answers
POST   /questions/:questionId/answers
PATCH  /answers/:answerId
DELETE /answers/:answerId
POST   /answers/:answerId/accept
```

```text
Bad:  /getQuestions, /createQuestion, /question/delete/1
Good: GET /questions, POST /questions, DELETE /questions/1
```

---

## 13. 환경 변수 & 설정

- `process.env`는 **`src/config/` 안에서만** 읽고, 나머지 코드는 config 객체를 import 합니다.
- 필수 환경 변수가 없으면 서버 시작 시점에 에러로 종료합니다.
- `.env` 파일은 커밋하지 않고, 키 목록은 `.env.example`로 공유합니다.
- `.env` 로드는 Node 내장 기능(`node --env-file=.env`)을 사용합니다.

```javascript
// src/config/env.js
const requireEnv = (key) => {
  const value = process.env[key];

  if (value === undefined) {
    throw new Error(`환경 변수 ${key}가 설정되지 않았습니다.`);
  }

  return value;
};

export const env = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: requireEnv('DATABASE_URL'),
};
```

---

## 14. 주석

- 코드가 **무엇을** 하는지는 이름으로 드러내고, 주석은 **왜** 그렇게 했는지만 씁니다.
- 주석 처리한 코드는 남기지 않고 삭제합니다.
- 해야 할 일은 `// TODO: 내용 (#이슈번호)` 형식으로 남깁니다.

---

## 15. 기본 원칙 요약

- 하나의 함수는 하나의 책임만 가집니다.
- Controller·Repository에는 비즈니스 로직을 두지 않습니다.
- 다른 module의 데이터는 그 module의 Service를 통해 가져옵니다.
- 비동기는 `async/await`, 에러는 Custom Error + 공통 Error Middleware로 처리합니다.
- 여러 쿼리를 함께 성공·실패시켜야 하면 Service에서 `withTransaction`으로 묶습니다.
- 응답 형식과 에러 코드 형식을 통일합니다.
- 포맷은 Prettier, 품질은 ESLint에 맡깁니다.
- API 명세와 이 문서가 다르면 코드보다 문서 수정 여부를 먼저 논의합니다.

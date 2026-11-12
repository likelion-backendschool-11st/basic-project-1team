# CODE CONVENTION

Node.js + Express 프로젝트에서 사용하는 공통 코드 컨벤션입니다.

---

## 1. 기본 개발 환경

- JavaScript
- Node.js
- Express
- ESLint
- Prettier
- 비동기 처리: `async/await`
- API 설계: RESTful API
- 프로젝트 구조: Feature 기반 모듈 구조

---

## 2. ESLint

ESLint는 `@eslint/js`의 recommended 설정을 기본으로 사용하고, 프로젝트에 필요한 규칙을 추가합니다.

```javascript
// eslint.config.js
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    rules: {
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
      'no-console': 'warn',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
    },
  },
];
```

### 기본 규칙

- 사용하지 않는 변수는 제거합니다.
- 의도적으로 사용하지 않는 함수 인자는 `_` prefix를 사용합니다.
- `==`, `!=` 대신 `===`, `!==`를 사용합니다.
- 조건문에는 중괄호를 생략하지 않습니다.
- 불필요한 `console.log`는 남기지 않습니다.

```javascript
// Bad
if (user == null) return;

// Good
if (user === null) {
  return;
}
```

---

## 3. Prettier

다음 포맷을 프로젝트 공통 규칙으로 사용합니다.

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

### Formatting 규칙

| 항목 | 규칙 |
| --- | --- |
| 들여쓰기 | 2 spaces |
| 따옴표 | Single Quote |
| 세미콜론 | 사용 |
| 최대 줄 길이 | 100 |
| Trailing Comma | 사용 |
| 줄바꿈 | LF |

---

## 4. Naming Convention

### 변수

`camelCase`를 사용합니다.

```javascript
const userName = 'gamer01';
const questionCount = 10;
```

### 함수

`camelCase`를 사용하며 동사로 시작합니다.

```javascript
getUser();
getUserById();

createUser();
updateUser();
deleteUser();

findUserByEmail();
validatePassword();
```

동일한 의미의 함수는 동일한 동사를 사용합니다.

```javascript
// Bad
getUser();
searchMember();
selectAccount();

// Good
getUser();
getUserById();
getUserByEmail();
```

### Boolean

`is`, `has`, `can`, `should` 등의 prefix를 사용합니다.

```javascript
const isActive = true;
const hasPermission = true;
const canEdit = false;
const shouldRefresh = true;
```

### 클래스

`PascalCase`를 사용합니다.

```javascript
class UserService {}

class QuestionRepository {}
```

### 상수

`UPPER_SNAKE_CASE`를 사용합니다.

```javascript
const MAX_LOGIN_ATTEMPTS = 5;
const DEFAULT_PAGE_SIZE = 20;
```

### 파일명

`kebab-case`를 사용합니다.

```text
user-controller.js
user-service.js
user-repository.js

question-controller.js
question-service.js

auth-middleware.js
error-handler.js
```

---

## 5. 프로젝트 디렉터리 구조

Feature 기반 모듈 구조를 사용합니다.

```text
src/
├── modules/
│   ├── users/
│   │   ├── user.route.js
│   │   ├── user.controller.js
│   │   ├── user.service.js
│   │   ├── user.repository.js
│   │   └── user.validator.js
│   │
│   ├── questions/
│   │   ├── question.route.js
│   │   ├── question.controller.js
│   │   ├── question.service.js
│   │   ├── question.repository.js
│   │   └── question.validator.js
│   │
│   ├── answers/
│   │   ├── answer.route.js
│   │   ├── answer.controller.js
│   │   ├── answer.service.js
│   │   ├── answer.repository.js
│   │   └── answer.validator.js
│   │
│   └── tags/
│       ├── tag.route.js
│       ├── tag.controller.js
│       ├── tag.service.js
│       ├── tag.repository.js
│       └── tag.validator.js
│
├── common/
│   ├── middleware/
│   ├── error/
│   └── utils/
│
├── config/
│
├── app.js
└── server.js
```

### 디렉터리 역할

| 디렉터리 | 역할 |
| --- | --- |
| `modules` | 도메인별 기능 |
| `controller` | HTTP 요청/응답 처리 |
| `service` | 비즈니스 로직 |
| `repository` | DB 접근 |
| `validator` | 요청 데이터 검증 |
| `common/middleware` | 공통 Middleware |
| `common/error` | 공통 Error 클래스 및 Error Handler |
| `common/utils` | 공통 Utility |
| `config` | 환경설정 |
| `app.js` | Express Application 설정 |
| `server.js` | 서버 실행 |

---

## 6. Layer 책임

프로젝트의 요청 처리 흐름은 다음과 같이 구성합니다.

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Database
```

### Route

- URL과 HTTP Method를 정의합니다.
- Controller와 연결합니다.
- 인증, 권한, Validation Middleware를 연결합니다.
- 비즈니스 로직을 작성하지 않습니다.

```javascript
router.post(
  '/',
  authMiddleware,
  validateCreateQuestion,
  questionController.createQuestion,
);
```

### Controller

Controller는 HTTP 요청과 응답만 담당합니다.

- `req`에서 요청 데이터를 추출합니다.
- Service를 호출합니다.
- HTTP Status Code를 설정합니다.
- Response를 반환합니다.
- 비즈니스 로직을 작성하지 않습니다.
- 직접 DB에 접근하지 않습니다.

```javascript
export const createQuestion = async (req, res) => {
  const question = await questionService.createQuestion(
    req.user.id,
    req.body,
  );

  res.status(201).json({
    success: true,
    data: question,
  });
};
```

### Service

비즈니스 로직을 담당합니다.

- 도메인 규칙을 처리합니다.
- 여러 Repository를 조합합니다.
- 권한 및 상태를 검증합니다.
- 필요 시 Custom Error를 발생시킵니다.

```javascript
export const createQuestion = async (userId, data) => {
  const tags = await tagRepository.findByIds(data.tagIds);

  if (tags.length === 0) {
    throw new BadRequestError('태그를 하나 이상 선택해주세요.');
  }

  return questionRepository.create({
    userId,
    ...data,
  });
};
```

### Repository

DB 접근을 담당합니다.

- 조회
- 등록
- 수정
- 삭제

비즈니스 로직을 작성하지 않습니다.

```javascript
export const findQuestionById = async (questionId) => {
  return Question.findByPk(questionId);
};
```

---

## 7. REST API Convention

URL에는 동사 대신 리소스명을 사용합니다.

### Questions

```http
GET    /questions
GET    /questions/:questionId
POST   /questions
PATCH  /questions/:questionId
DELETE /questions/:questionId
```

### Answers

```http
GET    /questions/:questionId/answers
POST   /questions/:questionId/answers

PATCH  /answers/:answerId
DELETE /answers/:answerId
```

### Tags

```http
GET    /tags
GET    /tags/:tagId
POST   /tags
PATCH  /tags/:tagId
DELETE /tags/:tagId
```

### URL 규칙

```text
Bad

/getQuestions
/createQuestion
/updateQuestion
/deleteQuestion
```

```text
Good

GET    /questions
POST   /questions
PATCH  /questions/:questionId
DELETE /questions/:questionId
```

---

## 8. HTTP Method

| Method | 역할 |
| --- | --- |
| `GET` | 조회 |
| `POST` | 생성 |
| `PATCH` | 일부 수정 |
| `DELETE` | 삭제 |

---

## 9. 비동기 처리

비동기 코드는 `async/await`를 사용합니다.

```javascript
const user = await userService.getUserById(userId);
```

Callback 방식과 Promise `.then()` 체인을 혼용하지 않습니다.

```javascript
// Bad
userService.getUserById(userId)
  .then((user) => {
    // ...
  })
  .catch((error) => {
    // ...
  });

// Good
const user = await userService.getUserById(userId);
```

---

## 10. Express 비동기 Error 처리

Express 5 기준으로 `async` handler에서 발생한 예외는 공통 Error Middleware로 전달되도록 구성합니다.

Controller마다 동일한 `try/catch`를 반복하지 않습니다.

```javascript
export const getQuestion = async (req, res) => {
  const question = await questionService.getQuestionById(
    req.params.questionId,
  );

  res.status(200).json({
    success: true,
    data: question,
  });
};
```

---

## 11. Error 처리

에러는 공통 Error Middleware에서 처리합니다.

```javascript
app.use((err, req, res, next) => {
  res.status(err.status ?? 500).json({
    success: false,
    error: {
      code: err.code ?? 'INTERNAL_SERVER_ERROR',
      message: err.message,
    },
  });
});
```

### Error Response

모든 API Error Response는 동일한 구조를 사용합니다.

```json
{
  "success": false,
  "error": {
    "code": "QUESTION_NOT_FOUND",
    "message": "질문을 찾을 수 없습니다."
  }
}
```

---

## 12. Success Response

API 성공 응답 역시 공통 형식을 사용합니다.

### 단건 조회

```json
{
  "success": true,
  "data": {
    "id": 1
  }
}
```

### 생성

```javascript
res.status(201).json({
  success: true,
  data: question,
});
```

### 조회

```javascript
res.status(200).json({
  success: true,
  data: question,
});
```

---

## 13. 함수 네이밍

CRUD 함수는 아래 네이밍을 기본으로 사용합니다.

```javascript
getQuestion();
getQuestionById();

createQuestion();

updateQuestion();

deleteQuestion();
```

조건 검색은 `find`를 사용합니다.

```javascript
findUserByEmail();

findQuestionByTitle();

findTagByName();
```

Boolean 값을 반환하는 함수는 Boolean prefix를 사용합니다.

```javascript
isQuestionOwner();
hasAcceptedAnswer();
canEditQuestion();
```

---

## 14. GAMERS 도메인 네이밍 예시

### Question

```javascript
getQuestions();
getQuestionById();

createQuestion();
updateQuestion();
deleteQuestion();
```

### Answer

```javascript
getAnswersByQuestionId();

createAnswer();
updateAnswer();
deleteAnswer();

acceptAnswer();
```

### Tag

```javascript
getTags();
getTagById();

createTag();
updateTag();
deleteTag();

createTagSynonym();
```

### User

```javascript
getUserById();
findUserByEmail();

createUser();
updateUser();
deleteUser();
```

---

## 15. 코드 작성 기본 원칙

- 하나의 함수는 하나의 책임만 가집니다.
- Controller에 비즈니스 로직을 작성하지 않습니다.
- Repository에 비즈니스 로직을 작성하지 않습니다.
- 동일한 로직을 여러 곳에 중복 작성하지 않습니다.
- 의미가 드러나는 변수명과 함수명을 사용합니다.
- 약어 사용을 최소화합니다.
- 동일한 도메인 용어는 프로젝트 전체에서 동일하게 사용합니다.
- 비동기 처리는 `async/await`로 통일합니다.
- Error Response 형식을 통일합니다.
- API URL은 RESTful 규칙을 따릅니다.
- 코드 Formatting은 Prettier에 위임합니다.
- 코드 품질 검사는 ESLint를 사용합니다.

---

## 16. Convention Summary

```text
Language
  JavaScript

Lint
  ESLint
  @eslint/js recommended + custom rules

Formatting
  Prettier
  2 spaces
  single quote
  semicolon
  trailing comma
  printWidth 100

Naming
  File       kebab-case
  Variable   camelCase
  Function   camelCase
  Class      PascalCase
  Constant   UPPER_SNAKE_CASE
  Boolean    is / has / can / should

Architecture
  Feature-based

Request Flow
  Route
    ↓
  Controller
    ↓
  Service
    ↓
  Repository
    ↓
  Database

API
  RESTful

Async
  async / await

Error
  Common Error Middleware

Response
  Common Response Format
```

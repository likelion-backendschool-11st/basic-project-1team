# CODE CONVENTION (Frontend)

GAMERS 프론트엔드(React 18 + TypeScript + Vite)의 공통 코드 컨벤션입니다.
새 코드는 이 문서를 따르고, 문서와 다르게 작성해야 할 이유가 생기면 코드보다 문서를 먼저 논의/수정합니다.
지금 코드에서 가장 많이 쓰는 방식을 기준으로 정했고, 기존 코드도 모두 이 규칙에 맞춰 정리했습니다.

---

## 1. 기본 환경

| 항목 | 내용 |
| --- | --- |
| Framework | React 18.3.1 |
| Language | TypeScript 5.6 (`strict`) |
| Build | Vite 5 |
| Router | react-router-dom 6. Q&A·자유게시판·회원 화면은 `apps/site`의 `BrowserRouter` 하나를 같이 쓰고, 관리자만 따로 둠 |
| Style | Tailwind CSS 3, 공통 디자인 토큰(`src/theme`)을 preset으로 씀. **다크 테마만** 사용 |
| Lint / Format | ESLint (flat config, typescript-eslint) / Prettier |
| 구조 | 하나의 SPA 안에 URL prefix로 나뉜 4개 모듈 (`web`, `qna`, `board`, `admin`) |

---

## 2. 폴더 구조

```text
src/
├── main.tsx                 # URL prefix로 모듈을 골라 lazy load
├── theme/
│   ├── tokens.json          # 모든 모듈이 쓰는 디자인 토큰 (색·간격·글꼴·크기)
│   └── tailwind.preset.js   # tokens.json 을 Tailwind preset 으로 묶음
├── shared/                  # 여러 모듈이 함께 쓰는 코드
│   ├── auth.ts              # 토큰 저장·삭제, 로그인 이동, 로그아웃
│   ├── LoginGate.tsx        # 비회원 작성·추천·신고 시 로그인 안내
│   ├── RequireLogin.tsx     # 로그인 필요한 라우트 보호
│   ├── site.ts              # 공통 헤더·푸터 문구와 메뉴
│   ├── notices.ts           # 공지 타입·mock (헤더 공지 롤링, Q&A 공지 화면)
│   ├── layout/              # SiteLayout(헤더·공지 롤링·푸터), SiteLink 등 공통 화면
│   ├── tag.ts               # 태그 이름 정규화·검사
│   └── userRules.ts         # 회원 입력값 규칙
├── apps/site/               # Q&A·자유게시판·회원을 묶는 진입점: BrowserRouter 하나, SiteLayout, 합친 index.css
└── apps/<모듈>/
    ├── Root.tsx             # BrowserRouter + index.css (admin 진입점. qna·board·web 은 site 가 대신함)
    ├── App.tsx              # Routes (qna·board 는 /qna/*, /board/* 아래 상대 경로, web 은 /login·/mypage 등 전체 경로)
    ├── routes.ts            # 화면 경로. 모듈 prefix 를 포함한 전체 경로로 만든다 (예: `/qna/questions/1`)
    ├── index.css            # @config 로 이 모듈의 tailwind.config.js 사용, 모듈 전용 base·component CSS
    ├── tailwind.config.js   # 공통 preset + content 범위 + plugin (토큰을 여기에 두지 않음)
    ├── pages/               # 라우트 1개 = 페이지 1개 (XxxPage.tsx)
    ├── components/<기능>/    # 화면 조각. 기능별 하위 폴더 (layout, common, ui, detail …)
    ├── hooks/               # 상태·로직 (useXxx.ts)
    └── data/                # types.ts, mockData.ts (화면 문구·mock 데이터)
```

| 위치 | 넣는 것 | 넣지 않는 것 |
| --- | --- | --- |
| `pages/` | 라우트 단위 화면. hook을 불러 컴포넌트에 값을 넘김 | 긴 로직 (→ `hooks/`) |
| `components/` | props를 받아 그리는 화면 조각 | 라우트 정보 직접 의존 (가능하면 page에서 넘김) |
| `hooks/` | 상태, 이벤트 처리, 검증, (연동 후) API 호출 | JSX |
| `data/` | 타입, 화면 문구, mock 데이터 | 로직 |
| `shared/` | 모듈과 무관한 규칙·인증 처리, 여러 모듈이 같이 쓰는 화면(`layout/`) | 한 모듈에서만 쓰는 화면·문구 |

### 2.1 모듈 경계

- 모듈은 **다른 모듈을 import하지 않습니다.** 두 모듈 이상이 쓰는 코드는 `shared/`로 옮깁니다.
- **사용자 화면(Q&A·자유게시판·회원)은 한 페이지처럼 이동합니다.** `apps/site`가 라우터 하나와 `SiteLayout`(헤더·공지 롤링·푸터)을 한 번만 그리고, 그 안에 `/qna/*`, `/board/*`, 회원 화면(`/login`, `/mypage`, `/users/:id` …)을 넣습니다. 탭을 옮겨도 헤더는 그대로 있고 본문만 바뀝니다.
- 그래서 사용자 화면 사이 이동은 `<Link>` / `useNavigate`로 합니다. 경로는 `routes`에 모듈 prefix를 포함한 전체 경로로 둡니다.
- `apps/site`는 진입점이라 각 모듈의 `App`과 회원 정보(`ProfileProvider`)를 가져다 묶습니다. 그 밖의 모듈끼리는 import하지 않습니다.
- 관리자(`/admin`) 화면만 라우터와 CSS가 따로라 **`<a href>`(전체 페이지 이동)**로 엽니다.
- 공통 화면에서 쓰는 링크는 `SiteLink`에 전체 경로를 넘깁니다. 사용자 화면 경로면 `<Link>`, 관리자 화면이면 `<a href>`로 그립니다. 코드에서 이동할 때는 `useSiteNavigate()`를 씁니다.
- 헤더 프로필 메뉴의 내 정보는 `shared/me.ts`의 `useMe()`로 읽습니다. 값은 회원 화면의 `ProfileProvider`가 채웁니다.
- 게시판에만 필요한 기본 CSS는 `.board-app` 영역 안으로 좁힙니다(`apps/site/index.css`). 두 화면이 CSS를 함께 쓰므로 한쪽 기본값이 다른 쪽을 바꾸지 않게 합니다.

```tsx
// Good: 사용자 화면끼리는 페이지를 새로 읽지 않는다
<Link to="/board">자유게시판</Link>
<Link to="/mypage">마이페이지</Link>

// Good: 관리자 화면은 전체 페이지 이동
<a href="/admin">관리자</a>

// Bad: 관리자 화면을 Link 로 열면 site 라우터에 없는 경로라 Q&A 로 돌아간다
<Link to="/admin">관리자</Link>
```

---

## 3. 명령어

`frontend/`에서 실행합니다.

| 명령 | 내용 |
| --- | --- |
| `npm run dev` | 개발 서버 (http://localhost:5173) |
| `npm run typecheck` | 타입 검사 (`tsc --noEmit`) |
| `npm run lint` / `npm run lint:fix` | ESLint 검사 / 자동 수정 |
| `npm run format` / `npm run format:check` | Prettier 정렬 / 검사 |
| `npm run build` | 타입 검사 + 빌드 |

PR 전에 `typecheck`, `lint`, `format:check`, `build`를 통과시킵니다. ESLint는 **error·warning 모두 0개**를 유지합니다.

---

## 4. import / export

- **named export만 사용합니다.** `export default`는 쓰지 않습니다.
  - 예외: 모듈 진입점 `apps/*/Root.tsx`(`main.tsx`가 `lazy(() => import(...))`로 불러서 default가 필요), 설정 파일(`*.config.js`)
- 타입만 가져올 때는 `type`을 붙입니다. (ESLint `consistent-type-imports`, 자동 수정됨)
- 경로 별칭(`@/`)은 쓰지 않고 상대 경로를 씁니다.
- 확장자(`.ts`, `.tsx`)는 붙이지 않습니다.

```tsx
// Bad
export default QuestionCard;
import QuestionCard from './QuestionCard';
import { FormEvent } from 'react';

// Good
export const QuestionCard: React.FC<QuestionCardProps> = (...) => ...;
import { QuestionCard } from './QuestionCard';
import { type FormEvent, useState } from 'react';
```

### import 순서

그룹 사이에 빈 줄은 두지 않습니다.

1. `react`
2. 외부 패키지 (`react-router-dom` 등)
3. `shared/`
4. 같은 모듈의 `data/` → `hooks/` → `components/` → `pages/`
5. CSS (`./index.css`, `Root.tsx`에서만)

```tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLoginGate } from '../../../shared/LoginGate';
import { questionDetail as c } from '../../data/mockData';
import type { Answer } from '../../data/types';
import { useVote } from '../../hooks/useVote';
import { Icon } from '../common/Icon';
```

---

## 5. ESLint

`frontend/eslint.config.js`. `@eslint/js` recommended + `typescript-eslint` recommended에 아래 규칙을 더합니다.

| 규칙 | 수준 | 내용 |
| --- | --- | --- |
| `react-hooks/rules-of-hooks` | error | hook은 컴포넌트·hook 최상단에서만 호출 |
| `react-hooks/exhaustive-deps` | warn | `useEffect` 등 의존성 배열 누락 |
| `react-refresh/only-export-components` | warn | 컴포넌트 파일은 컴포넌트만 export. 원시값 상수와 Provider 파일의 사용 hook(`useProfile`, `useLoginGate`)은 허용, `main.tsx`는 제외 |
| `@typescript-eslint/no-unused-vars` | error | 쓰지 않는 변수 제거. 필요한 인자는 `_` prefix |
| `@typescript-eslint/consistent-type-imports` | error | 타입 import에 `type` |
| `@typescript-eslint/no-empty-object-type` | error | 빈 Props(`interface XProps {}`) 금지. 다른 타입을 그대로 받는 `interface A extends B {}`는 허용 |
| `no-restricted-syntax` (`export default`) | warn | named export 사용 ([4장](#4-import--export)). `Root.tsx`는 제외 |
| `no-console` | warn | `console.*`를 남기지 않음 |
| `eqeqeq` | error | `===`, `!==`만 |
| `prefer-const`, `no-var` | error | |

- `tsconfig.json`의 `strict`, `noUnusedLocals`, `noUnusedParameters`도 함께 적용됩니다.
- 백엔드와 달리 `curly`는 켜지 않습니다. 짧은 early return(`if (!user) return null;`)을 지금 코드가 많이 씁니다.

---

## 6. Prettier

백엔드와 같은 설정입니다. (`frontend/.prettierrc`)

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

- JSX 속성 값은 Prettier 기본대로 큰따옴표(`className="..."`)입니다.
- 포맷팅은 사람이 맞추지 않고 Prettier에 맡깁니다. 에디터의 "저장 시 포맷"을 켜 두는 것을 권장합니다.
- Tailwind 클래스 순서 정렬 플러그인은 쓰지 않습니다. 모듈마다 `tailwind.config.js`가 따로라 플러그인에 설정 하나를 지정할 수 없습니다.

---

## 7. 이름 규칙

| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| 컴포넌트 파일·이름 | `PascalCase.tsx` | `AnswerCard.tsx` |
| 페이지 | `PascalCase` + `Page` | `QuestionDetailPage.tsx` |
| hook 파일·이름 | `use` + `PascalCase`, `.ts` | `useTagInput.ts` |
| 그 외 `.ts` 파일 | `camelCase.ts` | `auth.ts`, `userRules.ts` |
| 폴더 | 소문자 (`components/` 아래 기능 폴더도 소문자) | `components/detail` |
| 변수·함수 | `camelCase` | `selectedTag`, `formatSize` |
| 모듈 수준 상수 | `UPPER_SNAKE_CASE` | `MAX_ATTACHMENTS`, `PAGE_SIZE` |
| 타입·interface | `PascalCase`, `I` prefix 없음 | `Answer`, `SanctionType` |
| Props 타입 | 컴포넌트 이름 + `Props` | `AnswerCardProps` |
| Boolean | `is` / `has` / `can` / `should` | `isOpen`, `canAccept` |
| 이벤트 prop | `on` + 동사 | `onSubmit`, `onClose` |
| 이벤트 처리 함수 (컴포넌트 안) | `handle` + 동사, 또는 동작 이름 | `handleSubmit`, `remove` |
| 화면 문구 객체 | `camelCase`, 화면 이름 기준 | `questionDetail`, `loginContent` |

- API 필드 이름은 명세(`backend/docs/API_SPEC.md`) 그대로 `camelCase`를 씁니다. 화면용 이름으로 바꾸지 않습니다.

---

## 8. 컴포넌트

- `React.FC<Props>` 화살표 함수로 작성하고 named export 합니다. 파일 안에서만 쓰는 컴포넌트도 같은 방식입니다.
- 예외: 타입 매개변수가 있는 제네릭 컴포넌트(`Select<V>`, `TabBar<K>`)는 `React.FC`로 쓸 수 없어 `function` 선언문으로 씁니다.
- Props는 컴포넌트 바로 위에 `interface`로 두고 **모든 필드에 `readonly`**를 붙입니다. 배열은 `readonly T[]`.
- Props가 없으면 Props 타입을 만들지 않고 `React.FC`만 씁니다.
- 파일 하나에 export하는 컴포넌트는 하나입니다. 그 파일에서만 쓰는 작은 컴포넌트는 export 없이 같은 파일에 둘 수 있습니다.
- 컴포넌트 파일에서 객체 상수를 export하지 않습니다. 여러 컴포넌트가 쓰는 상수는 별도 `.ts` 파일로 뺍니다. (예: `components/ui/toneClasses.ts`)
- 페이지는 hook에서 상태와 핸들러를 받아 컴포넌트에 넘기는 역할만 합니다. 상태가 3개를 넘거나 로직이 길어지면 hook으로 뺍니다.
- 목록의 `key`는 id를 씁니다. 배열 index는 순서가 바뀌지 않는 고정 목록에만 씁니다.

```tsx
interface AnswerCardProps {
  readonly answer: Answer;
  readonly canAccept: boolean;
  readonly onAccept: (id: number) => void;
}

/** 답변 1개. 채택 버튼은 canAccept 일 때만 보여 준다 (API_SPEC 4장). */
export const AnswerCard: React.FC<AnswerCardProps> = ({ answer, canAccept, onAccept }) => (
  <article id={`answer-${answer.id}`}>
    ...
    {canAccept && <button onClick={() => onAccept(answer.id)}>채택</button>}
  </article>
);
```

```tsx
// Bad
interface MyPageProps {}
export const MyPage: React.FC<MyPageProps> = () => { ... };

// Good
export const MyPage: React.FC = () => { ... };
```

---

## 9. hook

- 파일 하나에 hook 하나, 이름과 파일명을 같게 합니다.
- 반환값은 **객체**로 돌려줍니다. 받는 쪽에서 이름으로 꺼내 쓰기 위해서입니다. 값 2개짜리 튜플이 자연스러울 때만 배열 + `as const`를 씁니다.
- hook 안의 상수·순수 함수는 hook 밖(파일 최상단)에 둡니다.
- 여러 화면이 같은 상태를 써야 하면 Context + Provider hook으로 만듭니다. (예: `ProfileProvider` / `useProfile`)
- 외부 라이브러리 없이 React 기본 hook만 씁니다. 상태 관리 라이브러리가 필요해지면 먼저 논의합니다.

```ts
export function useAttachments(initial: readonly Attachment[]) {
  const [items, setItems] = useState<Attachment[]>([...initial]);
  const remove = (id: string) => setItems((prev) => prev.filter((a) => a.id !== id));
  return { items, remove };
}
```

---

## 10. 타입

- 객체 모양은 `interface`, 유니온·별칭은 `type`을 씁니다.
- 모듈 타입은 `data/types.ts`(admin은 `types.ts`)에 모읍니다. 그 컴포넌트에서만 쓰는 Props 타입은 컴포넌트 파일에 둡니다.
- 데이터 타입의 필드도 `readonly`로 둡니다. 바꿀 때는 새 객체를 만듭니다.
- 상태값은 문자열 유니온으로 씁니다. `enum`은 쓰지 않습니다.
- 명세의 Enum 값을 그대로 씁니다. (`'pending' | 'resolved' | 'rejected' | 'canceled'`)
- `any`는 쓰지 않습니다. 모르는 값은 `unknown`으로 받고 좁혀서 씁니다.
- non-null 단언(`!`)은 반드시 있는 DOM 요소(`document.getElementById('root')!`) 외에는 쓰지 않습니다.

```ts
/** suspend: 이용 정지, write_ban: 글쓰기 제한, comment_ban: 댓글 제한 (API_SPEC 1.2) */
export type SanctionType = 'suspend' | 'write_ban' | 'comment_ban';

export interface ActiveSanction {
  readonly type: SanctionType;
  /** null 이면 영구 */
  readonly until: string | null;
}
```

---

## 11. 스타일 (Tailwind)

- 스타일은 Tailwind 유틸리티 클래스로만 작성합니다. 모듈별 CSS 파일에 새 클래스를 만들지 않습니다.
- 색·간격·글꼴은 **공통 디자인 토큰**(`src/theme/tokens.json`: `bg-canvas`, `text-ink`, `gap-gutter` 등)을 씁니다. 모든 모듈이 같은 값을 쓰므로 컴포넌트를 다른 모듈로 옮겨도 모양이 같습니다. `#1a1a1a`, `text-[13px]` 같은 임의 값은 토큰이 없을 때만 씁니다.
- 새 토큰이 필요하면 모듈 `tailwind.config.js`가 아니라 `tokens.json`에 추가합니다.
- 화면은 **다크 테마만** 씁니다. `dark:` 변형과 라이트/다크 전환 기능은 만들지 않습니다.
- 강조색 역할: `primary`(보라, 링크·주요 버튼), `secondary`(초록, 성공·채택), `tertiary`(주황, 경고·주의), `semantic-danger`(빨강, 오류·위험).
- 조건부 클래스는 템플릿 문자열로 씁니다. (`clsx` 같은 라이브러리를 쓰지 않음)
- 같은 클래스 묶음이 3곳 이상 반복되면 컴포넌트(`Button`, `Badge` 등)로 뺍니다.
- `style={{ ... }}`은 계산해야 하는 값(차트 높이, 진행률 등)에만 씁니다.

```tsx
<button
  className={`px-space-sm py-1.5 rounded transition-colors ${
    isActive ? 'bg-surface-2 text-ink font-semibold' : 'text-ink-subtle hover:text-ink'
  }`}
>
```

---

## 12. 화면 문구 · 데이터 · 인증

### 12.1 화면 문구

- 화면에 보이는 문구는 JSX에 바로 쓰지 않고 `data/mockData.ts`의 화면별 문구 객체에 둡니다. 컴포넌트에서는 짧은 별칭으로 가져옵니다. (`import { loginContent as c } ...`)
- 숫자·날짜를 넣는 문구는 템플릿 문자열이나 함수로 만듭니다.

### 12.2 mock 데이터와 API 연동

지금은 백엔드 API가 없어 `data/mockData.ts`를 씁니다. API를 연동할 때는 아래 규칙을 따릅니다.

- 컴포넌트·페이지는 데이터(질문 목록, 회원 정보 등)를 **hook으로만** 받습니다. mock에서 API로 바꿀 때 hook 안만 바꾸면 되도록, 새 코드는 컴포넌트에서 mock 데이터를 직접 import하지 않습니다. 화면 문구 객체는 컴포넌트에서 바로 import해도 됩니다.
- 요청·응답 형식, 에러 코드, 필드 이름은 [API 명세](../../backend/docs/API_SPEC.md)를 따릅니다. 화면 표시용 가공(`2,334`, `3일 전`)은 프론트엔드에서 합니다.
- API 호출 함수는 모듈별 `api/` 폴더(`apps/qna/api/questions.ts` 등)에 두고, 토큰 헤더·응답 `{ success, data }` 해제·`401` 처리는 `shared/`의 공통 함수에서 한 번만 처리합니다. (연동 시작할 때 이 문서에 구체적으로 추가)

### 12.3 인증

- 토큰은 직접 `localStorage`를 다루지 않고 `shared/auth.ts`의 함수만 씁니다.
- 로그인이 필요한 라우트는 `<RequireLogin>`으로 감쌉니다.
- 비회원이 작성·추천·신고 버튼을 누르는 경우는 `useLoginGate()`의 `requireLogin` / `guardLink`로 막습니다.

### 12.4 본문 에디터 (WYSIWYG)

질문·답변·게시글 본문과 소개글은 `shared/editor`의 Froala 에디터로 작성합니다. 값은 **HTML**입니다. (API_SPEC 1.9)

| 쓰는 것 | 용도 |
| --- | --- |
| `RichTextEditor` | 에디터. `preset="full"`(본문) / `"simple"`(소개글). Froala는 이 컴포넌트가 화면에 나올 때만 불러옵니다 |
| `useRichText(initial, maxLength)` | 본문 상태. `length`(순수 글자 수), `isEmpty`, `appendHtml`(양식 붙이기), `limitError` |
| `RichTextView` | 저장된 본문(HTML)을 보여 줄 때 |
| `richText.ts` | 글자 수 계산(`textLength`, `visibleTextLength`), 길이 상수, 일반 텍스트 → HTML(`textToHtml`) |

- 글자 수는 태그를 뺀 순수 글자로 셉니다. HTML 문자열 길이(`value.length`)로 검사하지 않습니다.
- 에디터의 글자 수 제한은 한글 입력(IME)을 막지 못하므로, 저장 전에 `limitError`를 꼭 확인합니다.
- 본문 양식·초기값처럼 에디터에 넣는 mock 데이터는 HTML 문자열로 둡니다.
- 본문 이미지는 `purpose=editor_image`로 올리는 **에디터 이미지**이고, 글 아래 첨부파일(`attachmentIds`, 최대 3개)과 따로 관리합니다. base64·외부 주소 이미지는 넣지 않습니다. 이미지가 필요 없는 짧은 글은 `allowImages={false}`로 끕니다.
- 에디터 HTML을 `dangerouslySetInnerHTML`로 직접 그리지 말고 `RichTextView`를 씁니다.
- Froala는 라이선스 키 없이 씁니다. 키를 쓰게 되면 `.env`의 `VITE_FROALA_KEY`로 넣고, 저장소에 커밋하지 않습니다.

### 12.5 주석

- 주석은 한국어로 **왜** 그렇게 했는지를 씁니다. 코드를 그대로 읽어 주는 주석은 쓰지 않습니다.
- export하는 함수·컴포넌트·상수에 설명이 필요하면 `/** */`로 씁니다.
- 명세에서 온 규칙에는 근거를 붙입니다. (예: `(API_SPEC 6장)`, `(REQ-QNA-005)`)

```ts
/** 서버와 같은 규칙: 확장자는 두고 앞부분만 남겨 15자로 줄인다 (API_SPEC 1.6) */
function shortenFileName(name: string): string { ... }
```


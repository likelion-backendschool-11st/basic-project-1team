# GAMERS (통합 프로젝트)

기존 4개 React 프로젝트(gamers-web / gamers-board / gamers-qna / gamers-admin)를 하나의 Vite 프로젝트로 통합.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## 구조 / URL

| URL                                   | 모듈                           | 소스             |
| ------------------------------------- | ------------------------------ | ---------------- |
| `/`, `/login`, `/signup`, `/mypage` … | 회원/계정 (기존 gamers-web)    | `src/apps/web`   |
| `/board/*`                            | 자유게시판 (기존 gamers-board) | `src/apps/board` |
| `/qna/*`                              | 질문/답변 (기존 gamers-qna)    | `src/apps/qna`   |
| `/admin/*`                            | 관리자 (기존 gamers-admin)     | `src/apps/admin` |

- `src/main.tsx` 가 URL prefix 로 모듈을 골라 lazy-load. 각 모듈은 자체 `BrowserRouter basename` 을 가지므로 모듈 내부 링크(`/members`, `/posts/1` …)는 그대로 동작.
- 모듈마다 Tailwind 디자인 토큰(`canvas`, `ink` 등)이 서로 다르기 때문에 각 모듈 `index.css` 가 `@config` 로 자기 `tailwind.config` 를 사용하고, 한 페이지에는 한 모듈 CSS 만 로드됨. **모듈 간 이동은 `<a href="/board">` 같은 일반 링크(전체 페이지 이동)로 할 것** (`<Link>` 로 다른 모듈 경로 이동 불가).
- `public/` : 기존 web/qna 의 정적 파일 병합.
- `docs/design/<모듈>` : 기존 각 프로젝트의 `.stitch` 디자인 자료.

배포 시 모든 경로를 `index.html` 로 fallback 하도록 서버 설정 필요 (SPA).

# GAMERS (통합 프로젝트)

기존 4개 React 프로젝트(gamers-web / gamers-board / gamers-qna / gamers-admin)를 하나의 Vite 프로젝트로 통합.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

### 에디터 라이선스

본문 에디터는 [Froala](https://froala.com/wysiwyg-editor/)를 라이선스 키 없이(무료) 씁니다. 나중에 키를 쓰게 되면 `frontend/.env`(커밋하지 않음)에 넣으면 적용됩니다.

```bash
VITE_FROALA_KEY=발급받은-키
```

## 구조 / URL

| URL                                   | 모듈                           | 소스                                      |
| ------------------------------------- | ------------------------------ | ----------------------------------------- |
| `/`, `/login`, `/signup`, `/mypage` … | 회원/계정 (기존 gamers-web)    | `src/apps/web` (진입점 `src/apps/site`)   |
| `/board/*`                            | 자유게시판 (기존 gamers-board) | `src/apps/board` (진입점 `src/apps/site`) |
| `/qna/*`                              | 질문/답변 (기존 gamers-qna)    | `src/apps/qna` (진입점 `src/apps/site`)   |
| `/admin/*`                            | 관리자 (기존 gamers-admin)     | `src/apps/admin`                          |

- `src/main.tsx` 가 URL prefix 로 모듈을 골라 lazy-load. `/admin` 을 뺀 사용자 화면(Q&A·자유게시판·회원)은 `src/apps/site` 하나로 묶여 라우터와 CSS 를 같이 쓰고(탭 이동 시 페이지를 새로 읽지 않음), 관리자만 따로 `BrowserRouter basename` 을 가짐.
- 디자인 토큰은 `src/theme/tokens.json` 하나를 모든 모듈이 함께 쓰고(Tailwind preset), 각 모듈 `index.css` 는 `@config` 로 자기 `tailwind.config.js`(preset + content + plugin)를 사용함. 한 페이지에는 한 모듈(site·admin) CSS 만 로드됨. 화면은 다크 테마만 사용.
- 사용자 화면은 `src/shared/layout/SiteLayout` (헤더·공지 롤링·푸터)을 site 라우터에서 한 번만 그림. 로그인·회원가입 같은 폼 화면도 같은 헤더 아래 카드로 보이고, 프로필 화면은 데스크톱에서 2단으로 보임.
- 사용자 화면끼리 이동은 `<Link>`(페이지를 새로 읽지 않음), 관리자 화면으로는 `<a href>`(전체 페이지 이동). 공통 화면에서는 `SiteLink` 사용.
- `public/` : 기존 web/qna 의 정적 파일 병합.
- `docs/design/<모듈>` : 기존 각 프로젝트의 `.stitch` 디자인 자료.

배포 시 모든 경로를 `index.html` 로 fallback 하도록 서버 설정 필요 (SPA).

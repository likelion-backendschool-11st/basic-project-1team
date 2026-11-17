# GAMERS (통합 프로젝트)

기존 4개 React 프로젝트(gamers-web / gamers-board / gamers-qna / gamers-admin)를 하나의 Vite 프로젝트로 통합.

```bash
npm install
npm run dev          # 사용자 사이트 http://localhost:5173
npm run dev:admin    # 관리자 사이트 http://localhost:5174/admin
npm run build        # 사용자 사이트 → dist/
npm run build:admin  # 관리자 사이트 → dist-admin/
```

관리자 사이트는 사용자 사이트와 **로그인을 공유하지 않습니다**(토큰 저장 키가 다름). 관리자 계정으로 관리자 사이트(`/admin/login`)에서 따로 로그인합니다. 배포에서는 같은 도메인의 `/admin`에 함께 올립니다([배포 가이드](../docs/05-deployment.md)). 두 사이트 모두 같은 백엔드(`localhost:3000`)를 씁니다.

### 사이트 주소 환경 변수

서로를 가리키는 링크에 쓰는 주소(도메인)입니다. 개발에서 비워 두면 위 개발 주소를, 배포에서 비워 두면 같은 도메인을 씁니다(관리자 사이트는 `/admin`). 바꾸려면 `.env.example`을 `.env.local`로 복사해서 고칩니다.

```bash
VITE_SITE_URL=http://localhost:5173        # 관리자 사이트 → 사용자 사이트 링크
VITE_ADMIN_SITE_URL=http://localhost:5174  # 사용자 사이트의 /admin 주소 → 관리자 사이트로 넘김
```

### 에디터

본문 에디터는 [TipTap](https://tiptap.dev/)(MIT 라이선스, 무료)을 씁니다. 라이선스 키나 환경 변수가 필요 없습니다.

## 구조 / URL

| URL                                   | 모듈                           | 소스                                      |
| ------------------------------------- | ------------------------------ | ----------------------------------------- |
| `/`, `/login`, `/signup`, `/mypage` … | 회원/계정 (기존 gamers-web)    | `src/apps/web` (진입점 `src/apps/site`)   |
| `/board/*`                            | 자유게시판 (기존 gamers-board) | `src/apps/board` (진입점 `src/apps/site`) |
| `/qna/*`                              | 질문/답변 (기존 gamers-qna)    | `src/apps/qna` (진입점 `src/apps/site`)   |
| `/admin/*` (관리자 사이트)            | 관리자 (기존 gamers-admin)     | `src/apps/admin` (진입점 `src/admin-main.tsx`) |

- **사이트가 두 개입니다.** 사용자 사이트(`index.html` → `src/main.tsx`)와 관리자 사이트(`admin.html` → `src/admin-main.tsx`, 설정 `vite.admin.config.ts`)를 따로 실행·빌드합니다. 공통 코드(`src/shared`)는 함께 씁니다.
- 사용자 화면(Q&A·자유게시판·회원)은 `src/apps/site` 하나로 묶여 라우터와 CSS 를 같이 씀(탭 이동 시 페이지를 새로 읽지 않음). 사용자 사이트에서 `/admin` 주소로 들어오면 관리자 사이트의 같은 경로로 넘김.
- 관리자 사이트는 `BrowserRouter basename="/admin"` 이고, 그 밖의 주소(`/`, `/login`)는 `/admin` 을 붙여 넘김.
- 디자인 토큰은 `src/theme/tokens.json` 하나를 모든 모듈이 함께 쓰고(Tailwind preset), 각 모듈 `index.css` 는 `@config` 로 자기 `tailwind.config.js`(preset + content + plugin)를 사용함. 한 페이지에는 한 모듈(site·admin) CSS 만 로드됨. 화면은 다크 테마만 사용.
- 사용자 화면은 `src/shared/layout/SiteLayout` (헤더·공지 롤링·푸터)을 site 라우터에서 한 번만 그림. 로그인·회원가입 같은 폼 화면도 같은 헤더 아래 카드로 보이고, 프로필 화면은 데스크톱에서 2단으로 보임.
- 사용자 화면끼리 이동은 `<Link>`(페이지를 새로 읽지 않음). 관리자 사이트 ↔ 사용자 사이트는 전체 주소 링크(`VITE_SITE_URL`, `VITE_ADMIN_SITE_URL`). 공통 화면에서는 `SiteLink` 사용.
- `public/` : 기존 web/qna 의 정적 파일 병합.
- `docs/design/<모듈>` : 기존 각 프로젝트의 `.stitch` 디자인 자료.

배포(`npm run build:vercel`)는 관리자 사이트를 사용자 사이트 빌드에 합치고, `vercel.json`이 `/admin/*` 는 `admin.html`, 나머지는 `index.html` 로 보낸다 (SPA).

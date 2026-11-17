# 배포 가이드

GAMERS 운영 환경의 구성, 처음 배포하는 방법, 평소 배포 흐름, 운영 DB 변경, 장애 대응을 정리합니다.
로컬 실행은 [README](../README.md#로컬에서-실행하기)를 봅니다.

## 목차

- [1. 구성](#1-구성)
- [2. 배포 흐름](#2-배포-흐름)
- [3. 처음 배포하기](#3-처음-배포하기)
- [4. 환경 변수](#4-환경-변수)
- [5. 운영 DB](#5-운영-db)
- [6. 서버리스에서 바뀌는 동작](#6-서버리스에서-바뀌는-동작)
- [7. 배포 후 확인](#7-배포-후-확인)
- [8. 되돌리기](#8-되돌리기)
- [9. 문제 해결](#9-문제-해결)
- [10. 알려진 제약](#10-알려진-제약)

---

## 1. 구성

```
브라우저
  │
  ├─ 사용자 사이트 (Vercel, frontend/ → dist)
  │     └─ /api/*, /uploads/*  ──rewrite──┐
  ├─ 관리자 사이트 (Vercel, frontend/ → dist-admin)
  │     └─ /api/*  ──rewrite──────────────┤
  │                                       ▼
  │                         백엔드 (Vercel 함수, backend/api/index.js)
  │                           ├─ 운영 DB: TiDB Cloud Starter (MySQL 호환)
  │                           └─ 업로드 파일: Vercel Blob
  └─ 업로드 이미지는 Blob 주소로 바로 내려받음
```

| 구성 요소 | 서비스 | 프로젝트 / 위치 | 주소 |
| --- | --- | --- | --- |
| 사용자 사이트 | Vercel | `basic-project-1team-3di3` (Root `frontend`) | https://basic-project-1team-3di3.vercel.app |
| 관리자 사이트 | Vercel | 만들 예정 (Root `frontend`) | |
| 백엔드 API | Vercel 함수 | `basic-project-1team` (Root `backend`) | https://basic-project-1team.vercel.app |
| 운영 DB | TiDB Cloud Starter (무료) | 리전 `ap-northeast-1`(도쿄), DB `gamers_db` | 접속 정보는 TiDB 콘솔 Connect |
| 업로드 파일 | Vercel Blob | 백엔드 프로젝트 Storage에 연결 | `*.blob.vercel-storage.com` |

- 사용자 사이트와 관리자 사이트는 로그인 토큰을 공유하지 않도록 **도메인이 다른 프로젝트**로 나눕니다.
- 화면은 `/api` 요청을 자기 도메인으로 보내고 Vercel rewrite가 백엔드로 넘깁니다. 브라우저 입장에서는 같은 도메인이라 **CORS 설정이 필요 없습니다.**
- 모두 무료 플랜(Vercel Hobby, TiDB Starter, Blob 무료 한도) 안에서 동작하도록 맞췄습니다. 제약은 [10장](#10-알려진-제약)을 봅니다.

## 2. 배포 흐름

[Git 컨벤션](GIT_CONVENTION.md)대로 `main`은 배포용 브랜치이고, **`main`에 머지되면 Vercel이 세 프로젝트를 자동으로 다시 배포**합니다.

```
feature/*, fix/*  ──PR──▶  develop  ──release PR──▶  main  ──자동──▶  Vercel 배포
```

1. 작업 브랜치에서 `develop`으로 PR을 올리고 리뷰 후 머지합니다.
2. 배포할 때 `develop` → `main` PR을 만듭니다. 제목은 `release: develop → main (변경 요약)`, 본문에 포함된 PR 번호를 적습니다.
3. `main`에 머지되면 Vercel이 빌드·배포합니다. 진행 상황은 각 프로젝트의 **Deployments** 탭에서 봅니다.
4. 운영 DB 변경(마이그레이션)이 있으면 **배포 전에** 운영 DB에 먼저 적용합니다([5.4](#54-운영-db-변경-마이그레이션)).
5. [7장](#7-배포-후-확인)대로 확인합니다.

- 다른 브랜치나 PR에 push하면 Vercel이 **Preview 배포**를 만듭니다. Preview도 같은 운영 DB를 쓰므로 데이터를 지우거나 바꾸는 확인은 하지 않습니다.
- 환경 변수만 바꾼 경우에는 코드 변경이 없어도 **Redeploy**해야 반영됩니다.

## 3. 처음 배포하기

새 계정이나 새 환경에 처음부터 올릴 때의 순서입니다. 지금 운영 환경은 이미 끝난 상태입니다.

### 3.1 운영 DB 만들기 (TiDB Cloud)

1. TiDB Cloud에서 **Starter** 인스턴스를 만듭니다. 리전은 백엔드(Vercel `icn1`, 서울)와 가까운 `ap-northeast-1`(도쿄)을 고릅니다.
2. Connection Type은 **Public**을 고릅니다. Vercel 함수는 고정 IP가 없어 IP 허용 목록을 쓸 수 없으므로 모든 IP를 허용하고, TLS 접속과 강한 비밀번호로 막습니다.
3. Connect 화면에서 root 비밀번호를 만들어 `backend/.env.production`(커밋하지 않음)에 둡니다.
4. root로 접속해 아래를 실행합니다.

```sql
-- CHECK 제약 검사 켜기 (TiDB는 기본 꺼짐)
SET GLOBAL tidb_enable_check_constraint = ON;

CREATE DATABASE gamers_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
USE gamers_db;
SET NAMES utf8mb4 COLLATE utf8mb4_0900_bin;
SET time_zone = '+00:00';
-- 이어서 db/schema.sql 실행 (테이블 25개)
-- 시연용 데이터가 필요하면 seed.sql → seed-points.sql → seed-notifications.sql → seed-rankings.sql → seed-main-games.sql 순서로 실행

-- 앱 전용 계정 (이름 앞부분은 root 계정과 같은 접두어)
CREATE USER '<접두어>.gamers'@'%' IDENTIFIED BY '<긴 임의 비밀번호>';
GRANT ALL PRIVILEGES ON gamers_db.* TO '<접두어>.gamers'@'%';
```

- **CHECK 제약을 켠 다음에 스키마를 실행**해야 합니다. 꺼진 채로 만든 제약은 검사되지 않습니다.
- 시드 계정의 비밀번호(`gamers12!`)는 README에 공개돼 있습니다. 외부에 공개하기 전에 `seed_admin` 비밀번호를 바꾸거나 시드 없이 만듭니다.

### 3.2 백엔드 프로젝트

1. Vercel에서 저장소를 가져와 프로젝트를 만들고 **Root Directory를 `backend`** 로 지정합니다. 빌드 설정은 비워 둡니다(`backend/vercel.json`이 정함).
2. **Storage** 탭에서 Blob 저장소를 만들어 이 프로젝트에 연결합니다. `BLOB_READ_WRITE_TOKEN`이 자동으로 들어갑니다.
3. [4.1](#41-백엔드)의 환경 변수를 넣고 배포합니다.
4. `https://<백엔드 도메인>/health`가 `200`인지 봅니다.

`backend/vercel.json`이 하는 일:

| 설정 | 내용 |
| --- | --- |
| `framework: null` | Express 자동 감지 대신 `api/` 폴더의 함수로 배포 |
| `rewrites` | 모든 요청을 `api/index.js` 함수 하나로 보냄 |
| `crons` | 매일 18:00 UTC(03:00 KST)에 `/cron/daily` 호출 |

### 3.3 프론트엔드 프로젝트 (사용자·관리자 각각)

1. `frontend/vercel.json`의 rewrite 대상(`https://basic-project-1team.vercel.app`)이 백엔드 도메인과 같은지 확인합니다. 다르면 고쳐서 커밋합니다.
2. 같은 저장소로 프로젝트를 두 개 만들고 아래처럼 설정합니다.

| Vercel 설정 | 사용자 사이트 | 관리자 사이트 |
| --- | --- | --- |
| Root Directory | `frontend` | `frontend` |
| Framework Preset | Vite | Vite |
| Build Command | `npm run build:vercel` | `npm run build:vercel:admin` |
| Output Directory | `dist` | `dist-admin` |
| 환경 변수 | `VITE_ADMIN_SITE_URL` | `VITE_SITE_URL` |

`frontend/vercel.json`이 하는 일:

- `/api/*`, `/uploads/*` → 백엔드 도메인으로 rewrite
- `/admin`, `/admin/*` → `admin.html`, 그 밖의 모든 주소 → `index.html` (새로고침해도 화면이 열림)
- 두 프로젝트가 같은 파일을 쓰므로, 빌드 스크립트가 상대 사이트의 진입 파일을 복사해 둡니다. 사용자 사이트에서 `/admin`으로 들어오면 관리자 사이트로, 관리자 사이트 첫 화면 `/`은 `/admin`으로 넘어갑니다.

## 4. 환경 변수

값은 각 Vercel 프로젝트의 **Settings → Environment Variables**에 넣고, 적용 환경에 **Production**(필요하면 Preview도)을 체크합니다. **따옴표 없이** 값만 넣습니다. 비밀값은 저장소·채팅에 올리지 않습니다.

### 4.1 백엔드

| 변수 | 필수 | 값 | 설명 |
| --- | --- | --- | --- |
| `DB_HOST` | ✅ | TiDB Connect의 Host | 예: `gateway01.ap-northeast-1.prod.aws.tidbcloud.com` |
| `DB_PORT` | ✅ | `4000` | TiDB 포트 |
| `DB_NAME` | ✅ | `gamers_db` | |
| `DB_USER` | ✅ | `<접두어>.gamers` | root가 아닌 앱 전용 계정 |
| `DB_PASSWORD` | ✅ | 앱 계정 비밀번호 | |
| `DB_SSL` | ✅ | `true` | TiDB는 TLS가 아니면 접속을 거부 |
| `DB_CONNECTION_LIMIT` | 권장 | `3`~`4` | 함수 인스턴스마다 풀을 만들므로 작게 |
| `JWT_SECRET` | ✅ | 긴 임의 문자열 | 바꾸면 모든 로그인이 풀림 |
| `CRON_SECRET` | ✅ | 긴 임의 문자열 | Vercel Cron이 `Authorization: Bearer`로 보냄 |
| `TRUST_PROXY` | ✅ | `true` | 회원 IP를 `X-Forwarded-For`에서 읽음 (비회원 조회수 중복 방지, 로그인 IP) |
| `BLOB_READ_WRITE_TOKEN` | ✅ | 자동 | Blob 저장소를 연결하면 들어감. 없으면 업로드 실패 |
| `RANKING_INTERVAL_MINUTES` | | `10` | 순위 다시 계산 주기(분) |
| `DB_SSL_CA` | | PEM 내용 | 기본 인증서로 확인되지 않는 DB일 때만 |

- `NODE_ENV`는 Vercel이 `production`으로 넣습니다. 이때는 테스트 데이터 자동 입력이 꺼집니다.
- `UPLOAD_DIR`, `UPLOAD_PUBLIC_BASE_URL`은 Blob을 쓰면 쓰이지 않습니다.
- 비밀값 만들기: `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`

### 4.2 프론트엔드

| 변수 | 프로젝트 | 값 |
| --- | --- | --- |
| `VITE_ADMIN_SITE_URL` | 사용자 사이트 | 관리자 사이트 주소 (사용자 사이트의 `/admin`을 이리로 넘김) |
| `VITE_SITE_URL` | 관리자 사이트 | 사용자 사이트 주소 ("사이트로 이동" 링크) |

`VITE_` 변수는 **빌드할 때** 코드에 들어가므로, 바꾸면 다시 배포해야 합니다. 에디터(TipTap)는 라이선스 키가 필요 없습니다.

## 5. 운영 DB

### 5.1 TiDB 호환을 위해 정한 규칙

운영 DB는 MySQL 호환인 TiDB라, 로컬 MySQL에서만 되는 문법은 운영에서 500 오류가 납니다. 코드와 스키마는 아래 규칙을 지킵니다.

| 규칙 | 이유 |
| --- | --- |
| 정렬 규칙은 `utf8mb4_0900_bin` | TiDB에 `utf8mb4_0900_as_cs`가 없음. 대소문자·끝 공백 구분은 같음 |
| 잠금 읽기는 `FOR UPDATE`만 | `FOR SHARE` / `LOCK IN SHARE MODE`(공유 잠금)를 TiDB가 지원하지 않음 |
| `FOR UPDATE OF <별칭>` 쓰지 않기 | TiDB가 지원하지 않음. 잠글 행만 따로 `FOR UPDATE`로 읽고 나머지는 별도 쿼리로 읽음 |
| `INTERVAL (식) DAY` 대신 `TIMESTAMPADD(DAY, 식, …)` | TiDB가 괄호 식을 `INTERVAL()` 함수로 읽음 |
| 모든 `CREATE TABLE`에 `/*T![auto_id_cache] AUTO_ID_CACHE = 1 */` | 없으면 인스턴스마다 번호를 3만 개씩 미리 가져 `id`가 크게 건너뜀. MySQL은 주석으로 무시. **만든 뒤에는 바꿀 수 없음** |
| CHECK 제약은 `tidb_enable_check_constraint = ON`에서 만들기 | TiDB는 기본으로 CHECK를 검사하지 않음 |

새 쿼리를 추가하면 운영 TiDB에서도 확인합니다. 롤백 트랜잭션으로 운영 DB에 붙여 API를 호출해 보면 데이터를 남기지 않고 확인할 수 있습니다.

### 5.2 접속

- 로컬에서 운영 DB에 붙을 때는 `backend/.env.production`(커밋하지 않음)의 값을 씁니다. 평소 작업에는 **앱 계정**을 쓰고, root는 계정·전역 설정을 바꿀 때만 씁니다.
- TLS 필수입니다. `mysql` 클라이언트는 `--ssl-mode=VERIFY_IDENTITY`, Node(mysql2)는 `ssl: {}`로 접속합니다.

### 5.3 백업

TiDB Starter는 자동 백업을 제공하지만 무료 플랜의 보관 기간·복구 범위는 콘솔에서 확인합니다. DB를 다시 만들거나 큰 변경을 하기 전에는 **직접 백업**해 둡니다(테이블별 `SELECT *` 결과를 JSON으로 저장하거나 TiDB 콘솔의 Export). 백업 파일은 저장소에 커밋하지 않습니다.

### 5.4 운영 DB 변경 (마이그레이션)

1. `db/migrations/YYYYMMDD_내용.sql`과 `db/schema.sql`을 함께 고칩니다. 새 테이블에는 5.1의 `AUTO_ID_CACHE` 옵션을 붙입니다.
2. 로컬 MySQL에 적용해 확인합니다.
3. 운영 TiDB에 같은 마이그레이션을 **앱이 새 컬럼을 쓰기 전에** 적용합니다. 컬럼 추가처럼 기존 코드와 함께 동작하는 변경을 먼저 적용하고, 그다음 코드를 `main`에 머지합니다.
4. 되돌리기 어려운 변경(컬럼 삭제, 테이블 다시 만들기)은 먼저 백업합니다.

## 6. 서버리스에서 바뀌는 동작

로컬·일반 서버는 `src/server.js`(계속 켜져 있는 Express)로 돌고, Vercel은 `api/index.js`(요청마다 실행되는 함수)로 돕니다. 계속 도는 타이머와 저장 디스크가 없어서 다음처럼 나눴습니다.

| 기능 | 로컬 (`src/server.js`) | Vercel (`api/index.js`) |
| --- | --- | --- |
| 순위 계산 (Grandmaster·Challenger) | 10분마다 타이머 | 요청이 올 때 마지막 계산이 주기보다 오래됐으면 다시 계산 |
| 미연결 첨부·재설정 토큰 정리 | 1시간마다 | Vercel Cron 하루 1번 (`/cron/daily`) |
| 활동 로그 만료 | 하루마다 | Vercel Cron 하루 1번 (`/cron/daily`) |
| 업로드 파일 | `backend/uploads/` 디스크 | Vercel Blob (`BLOB_READ_WRITE_TOKEN`) |
| 테스트 데이터 자동 입력 | `NODE_ENV=development`일 때 | 하지 않음 |
| 회원 IP | 직접 연결 IP | `TRUST_PROXY=true`로 `X-Forwarded-For` |

## 7. 배포 후 확인

데이터를 만들지 않는 요청으로 확인합니다.

| 확인 | 요청 | 기대 |
| --- | --- | --- |
| 백엔드 실행 | `GET https://<백엔드>/health` | `200` |
| DB 연결 | `GET https://<사용자 사이트>/api/questions?size=1` | `200`, 목록 |
| 화면 rewrite | `GET https://<사용자 사이트>/qna/questions` 새로고침 | 화면이 열림 |
| 쓰기 경로(잠금 쿼리) | 로그인 후 `POST /api/questions/99999999/answers` | `404 QUESTION_NOT_FOUND` (500이면 DB 문법 문제) |
| Cron 보호 | `GET https://<백엔드>/cron/daily` (비밀값 없이) | `401` |
| 에디터 | 글쓰기 화면 | 라이선스 경고 없이 툴바 표시 |

업로드는 실제 파일을 올려 봐야 하므로 필요할 때만 확인합니다.

## 8. 되돌리기

- **코드**: Vercel 프로젝트의 **Deployments**에서 이전 배포의 `⋯` → **Instant Rollback**(또는 Promote to Production)으로 바로 되돌립니다. Hobby 플랜은 바로 이전 운영 배포로만 되돌릴 수 있을 수 있으니, 그보다 오래된 배포가 필요하면 `main`에서 되돌리는 커밋으로 다시 배포합니다. 되돌린 뒤에는 `main`에서 문제 커밋을 되돌리는 PR을 올립니다.
- **DB**: 코드만 되돌려도 되는 변경(컬럼 추가 등)은 그대로 둡니다. 데이터가 바뀐 경우에는 5.3의 백업으로 복구합니다.
- 세 프로젝트는 따로 배포되므로, 함께 바뀐 경우에는 프론트엔드와 백엔드를 같은 시점으로 함께 되돌립니다.

## 9. 문제 해결

로그는 Vercel 프로젝트의 **Logs** 탭(또는 Deployments → 배포 → Runtime Logs)에서 봅니다. 서버는 오류 응답에 원인을 담지 않으므로(`서버 오류가 발생했습니다.`) 로그에서 바로 앞 줄을 찾습니다.

| 증상 | 로그 | 원인 / 해결 |
| --- | --- | --- |
| 모든 요청 500 `FUNCTION_INVOCATION_FAILED` (`/health` 포함) | `환경 변수 …가 설정되지 않았습니다.` | 필수 환경 변수 누락. 이름·Production 체크 확인 후 Redeploy |
| 위와 같음 | `ERR_REQUIRE_ESM … htmlparser2` | Vercel 런타임이 `require(esm)`을 지원하지 않음. `backend/package.json`의 `overrides`(htmlparser2 10.1.0)를 지우지 않음 |
| DB를 쓰는 API만 500 | `insecure transport are prohibited` | `DB_SSL=true` 누락 |
| 위와 같음 | `Access denied` | 사용자·비밀번호 오류. 값에 따옴표가 들어가지 않았는지, root가 아닌 앱 계정 비밀번호인지 확인 |
| 특정 쓰기 API만 500 | `LOCK IN SHARE MODE has only noop implementation` / `Table '….a' doesn't exist` | TiDB가 지원하지 않는 잠금 문법. [5.1](#51-tidb-호환을-위해-정한-규칙) 규칙대로 고침 |
| 이미지 업로드 500 | `BLOB_READ_WRITE_TOKEN이 없어…` 또는 `ENOENT … mkdir '/var/task/backend/uploads'` | Blob 저장소 미연결. Storage에서 연결 후 Redeploy |
| 이미지 업로드 413 | | Vercel 함수 요청 본문 한도(4.5MB) 초과 |
| 화면 새로고침 404 | | 프론트엔드 프로젝트의 Root Directory·Output Directory 확인 (`frontend/vercel.json`이 적용되는지) |
| 에디터 라이선스 경고 | | 이전 Froala 빌드가 배포된 상태. 최신 `main`으로 다시 배포 |
| `Too many connections` | | `DB_CONNECTION_LIMIT`을 줄임 |

## 10. 알려진 제약

| 제약 | 영향 | 바꾸려면 |
| --- | --- | --- |
| Vercel 함수 요청 본문 최대 4.5MB | 명세의 업로드 최대 10MB(API_SPEC 1.6, 6장) 중 4.5MB를 넘는 파일은 올라가지 않음 | 명세를 4MB로 낮추거나, 브라우저가 Blob에 바로 올리는 방식으로 변경 |
| Vercel Hobby Cron은 하루 1번 | 미연결 첨부·재설정 토큰 정리가 1시간이 아니라 하루 주기 | Pro 플랜으로 Cron 주기 단축 |
| 순위는 요청이 있어야 다시 계산 | 접속이 없으면 순위가 갱신되지 않음 (다음 요청 때 계산) | Cron에 순위 계산 추가 |
| TiDB Starter 무료 한도 (월 요청 단위·저장 용량) | 넘으면 과금 없이 속도가 느려지고 다음 달 초기화 | 콘솔에서 사용량 확인, 필요하면 지출 한도 설정 |
| 운영·Preview가 같은 DB | Preview 배포에서 쓴 데이터가 운영에 남음 | Preview용 DB를 따로 만들고 Preview 환경 변수로 연결 |

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BACKEND_ROOT = fileURLToPath(new URL('../../', import.meta.url));

const requireEnv = (key) => {
  const value = process.env[key];

  if (value === undefined) {
    throw new Error(`환경 변수 ${key}가 설정되지 않았습니다.`);
  }

  return value;
};

const port = Number(process.env.PORT ?? 3000);

// 프록시(Vercel rewrite, 호스팅 로드밸런서) 뒤에서 회원 IP(req.ip)를 X-Forwarded-For에서 읽을지 (Express trust proxy).
// 비우거나 false면 읽지 않는다(로컬). true, 앞에 있는 프록시 수(예: 2), 믿을 프록시 IP·서브넷 목록을 받는다
const readTrustProxy = (value) => {
  if (value === undefined || value === '' || value === 'false') {
    return false;
  }

  if (value === 'true') {
    return true;
  }

  return /^\d+$/.test(value) ? Number(value) : value;
};

export const env = {
  port,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  // 개발 환경에서 서버가 뜰 때 db/seed.sql 테스트 데이터를 넣을지. DB_SEED=false 면 넣지 않는다
  devSeed:
    (process.env.NODE_ENV ?? 'development') === 'development' && process.env.DB_SEED !== 'false',
  db: {
    host: requireEnv('DB_HOST'),
    port: Number(process.env.DB_PORT ?? 3306),
    name: requireEnv('DB_NAME'),
    user: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
    // 클라우드 DB는 TLS 접속을 요구한다. DB_SSL_CA(PEM 내용)가 있으면 그 인증서로, DB_SSL=true면 기본 인증서로 확인한다
    ssl: process.env.DB_SSL_CA
      ? { ca: process.env.DB_SSL_CA.replace(/\\n/g, '\n') }
      : process.env.DB_SSL === 'true'
        ? {}
        : undefined,
    // 서버리스(Vercel)는 함수 인스턴스마다 풀을 따로 만들므로 작게 둔다
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT ?? 10),
  },
  // Grandmaster·Challenger 순위를 다시 계산하는 주기(분). 기본 10분 (API 명세 11.2). 테스트할 때 줄인다
  rankingIntervalMinutes: Number(process.env.RANKING_INTERVAL_MINUTES ?? 10),
  trustProxy: readTrustProxy(process.env.TRUST_PROXY),
  // Vercel Cron이 정리 작업을 부를 때 보내는 비밀값 (api/index.js)
  cronSecret: process.env.CRON_SECRET,
  jwt: {
    // Access Token 서명 비밀키 (API 명세 1.2, HS256)
    secret: requireEnv('JWT_SECRET'),
  },
  upload: {
    // 업로드 파일을 저장할 폴더. 상대 경로면 backend/ 기준
    dir: path.resolve(BACKEND_ROOT, process.env.UPLOAD_DIR ?? 'uploads'),
    // 저장한 파일 URL의 앞부분. DB에는 이 URL을 그대로 저장한다 (API 명세 1.6)
    publicBaseUrl: (
      process.env.UPLOAD_PUBLIC_BASE_URL ?? `http://localhost:${port}/uploads`
    ).replace(/\/+$/, ''),
    // 있으면 서버 디스크 대신 Vercel Blob에 저장한다 (Vercel 함수는 디스크에 저장할 수 없다)
    blobToken: process.env.BLOB_READ_WRITE_TOKEN,
  },
};

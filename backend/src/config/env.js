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
  },
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
  },
};

const requireEnv = (key) => {
  const value = process.env[key];

  if (value === undefined || value === '') {
    throw new Error(`환경 변수 ${key}가 설정되지 않았습니다.`);
  }

  return value;
};

export const env = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
    database: requireEnv('DB_NAME'),
  },
  jwtSecret: requireEnv('JWT_SECRET'),
};

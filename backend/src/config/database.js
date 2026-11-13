import mysql from 'mysql2/promise';

import { env } from './env.js';

export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
  charset: 'utf8mb4_0900_as_cs',
  // DB는 시각을 UTC로 저장하므로 JS Date 변환도 UTC로 맞춘다 (docs/04-db-design.md 1장)
  timezone: 'Z',
  connectionLimit: 10,
});

// CURRENT_TIMESTAMP 기본값도 UTC가 되도록 연결마다 세션 시간대를 맞춘다 (db/schema.sql 머리말)
pool.on('connection', (connection) => {
  connection.query("SET time_zone = '+00:00'");
});

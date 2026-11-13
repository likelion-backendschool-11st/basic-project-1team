import mysql from 'mysql2/promise';

import { env } from './env.js';

export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
  // 접속 핸드셰이크는 정렬 규칙 번호를 1바이트로 보내 utf8mb4_0900_as_cs(278)를 지정할 수 없다.
  // 문자셋만 지정하고 정렬 규칙은 연결 후 SET NAMES로 맞춘다
  charset: 'utf8mb4',
  // DB는 시각을 UTC로 저장하므로 JS Date 변환도 UTC로 맞춘다 (docs/04-db-design.md 1장)
  timezone: 'Z',
  connectionLimit: 10,
});

// 대소문자를 구분하는 정렬 규칙과, CURRENT_TIMESTAMP 기본값도 UTC가 되도록 하는 세션 시간대를
// 연결마다 맞춘다 (docs/04-db-design.md 1장, db/schema.sql 머리말)
pool.on('connection', (connection) => {
  connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_0900_as_cs');
  connection.query("SET time_zone = '+00:00'");
});

/**
 * 콜백 안의 쿼리를 한 트랜잭션으로 실행한다. 콜백에는 같은 connection 을 넘긴다.
 * 에러가 나면 rollback 하고 에러를 그대로 던진다.
 */
export const withTransaction = async (callback) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

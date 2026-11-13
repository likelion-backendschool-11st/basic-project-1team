import mysql from 'mysql2/promise';

import { env } from './env.js';

export const pool = mysql.createPool({
  ...env.db,
  charset: 'utf8mb4_0900_as_cs',
  // DB 에는 UTC 로 저장한다 (docs/04-db-design.md 1장). DATETIME 을 UTC 로 읽고 쓴다
  timezone: 'Z',
  connectionLimit: 10,
});

// 컬럼 기본값 CURRENT_TIMESTAMP(3), NOW(3) 도 UTC 가 되도록 세션 시간대를 맞춘다
pool.pool.on('connection', (connection) => {
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

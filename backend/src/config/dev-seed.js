import { readFile } from 'node:fs/promises';

import mysql from 'mysql2/promise';

import { logger } from '../common/utils/logger.js';

import { env } from './env.js';

// 로컬 개발용 테스트 데이터 (저장소 루트의 db/). 비밀번호는 모두 gamers12!
const SEED_MARKER_USERNAME = 'seed_admin';

// 차례대로 넣는다. isLoadedSql 결과가 있으면 이미 넣은 것으로 보고 건너뛴다
const SEED_FILES = [
  {
    file: new URL('../../../db/seed.sql', import.meta.url),
    isLoadedSql: `SELECT 1 FROM users WHERE username = '${SEED_MARKER_USERNAME}'`,
  },
  // 포인트·등급 (API 명세 11장). seed.sql을 이미 넣은 로컬 DB에도 한 번 넣는다
  {
    file: new URL('../../../db/seed-points.sql', import.meta.url),
    isLoadedSql: `SELECT 1 FROM point_histories h
                  JOIN users u ON u.id = h.user_id
                  WHERE u.username LIKE 'seed\\_%'
                  LIMIT 1`,
  },
  // 알림 (API 명세 12장). seed.sql을 이미 넣은 로컬 DB에도 한 번 넣는다
  {
    file: new URL('../../../db/seed-notifications.sql', import.meta.url),
    isLoadedSql: `SELECT 1 FROM notifications n
                  JOIN users u ON u.id = n.user_id
                  WHERE u.username LIKE 'seed\\_%'
                  LIMIT 1`,
  }, // 순위 등급 테스트용 Master 레벨 회원 330명 (API 명세 11.2)
  {
    file: new URL('../../../db/seed-rankings.sql', import.meta.url),
    isLoadedSql: "SELECT 1 FROM users WHERE username = 'seed_rank_001'",
  },
];

const loadSeedFile = async (connection, { file, isLoadedSql }) => {
  const [rows] = await connection.query(isLoadedSql);

  if (rows.length > 0) {
    return false;
  }

  const sql = await readFile(file, 'utf8');

  await connection.beginTransaction();

  try {
    await connection.query(sql);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  }

  return true;
};

// 개발 환경에서 서버가 뜰 때 테스트 데이터를 한 번 넣는다. 실패해도 서버는 그대로 띄우고 기록만 남긴다
export const seedDevelopmentData = async () => {
  // seed.sql은 여러 문장이라 multipleStatements를 켠 연결을 따로 쓴다 (앱의 pool은 끈 상태로 둔다)
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    database: env.db.name,
    user: env.db.user,
    password: env.db.password,
    charset: 'utf8mb4',
    multipleStatements: true,
  });

  try {
    let isLoaded = false;

    for (const seed of SEED_FILES) {
      isLoaded = (await loadSeedFile(connection, seed)) || isLoaded;
    }

    if (isLoaded) {
      logger.info(
        `[dev-seed] 테스트 데이터를 넣었습니다. 관리자 ${SEED_MARKER_USERNAME} / 비밀번호 gamers12!`,
      );
    }
  } catch (error) {
    logger.error('[dev-seed] 테스트 데이터를 넣지 못했습니다.', error);
  } finally {
    await connection.end();
  }
};

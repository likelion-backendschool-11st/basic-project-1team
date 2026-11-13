import { logger } from './logger.js';

// 서버 안에서 주기적으로 도는 정리 작업. 서버가 뜰 때 한 번 돌고 이후 intervalMs마다 돈다.
// 이전 실행이 끝나지 않았으면 이번 차례는 건너뛰고, 실패해도 기록만 남기고 다음 차례에 다시 돈다.
// 돌려준 함수를 부르면 멈춘다 (서버 종료 시)
export const startPeriodicJob = (name, intervalMs, run) => {
  let running = false;

  const tick = async () => {
    if (running) {
      return;
    }

    running = true;

    try {
      await run();
    } catch (error) {
      logger.error(`[${name}] 실패`, error);
    } finally {
      running = false;
    }
  };

  void tick();
  // 타이머 때문에 프로세스가 끝나지 않는 일이 없게 한다
  const timer = setInterval(() => void tick(), intervalMs).unref();

  return () => clearInterval(timer);
};

import { useEffect, useState } from 'react';
import { getQuestionStats } from '../api/questions';
import type { QuestionStats } from '../data/types';

/** 질문 목록 하단 커뮤니티 통계. 불러오기 전이나 실패하면 null 이고 화면은 '-' 로 보여 준다 */
export function useCommunityStats(): QuestionStats | null {
  const [stats, setStats] = useState<QuestionStats | null>(null);

  useEffect(() => {
    let ignore = false;
    getQuestionStats()
      .then((next) => {
        if (!ignore) setStats(next);
      })
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, []);

  return stats;
}

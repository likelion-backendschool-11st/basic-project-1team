import { useEffect, useState } from 'react';
import { getErrorMessage } from '../../../shared/api';
import { cancelAnswerVote, voteAnswer } from '../api/answers';
import type { Answer, VoteResult } from '../data/types';

/**
 * 답변 추천 토글 (API_SPEC 4장, REQ-QNA-013). 누를 때마다 추천/취소가 바뀐다.
 * 서버가 돌려준 추천 수·상태를 쓰고, 답변 목록을 다시 불러오면 그 값으로 돌아간다.
 */
export function useVote(answer: Answer) {
  const [result, setResult] = useState<VoteResult | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => setResult(null), [answer]);

  const voted = result?.isVoted ?? answer.isVoted;

  const toggle = async () => {
    if (pending) return;
    setPending(true);
    try {
      setResult(voted ? await cancelAnswerVote(answer.id) : await voteAnswer(answer.id));
    } catch (error) {
      window.alert(getErrorMessage(error));
    } finally {
      setPending(false);
    }
  };

  return { voted, count: result?.voteCount ?? answer.voteCount, pending, toggle };
}

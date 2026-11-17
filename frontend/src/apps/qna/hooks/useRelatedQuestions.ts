import { useEffect, useState } from 'react';
import { getRelatedQuestions } from '../api/questions';
import type { RelatedQuestion } from '../data/types';

/** 질문 상세 사이드바 "관련된 유사 질문" (REQ-QNA-018). 불러오지 못하면 빈 목록 */
export function useRelatedQuestions(questionId: string): readonly RelatedQuestion[] {
  const [items, setItems] = useState<readonly RelatedQuestion[]>([]);

  useEffect(() => {
    let ignore = false;
    getRelatedQuestions(questionId)
      .then((next) => {
        if (!ignore) setItems(next);
      })
      .catch(() => {
        if (!ignore) setItems([]);
      });
    return () => {
      ignore = true;
    };
  }, [questionId]);

  return items;
}

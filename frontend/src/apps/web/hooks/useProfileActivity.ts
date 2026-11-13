import { useEffect, useState } from 'react';
import { getErrorMessage } from '../../../shared/api';
import { getPostsByAuthor, getQuestionsByAuthor } from '../api/profileActivity';
import type { AuthoredAnswer, AuthoredPost, AuthoredQuestion } from '../data/mockData';

export type ActivityList = 'questions' | 'answers' | 'posts';

/** 각 목록은 최신 5개까지만 보여 준다. 전체는 "전체 보기"로 목록 화면에서 본다 (API_SPEC 2장 "회원 작성 목록"). */
export const ACTIVITY_LIMIT = 5;

interface ActivityItems {
  readonly questions: readonly AuthoredQuestion[];
  readonly answers: readonly AuthoredAnswer[];
  readonly posts: readonly AuthoredPost[];
}

const EMPTY: ActivityItems = { questions: [], answers: [], posts: [] };

/**
 * 프로필 작성 목록. 질문·게시글 목록 API에 authorId 를 붙여 조회한다.
 * TODO: 회원이 쓴 답변 목록 GET /api/answers?authorId=(#126)가 생기면 answers 도 연동한다
 */
export function useProfileActivity(authorId: number) {
  const [items, setItems] = useState<ActivityItems>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // 다른 회원 프로필로 옮기면, 늦게 온 이전 회원의 목록이 새 목록을 덮어쓰지 않게 한다
    let ignore = false;
    setItems(EMPTY);
    setLoading(true);
    setErrorMessage(null);
    Promise.all([
      getQuestionsByAuthor(authorId, ACTIVITY_LIMIT),
      getPostsByAuthor(authorId, ACTIVITY_LIMIT),
    ])
      .then(([questions, posts]) => {
        if (!ignore) setItems({ questions, answers: [], posts });
      })
      .catch((error: unknown) => {
        if (!ignore) setErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [authorId]);

  return { ...items, loading, errorMessage };
}

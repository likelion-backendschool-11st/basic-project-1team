import { useMemo } from 'react';
import { authoredAnswers, authoredPosts, authoredQuestions } from '../data/mockData';

export type ActivityList = 'questions' | 'answers' | 'posts';

/** 각 목록은 최신 5개까지만 보여 준다. 전체는 "전체 보기"로 목록 화면에서 본다 (API_SPEC 2장 "회원 작성 목록"). */
export const ACTIVITY_LIMIT = 5;

/**
 * 프로필 작성 목록. 질문·답변·게시글 목록 API에 authorId 를 붙여 조회한다.
 */
export function useProfileActivity(authorId: number) {
  // TODO: GET /api/questions|answers|posts?authorId=&size=5 연동 (서버가 최신순으로 내려준다)
  return useMemo(
    () => ({
      questions: authoredQuestions.filter((q) => q.authorId === authorId).slice(0, ACTIVITY_LIMIT),
      answers: authoredAnswers.filter((a) => a.authorId === authorId).slice(0, ACTIVITY_LIMIT),
      posts: authoredPosts.filter((p) => p.authorId === authorId).slice(0, ACTIVITY_LIMIT),
    }),
    [authorId],
  );
}

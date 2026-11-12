import { useMemo, useState } from 'react';
import { authoredAnswers, authoredPosts, authoredQuestions } from '../data/mockData';

export type ActivityTab = 'questions' | 'answers' | 'posts';

/**
 * 프로필 작성 목록 (API_SPEC 2장 "회원 작성 목록").
 * 질문·답변·게시글 목록 API에 authorId 를 붙여 조회한다.
 */
export function useProfileActivity(authorId: number) {
  const [tab, setTab] = useState<ActivityTab>('questions');

  // TODO: GET /api/questions|answers|posts?authorId= 연동
  const lists = useMemo(
    () => ({
      questions: authoredQuestions.filter((q) => q.authorId === authorId),
      answers: authoredAnswers.filter((a) => a.authorId === authorId),
      posts: authoredPosts.filter((p) => p.authorId === authorId),
    }),
    [authorId],
  );

  return { tab, setTab, ...lists };
}

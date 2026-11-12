import { useMemo, useState } from 'react';
import { authoredAnswers, authoredPosts, authoredQuestions } from '../data/mockData';

export type ActivityList = 'questions' | 'answers' | 'posts';

/** 각 목록은 최신 5개부터 보여 주고 "더 보기"로 다음 페이지를 이어 붙인다 (API_SPEC 2장 "회원 작성 목록"). */
const PAGE_SIZE = 5;

/**
 * 프로필 작성 목록. 질문·답변·게시글 목록 API에 authorId 를 붙여 조회한다.
 */
export function useProfileActivity(authorId: number) {
  const [pages, setPages] = useState<Record<ActivityList, number>>({ questions: 1, answers: 1, posts: 1 });

  // TODO: GET /api/questions|answers|posts?authorId=&page=&size=5 연동
  const all = useMemo(
    () => ({
      questions: authoredQuestions.filter((q) => q.authorId === authorId),
      answers: authoredAnswers.filter((a) => a.authorId === authorId),
      posts: authoredPosts.filter((p) => p.authorId === authorId),
    }),
    [authorId],
  );

  const shown = (list: ActivityList) => pages[list] * PAGE_SIZE;

  return {
    questions: all.questions.slice(0, shown('questions')),
    answers: all.answers.slice(0, shown('answers')),
    posts: all.posts.slice(0, shown('posts')),
    hasMore: (list: ActivityList) => all[list].length > shown(list),
    loadMore: (list: ActivityList) => setPages((prev) => ({ ...prev, [list]: prev[list] + 1 })),
  };
}

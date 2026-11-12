import { useCallback, useState } from 'react';
import { isLoggedIn } from '../../../shared/auth';
import { CURRENT_USER, type Comment, initialComments, labels } from '../data/mockData';
import { isCommentDeleted, markCommentDeleted } from '../data/mockStore';

/** 댓글 목록. TODO: GET·POST /api/posts/:postId/comments, DELETE /api/comments/:commentId 연동 */
export function useComments(seed: Comment[] = initialComments) {
  const [comments, setComments] = useState<Comment[]>(() =>
    seed.filter((c) => !isCommentDeleted(c.id)),
  );
  const [expanded, setExpanded] = useState(true);
  const [draft, setDraft] = useState('');

  const submit = useCallback(() => {
    const body = draft.trim();
    if (!body) return;
    // mock: 작성자는 로그인한 회원 (API 응답의 author)
    setComments((list) => [
      ...list,
      { id: Date.now(), author: CURRENT_USER, date: labels.justNow, body, tone: 'brand' },
    ]);
    setDraft('');
  }, [draft]);

  /** 본인 댓글인지 (API 의 isMine) */
  const isMine = useCallback(
    (comment: Comment) => isLoggedIn() && comment.author === CURRENT_USER,
    [],
  );

  /** 삭제. 행을 지우지 않고 삭제 상태로 바꾸며 목록과 댓글 수에서 빠진다 (API_SPEC 7장) */
  const remove = useCallback((comment: Comment) => {
    if (!window.confirm(labels.commentDeleteConfirm)) return;
    markCommentDeleted(comment.id);
    setComments((list) => list.filter((c) => c.id !== comment.id));
  }, []);

  const toggleExpanded = useCallback(() => setExpanded((v) => !v), []);
  const shown = expanded ? comments : comments.slice(0, 1);

  return { comments, shown, expanded, toggleExpanded, draft, setDraft, submit, isMine, remove };
}

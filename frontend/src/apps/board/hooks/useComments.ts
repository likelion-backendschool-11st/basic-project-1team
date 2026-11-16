import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../../../shared/api';
import { createComment, deleteComment, getComments, updateComment } from '../api/posts';
import { COMMENT_PAGE_SIZE, labels } from '../data/mockData';
import type { Comment } from '../data/types';

/**
 * 게시글 댓글 (GET·POST /api/posts/:postId/comments, DELETE /api/comments/:commentId).
 * 오래된 순으로 받고, 접으면 첫 댓글만 보여 준다 (REQ-BOARD-006·007)
 */
export function useComments(postId: number) {
  const [comments, setComments] = useState<readonly Comment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // 한 번에 댓글 하나만 고친다 (REQ-BOARD-016)
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getComments(postId, 1, COMMENT_PAGE_SIZE)
      .then((result) => {
        if (ignore) return;
        setComments(result.items);
        setTotalCount(result.meta.totalCount);
        setErrorMessage(null);
      })
      .catch(() => {
        if (ignore) return;
        setComments([]);
        setTotalCount(0);
        setErrorMessage(labels.commentsLoadError);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [postId]);

  const submit = useCallback(async () => {
    const body = draft.trim();
    if (!body || submitting) return;
    setSubmitting(true);
    try {
      const created = await createComment(postId, body);
      setComments((list) => [...list, created]);
      setTotalCount((n) => n + 1);
      setDraft('');
    } catch (error) {
      // 댓글 제한·이용 정지(403)도 서버 안내 문구를 그대로 보여 준다 (API_SPEC 1.2)
      window.alert(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }, [draft, submitting, postId]);

  /** 삭제. 행을 지우지 않고 삭제 상태로 바꾸며 목록과 댓글 수에서 빠진다 (API_SPEC 7장) */
  const remove = useCallback(async (comment: Comment) => {
    if (!window.confirm(labels.commentDeleteConfirm)) return;
    try {
      await deleteComment(comment.id);
      setComments((list) => list.filter((c) => c.id !== comment.id));
      setTotalCount((n) => Math.max(0, n - 1));
    } catch (error) {
      window.alert(getErrorMessage(error));
    }
  }, []);

  const startEdit = useCallback((comment: Comment) => {
    setEditingId(comment.id);
    setEditDraft(comment.body);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditDraft('');
  }, []);

  /** 수정 저장. 바뀐 내용이 없으면 요청 없이 닫는다 */
  const saveEdit = useCallback(async () => {
    if (editingId === null || savingEdit) return;
    const body = editDraft.trim();
    if (!body) return;
    const original = comments.find((c) => c.id === editingId);
    if (original && original.body === body) {
      cancelEdit();
      return;
    }
    setSavingEdit(true);
    try {
      const updated = await updateComment(editingId, body);
      setComments((list) => list.map((c) => (c.id === updated.id ? updated : c)));
      cancelEdit();
    } catch (error) {
      // 댓글 제한·이용 정지(403)도 서버 안내 문구를 그대로 보여 준다 (API_SPEC 1.2)
      window.alert(getErrorMessage(error));
    } finally {
      setSavingEdit(false);
    }
  }, [editingId, editDraft, savingEdit, comments, cancelEdit]);

  const toggleExpanded = useCallback(() => setExpanded((v) => !v), []);
  const shown = expanded ? comments : comments.slice(0, 1);

  return {
    comments,
    totalCount,
    shown,
    loading,
    errorMessage,
    expanded,
    toggleExpanded,
    draft,
    setDraft,
    submit,
    submitting,
    remove,
    editingId,
    editDraft,
    setEditDraft,
    savingEdit,
    startEdit,
    cancelEdit,
    saveEdit,
  };
}

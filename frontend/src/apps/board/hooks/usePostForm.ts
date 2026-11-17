import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../../shared/api';
import { useRichText } from '../../../shared/editor/useRichText';
import { useSanctionGuard } from '../../../shared/sanctions';
import { createPost, getPost, updatePost } from '../api/posts';
import { labels, routes } from '../data/mockData';
import { readPostDraft, usePostDraft } from './usePostDraft';

/**
 * 게시글 작성·수정 폼 (POST /api/posts, PATCH /api/posts/:postId). `postId` 가 있으면 수정 모드다.
 * 본문은 에디터 HTML 그대로 보낸다. 사진은 에디터가 업로드 API로 올린 주소가 본문 안에 있다 (REQ-BOARD-009)
 */
export function usePostForm(postId?: number) {
  const { blockIfRestricted, restrictionFor } = useSanctionGuard();
  const navigate = useNavigate();
  const isEdit = postId !== undefined;
  // 새 글이면 임시저장한 글로 시작한다. 수정 화면은 임시저장을 쓰지 않는다 (REQ-BOARD-015)
  const [initialDraft] = useState(() => (isEdit ? null : readPostDraft()));
  const [showRestored, setShowRestored] = useState(initialDraft !== null);
  const [title, setTitle] = useState(initialDraft?.title ?? '');
  const body = useRichText(initialDraft?.body ?? '');
  const { setValue: setBody } = body;
  const [loading, setLoading] = useState(isEdit);
  const [publishing, setPublishing] = useState(false);

  // 수정 화면은 지금 글을 불러와 채운다. 작성자가 아니면 상세 화면으로 돌려보낸다
  useEffect(() => {
    if (postId === undefined) return;
    let ignore = false;
    getPost(postId)
      .then((post) => {
        if (ignore) return;
        if (!post.isMine) {
          window.alert(labels.write.notMine);
          navigate(routes.detail(postId), { replace: true });
          return;
        }
        setTitle(post.title);
        setBody(post.body);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (ignore) return;
        window.alert(getErrorMessage(error));
        navigate(routes.board, { replace: true });
      });
    return () => {
      ignore = true;
    };
  }, [postId, navigate, setBody]);

  const draft = usePostDraft({ title, body: body.value }, initialDraft, !isEdit);
  const { clear: clearDraft } = draft;

  /** 임시글을 지우고 빈 글로 다시 시작한다 */
  const discardDraft = useCallback(() => {
    if (!window.confirm(labels.write.draftDiscardConfirm)) return;
    clearDraft();
    setTitle('');
    setBody('');
    setShowRestored(false);
  }, [clearDraft, setBody]);

  const cancel = useCallback(() => navigate(-1), [navigate]);

  const publish = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (publishing) return;
      // 글쓰기 제한·이용 정지 중이면 막는다 (API_SPEC 1.2). 서버도 403 으로 한 번 더 막는다
      if (blockIfRestricted('write')) return;
      if (!title.trim()) {
        window.alert(labels.write.titleRequired);
        return;
      }
      if (body.isEmpty) {
        window.alert(labels.write.bodyRequired);
        return;
      }
      if (body.limitError) {
        window.alert(body.limitError);
        return;
      }
      setPublishing(true);
      try {
        const input = { title: title.trim(), body: body.value };
        const saved =
          postId !== undefined ? await updatePost(postId, input) : await createPost(input);
        // 등록에 성공하면 임시글은 필요 없다
        if (!isEdit) clearDraft();
        window.alert(isEdit ? labels.write.updated : labels.write.published);
        // 저장한 글을 바로 확인할 수 있게 상세 화면으로 간다
        navigate(routes.detail(saved.id));
      } catch (error) {
        window.alert(getErrorMessage(error));
        setPublishing(false);
      }
    },
    [
      publishing,
      blockIfRestricted,
      title,
      body.isEmpty,
      body.limitError,
      body.value,
      isEdit,
      postId,
      navigate,
      clearDraft,
    ],
  );

  return {
    isEdit,
    loading,
    restriction: restrictionFor('write'),
    title,
    setTitle,
    body,
    cancel,
    publish,
    publishing,
    draft,
    showRestored,
    restoredAt: initialDraft?.savedAt ?? null,
    discardDraft,
  };
}

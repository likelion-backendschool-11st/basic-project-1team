import { type FormEvent, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { textToHtml } from '../../../shared/editor/richText';
import { useRichText } from '../../../shared/editor/useRichText';
import { initialAttachedUrls, initialPosts, labels, postDetail, routes } from '../data/mockData';

/** 수정 화면의 처음 값. mock 은 모든 글이 같은 상세 본문을 쓴다 (usePostDetail 과 같은 규칙). */
function loadPost(postId: number) {
  const post = initialPosts.find((p) => p.id === postId);
  const title = !post || post.id === 1 ? postDetail.title : post.title;
  const body =
    textToHtml(postDetail.intro) +
    postDetail.sections.map((s) => `<h3>${s.heading}</h3>${textToHtml(s.body)}`).join('');
  return { title, body, urls: [postDetail.attachmentUrl] };
}

/** 게시글 작성·수정 폼. `postId` 가 있으면 수정 모드다. */
export function usePostForm(postId?: number) {
  const navigate = useNavigate();
  const [initial] = useState(() =>
    postId === undefined ? { title: '', body: '', urls: initialAttachedUrls } : loadPost(postId),
  );
  const [title, setTitle] = useState(initial.title);
  const body = useRichText(initial.body);
  const [urlDraft, setUrlDraft] = useState('');
  const [urls, setUrls] = useState<string[]>(initial.urls);
  const [publishing, setPublishing] = useState(false);
  const isEdit = postId !== undefined;

  const addUrl = useCallback(() => {
    const v = urlDraft.trim();
    if (!v) return;
    setUrls((list) => [...list, v]);
    setUrlDraft('');
  }, [urlDraft]);

  const removeUrl = useCallback((idx: number) => {
    setUrls((list) => list.filter((_, i) => i !== idx));
  }, []);

  const cancel = useCallback(() => navigate(-1), [navigate]);

  const publish = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
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
      // TODO: POST /api/posts · PATCH /api/posts/:postId 연동 (body 는 HTML)
      window.setTimeout(() => {
        window.alert(isEdit ? labels.write.updated : labels.write.published);
        navigate(isEdit ? routes.detail(postId) : routes.board);
      }, 800);
    },
    [title, body.isEmpty, body.limitError, isEdit, postId, navigate],
  );

  return {
    isEdit,
    title,
    setTitle,
    body,
    urlDraft,
    setUrlDraft,
    urls,
    addUrl,
    removeUrl,
    cancel,
    publish,
    publishing,
  };
}

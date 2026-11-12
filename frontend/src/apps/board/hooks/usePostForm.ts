import { type FormEvent, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initialAttachedUrls, labels, routes } from '../data/mockData';

export function usePostForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [urlDraft, setUrlDraft] = useState('');
  const [urls, setUrls] = useState<string[]>(initialAttachedUrls);
  const [publishing, setPublishing] = useState(false);

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
      setPublishing(true);
      window.setTimeout(() => {
        window.alert(labels.write.published);
        navigate(routes.board);
      }, 800);
    },
    [title, navigate],
  );

  return { title, setTitle, body, setBody, urlDraft, setUrlDraft, urls, addUrl, removeUrl, cancel, publish, publishing };
}

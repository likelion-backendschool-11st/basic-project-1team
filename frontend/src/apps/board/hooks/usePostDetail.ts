import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError, getErrorMessage } from '../../../shared/api';
import { deletePost, getPost } from '../api/posts';
import { labels, routes } from '../data/mockData';
import type { PostDetail } from '../data/types';

/** 없는 글(404)이거나 주소의 id 가 숫자가 아니면(400) "없는 게시글"로 보여 준다 */
const isNotFound = (error: unknown) =>
  error instanceof ApiError && (error.status === 404 || error.status === 400);

/**
 * 게시글 상세 (GET /api/posts/:postId). 화면은 이 hook 으로만 데이터를 받는다.
 * 조회수는 서버가 올린다 (같은 회원·IP는 24시간에 한 번, REQ-BOARD-011).
 */
export function usePostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const postId = Number(id);
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setNotFound(false);
    setErrorMessage(null);
    getPost(postId)
      .then((result) => {
        if (!ignore) setPost(result);
      })
      .catch((error: unknown) => {
        if (ignore) return;
        setPost(null);
        if (isNotFound(error)) setNotFound(true);
        else setErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [postId]);

  /** 삭제. 행을 지우지 않고 삭제 상태로 바꾸며 댓글도 함께 삭제된다 (API_SPEC 1.7, 7장) */
  const remove = useCallback(async () => {
    if (!window.confirm(labels.postDeleteConfirm)) return;
    try {
      await deletePost(postId);
      window.alert(labels.postDeleted);
      navigate(routes.board);
    } catch (error) {
      window.alert(getErrorMessage(error));
    }
  }, [postId, navigate]);

  return { postId, post, loading, notFound, errorMessage, remove };
}

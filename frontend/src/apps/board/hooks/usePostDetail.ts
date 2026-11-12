import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isLoggedIn } from '../../../shared/auth';
import { CURRENT_USER, initialPosts, labels, postDetail, routes } from '../data/mockData';
import { isPostDeleted, markPostDeleted } from '../data/mockStore';

/**
 * 게시글 상세. 화면은 이 hook 으로만 데이터를 받는다.
 * TODO: GET /api/posts/:postId 연동 (본문 body 는 HTML, isMine 은 서버가 준다).
 * mock 은 모든 글이 같은 본문을 쓰고 제목·작성자만 목록 값으로 바꾼다.
 */
export function usePostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const postId = Number(id);
  const post = initialPosts.find((p) => p.id === postId);
  const title = !post || post.id === 1 ? postDetail.title : post.title;
  const author = post?.author ?? postDetail.author;
  const isMine = isLoggedIn() && author === CURRENT_USER;

  /** 삭제. 행을 지우지 않고 삭제 상태로 바꾼다 (DELETE /api/posts/:postId, API_SPEC 1.7) */
  const remove = useCallback(() => {
    if (!window.confirm(labels.postDeleteConfirm)) return;
    // TODO: DELETE /api/posts/:postId
    markPostDeleted(postId);
    window.alert(labels.postDeleted);
    navigate(routes.board);
  }, [postId, navigate]);

  return {
    postId,
    detail: { ...postDetail, author },
    title,
    isMine,
    notFound: isPostDeleted(postId),
    remove,
  };
}

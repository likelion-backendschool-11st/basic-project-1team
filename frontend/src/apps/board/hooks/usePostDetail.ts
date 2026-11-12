import { useParams } from 'react-router-dom';
import { initialPosts, postDetail } from '../data/mockData';

/**
 * 게시글 상세. 화면은 이 hook 으로만 데이터를 받는다.
 * TODO: GET /api/posts/:postId 연동. mock 은 모든 글이 같은 본문을 쓰고 제목만 목록 값으로 바꾼다.
 */
export function usePostDetail() {
  const { id } = useParams();
  const post = initialPosts.find((p) => p.id === Number(id));
  const title = !post || post.id === 1 ? postDetail.title : post.title;
  return { detail: postDetail, title };
}

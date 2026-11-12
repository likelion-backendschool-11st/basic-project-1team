import { useParams } from 'react-router-dom';
import { initialPosts, postDetail } from '../data/mockData';

/** Mock lookup: every post renders the Stitch detail body; list titles override the heading. */
export function usePostDetail() {
  const { id } = useParams();
  const post = initialPosts.find((p) => p.id === Number(id));
  const title = !post || post.id === 1 ? postDetail.title : post.title;
  return { detail: postDetail, title };
}

import { apiPageRequest, toQueryString } from '../../../shared/api';
import type { AuthoredPost, AuthoredQuestion } from '../data/mockData';

/**
 * 프로필 작성 목록. 회원 전용 API 없이 각 목록 API에 authorId 를 붙여 최신순으로 받는다
 * (API_SPEC 2장 "회원 작성 목록")
 */
export async function getQuestionsByAuthor(
  authorId: number,
  size: number,
): Promise<readonly AuthoredQuestion[]> {
  const { items } = await apiPageRequest<AuthoredQuestion>(
    `/questions${toQueryString({ authorId, size })}`,
  );
  return items;
}

export async function getPostsByAuthor(
  authorId: number,
  size: number,
): Promise<readonly AuthoredPost[]> {
  const { items } = await apiPageRequest<AuthoredPost>(
    `/posts${toQueryString({ authorId, size })}`,
  );
  return items;
}

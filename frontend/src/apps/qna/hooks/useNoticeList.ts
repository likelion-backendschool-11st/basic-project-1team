import { useSearchParams } from 'react-router-dom';
import { notices } from '../../../shared/notices';

/** 공지 목록 한 페이지 개수 (API_SPEC 9장 기본값) */
export const NOTICE_PAGE_SIZE = 10;

/**
 * 공지 목록. 페이지는 주소의 ?page= 로 둔다 (새로고침·뒤로 가기에도 유지).
 * TODO: GET /api/notices?page=&size= 연동. 서버가 고정 공지 먼저, 그다음 최신순으로 준다.
 */
export function useNoticeList() {
  const [search, setSearch] = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(notices.length / NOTICE_PAGE_SIZE));
  const requested = Number(search.get('page')) || 1;
  const page = Math.min(Math.max(requested, 1), totalPages);
  const items = notices.slice((page - 1) * NOTICE_PAGE_SIZE, page * NOTICE_PAGE_SIZE);

  const goTo = (next: number) => {
    setSearch(next === 1 ? {} : { page: String(next) });
    window.scrollTo(0, 0);
  };

  return {
    items,
    page,
    pages: Array.from({ length: totalPages }, (_, i) => i + 1),
    hasPrev: page > 1,
    hasNext: page < totalPages,
    goTo,
  };
}

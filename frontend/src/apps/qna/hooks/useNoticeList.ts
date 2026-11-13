import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../../../shared/api';
import { getNotices, type NoticeSummary } from '../../../shared/notices';

/** 공지 목록 한 페이지 개수 (API_SPEC 9장 기본값) */
export const NOTICE_PAGE_SIZE = 10;

/**
 * 공지 목록 (GET /api/notices). 페이지는 주소의 ?page= 로 둔다 (새로고침·뒤로 가기에도 유지).
 * 서버가 고정 공지 먼저, 그다음 최신순으로 준다.
 */
export function useNoticeList() {
  const [search, setSearch] = useSearchParams();
  const page = Math.max(Number(search.get('page')) || 1, 1);
  const [items, setItems] = useState<readonly NoticeSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getNotices(page, NOTICE_PAGE_SIZE)
      .then((result) => {
        if (ignore) return;
        setItems(result.items);
        setTotalCount(result.meta.totalCount);
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (ignore) return;
        setItems([]);
        setErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / NOTICE_PAGE_SIZE));

  const goTo = (next: number) => {
    setSearch(next === 1 ? {} : { page: String(next) });
    window.scrollTo(0, 0);
  };

  return {
    items,
    loading,
    errorMessage,
    page,
    pages: Array.from({ length: totalPages }, (_, i) => i + 1),
    hasPrev: page > 1,
    hasNext: page < totalPages,
    goTo,
  };
}

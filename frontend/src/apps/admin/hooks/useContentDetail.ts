import { useEffect, useState } from 'react';
import { ApiError } from '../../../shared/api';
import { getContentDetail, type ContentDetailMap } from '../api/contents';
import { ui } from '../data/mockData';
import type { ContentType } from '../types';

export interface ContentDetailState<T extends ContentType> {
  readonly detail: ContentDetailMap[T] | null;
  readonly loading: boolean;
  readonly errorMessage: string | null;
}

/** 관리자 상세 (본문 확인). id 가 null 이면 불러오지 않는다 */
export function useContentDetail<T extends ContentType>(
  type: T,
  id: number | null,
): ContentDetailState<T> {
  const [detail, setDetail] = useState<ContentDetailMap[T] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setDetail(null);
    setErrorMessage(null);
    if (id === null) return undefined;
    let ignore = false;
    setLoading(true);
    getContentDetail(type, id)
      .then((result) => {
        if (!ignore) setDetail(result);
      })
      .catch((error: unknown) => {
        if (!ignore) setErrorMessage(error instanceof ApiError ? error.message : ui.loadError);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [type, id]);

  return { detail, loading, errorMessage };
}

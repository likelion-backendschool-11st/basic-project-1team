import { useEffect, useState } from 'react';
import { ApiError, getErrorMessage } from '../../../shared/api';
import { getNotice, type Notice } from '../../../shared/notices';

export interface NoticeDetailState {
  readonly notice: Notice | null;
  readonly loading: boolean;
  /** 없거나 삭제된 공지(404 NOTICE_NOT_FOUND), 또는 주소의 id 가 숫자가 아님 */
  readonly notFound: boolean;
  readonly errorMessage: string | null;
}

/** 공지 상세 (GET /api/notices/:noticeId). 화면은 이 hook 으로만 데이터를 받는다. */
export function useNoticeDetail(noticeId: string | undefined): NoticeDetailState {
  const id = noticeId !== undefined && /^[1-9]\d*$/.test(noticeId) ? Number(noticeId) : null;
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(id !== null);
  const [notFound, setNotFound] = useState(id === null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id === null) {
      setNotFound(true);
      setLoading(false);
      return undefined;
    }
    let ignore = false;
    setLoading(true);
    getNotice(id)
      .then((result) => {
        if (ignore) return;
        setNotice(result);
        setNotFound(false);
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (ignore) return;
        setNotice(null);
        if (error instanceof ApiError && error.code === 'NOTICE_NOT_FOUND') setNotFound(true);
        else setErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  return { notice, loading, notFound, errorMessage };
}

import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * 라우터 하나(site 모듈)로 묶인 사용자 화면(Q&A·자유게시판·회원) 밖의 경로 prefix.
 * 사용자 화면끼리는 페이지를 새로 읽지 않고 화면만 바꾸고, 관리자(/admin)는 따로 연다.
 */
const OUTSIDE_PREFIXES = ['/admin'] as const;

/** site 라우터 안에서 처리하는 경로인지 (같은 사이트의 `/` 경로이고 관리자 화면이 아님) */
export const isSitePath = (href: string) =>
  href.startsWith('/') &&
  !href.startsWith('//') &&
  !OUTSIDE_PREFIXES.some(
    (prefix) => href === prefix || href.startsWith(`${prefix}/`) || href.startsWith(`${prefix}?`),
  );

/** 지금 경로 (prefix 포함 전체 경로) */
export function useSitePath(): string {
  return useLocation().pathname;
}

/**
 * 전체 경로로 이동한다. site 화면이면 화면 전환(navigate), 그 밖(관리자)이면 페이지 이동.
 * SiteLink 의 코드용 버전이다.
 */
export function useSiteNavigate(): (href: string) => void {
  const navigate = useNavigate();
  return useCallback(
    (href: string) => {
      if (isSitePath(href)) navigate(href);
      else window.location.assign(href);
    },
    [navigate],
  );
}

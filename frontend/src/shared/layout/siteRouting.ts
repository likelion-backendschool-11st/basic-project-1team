import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * 라우터 하나(site 모듈)로 묶인 사용자 화면의 경로 prefix.
 * 이 아래로는 페이지를 새로 읽지 않고 화면만 바꾼다. 회원(/login, /mypage …)·관리자(/admin)는 따로 연다.
 */
export const SITE_PREFIXES = ['/qna', '/board'] as const;

/** site 라우터 안에서 처리하는 경로인지 */
export const isSitePath = (href: string) =>
  SITE_PREFIXES.some(
    (prefix) => href === prefix || href.startsWith(`${prefix}/`) || href.startsWith(`${prefix}?`),
  );

/** 지금 경로 (prefix 포함 전체 경로) */
export function useSitePath(): string {
  return useLocation().pathname;
}

/**
 * 전체 경로로 이동한다. site 화면이면 화면 전환(navigate), 그 밖(회원·관리자)이면 페이지 이동.
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

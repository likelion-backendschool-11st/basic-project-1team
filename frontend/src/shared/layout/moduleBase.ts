import { createContext, useCallback, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/** 지금 화면이 속한 모듈의 URL prefix (`/qna`, `/board`). SiteLayout 이 넣어 준다. */
export const ModuleBaseContext = createContext('');

export function useModuleBase(): string {
  return useContext(ModuleBaseContext);
}

/** 모듈 prefix 를 붙인 현재 경로 */
export function useSitePath(): string {
  const base = useModuleBase();
  const { pathname } = useLocation();
  return pathname === '/' ? base : `${base}${pathname}`;
}

/**
 * 전체 경로로 이동한다. 같은 모듈이면 화면 전환(navigate), 다른 모듈이면 페이지 이동(location).
 * SiteLink 의 코드용 버전이다.
 */
export function useSiteNavigate(): (href: string) => void {
  const base = useModuleBase();
  const navigate = useNavigate();
  return useCallback(
    (href: string) => {
      if (href === base || href.startsWith(`${base}/`)) navigate(href.slice(base.length) || '/');
      else window.location.assign(href);
    },
    [base, navigate],
  );
}

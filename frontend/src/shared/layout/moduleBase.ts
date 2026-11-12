import { createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';

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

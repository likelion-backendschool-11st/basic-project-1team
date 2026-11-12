import React from 'react';
import { Link } from 'react-router-dom';
import { useModuleBase } from './moduleBase';

interface SiteLinkProps {
  /** 모듈 prefix 를 포함한 전체 경로 (예: `/qna/notices`) */
  readonly href: string;
  readonly className?: string;
  readonly tabIndex?: number;
  readonly children: React.ReactNode;
}

/**
 * 같은 모듈 경로는 `<Link>`, 다른 모듈 경로는 `<a href>`(전체 페이지 이동)로 그린다.
 * 모듈마다 BrowserRouter 와 CSS 가 따로라 다른 모듈로는 `<Link>` 로 갈 수 없다.
 */
export const SiteLink: React.FC<SiteLinkProps> = ({ href, children, ...rest }) => {
  const base = useModuleBase();
  if (href === base || href.startsWith(`${base}/`)) {
    return (
      <Link to={href.slice(base.length) || '/'} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
};

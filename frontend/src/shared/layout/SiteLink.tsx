import React from 'react';
import { Link } from 'react-router-dom';
import { isSitePath } from './siteRouting';

interface SiteLinkProps {
  /** 모듈 prefix 를 포함한 전체 경로 (예: `/qna/notices`, `/board`) */
  readonly href: string;
  readonly className?: string;
  readonly tabIndex?: number;
  readonly role?: string;
  readonly onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  readonly children: React.ReactNode;
}

/**
 * 사용자 화면(Q&A·자유게시판·회원) 경로는 `<Link>`(페이지를 새로 읽지 않음), 관리자 화면은 `<a href>`로 그린다.
 * 관리자 화면은 라우터와 CSS 가 따로라 페이지를 새로 연다.
 */
export const SiteLink: React.FC<SiteLinkProps> = ({ href, children, ...rest }) =>
  isSitePath(href) ? (
    <Link to={href} {...rest}>
      {children}
    </Link>
  ) : (
    <a href={href} {...rest}>
      {children}
    </a>
  );

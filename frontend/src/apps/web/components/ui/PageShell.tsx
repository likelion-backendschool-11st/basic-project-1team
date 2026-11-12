import React from 'react';

interface PageShellProps {
  readonly children: React.ReactNode;
  readonly footer?: React.ReactNode;
}

/**
 * 로그인·회원가입처럼 폼 하나를 보여 주는 화면. 사이트 헤더·푸터(SiteLayout) 사이 본문 가운데에 카드를 둔다.
 */
export const PageShell: React.FC<PageShellProps> = ({ children, footer }) => (
  <div className="flex justify-center py-space-2xl">
    <div className="flex w-full max-w-lg flex-col">
      {children}
      {footer}
    </div>
  </div>
);

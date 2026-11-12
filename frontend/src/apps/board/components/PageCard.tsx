import React from 'react';

interface PageCardProps {
  readonly children: React.ReactNode;
  readonly padded?: boolean;
}

/** 자유게시판 화면의 본문 카드. 헤더·푸터는 공통 SiteLayout 이 그린다. */
export const PageCard: React.FC<PageCardProps> = ({ children, padded = false }) => (
  <div className="py-space-xl">
    <section
      className={`w-full overflow-hidden rounded-lg border border-hairline bg-surface-1 ${
        padded ? 'p-8 sm:p-12' : ''
      }`}
    >
      {children}
    </section>
  </div>
);

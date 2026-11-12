import React from 'react';
import { profilePath } from '../site';

interface ProfileLinkProps {
  /** 작성자 회원 id. 탈퇴한 회원(null)이면 링크 없이 이름만 보여 준다 (API_SPEC 1.6) */
  readonly userId: number | null;
  readonly className?: string;
  readonly children: React.ReactNode;
}

/** 작성자 이름 → 공개 프로필. 회원 모듈이라 전체 페이지로 이동한다 */
export const ProfileLink: React.FC<ProfileLinkProps> = ({ userId, className = '', children }) =>
  userId === null ? (
    <span className={className}>{children}</span>
  ) : (
    <a href={profilePath(userId)} className={`hover:underline ${className}`}>
      {children}
    </a>
  );

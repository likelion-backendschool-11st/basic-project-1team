import React from 'react';
import { profilePath } from '../site';
import { SiteLink } from './SiteLink';

interface ProfileLinkProps {
  /** 작성자 회원 id. 탈퇴한 회원(null)이면 링크 없이 이름만 보여 준다 (API_SPEC 1.6) */
  readonly userId: number | null;
  readonly className?: string;
  readonly children: React.ReactNode;
}

/** 작성자 이름 → 공개 프로필. 목록 행 전체가 링크인 곳에서도 프로필로 가도록 클릭을 행에 넘기지 않는다 */
export const ProfileLink: React.FC<ProfileLinkProps> = ({ userId, className = '', children }) =>
  userId === null ? (
    <span className={className}>{children}</span>
  ) : (
    <SiteLink
      href={profilePath(userId)}
      onClick={(event) => event.stopPropagation()}
      className={`hover:underline ${className}`}
    >
      {children}
    </SiteLink>
  );

import { getUsers } from '../api/users';
import type { Member, MemberStatus, Role } from '../types';
import { usePagedList } from './usePagedList';

const PAGE_SIZE = 20;

export interface MemberFilters {
  readonly query: string;
  /** 'all' 이면 탈퇴 회원을 뺀 전체 (API_SPEC 10.2) */
  readonly status: string;
  readonly role: string;
  readonly sort: 'newest' | 'oldest';
}

const INITIAL_FILTERS: MemberFilters = { query: '', status: 'all', role: 'all', sort: 'newest' };

const fetchMembers = (f: MemberFilters, page: number, size: number) =>
  getUsers({
    page,
    size,
    keyword: f.query.trim() || undefined,
    status: f.status === 'all' ? undefined : (f.status as MemberStatus),
    role: f.role === 'all' ? undefined : (f.role as Role),
    sort: f.sort,
  });

/** 회원 목록 (API_SPEC 10.2). 검색어·상태·권한은 "검색"을 눌러야, 정렬은 고르자마자 적용된다. */
export function useMembers() {
  return usePagedList<Member, MemberFilters>(INITIAL_FILTERS, PAGE_SIZE, fetchMembers);
}

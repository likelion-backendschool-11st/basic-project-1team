/**
 * mock: 작성자 닉네임 → 회원 id. 모듈마다 mock 이 따로라 같은 회원을 같은 id 로 맞추려고 둔다.
 * TODO: API 연동 후에는 응답의 author.id(UserSummary, API_SPEC 1.6)를 쓰고 이 파일은 지운다.
 */
export const mockUserIds: Readonly<Record<string, number>> = {
  레전드게이머: 12,
  호야: 30,
  히야: 31,
  후야: 32,
  하이: 33,
  해야: 34,
  효아: 35,
  휴아: 36,
  헤야: 37,
  혀아: 38,
  흐야: 39,
  기열: 40,
  누구씨: 41,
};

/** mock 회원 id 로 닉네임을 찾는다 (목록 검색 조건 표시용). TODO: GET /api/users/:userId */
export const mockNickname = (userId: number): string | null =>
  Object.entries(mockUserIds).find(([, id]) => id === userId)?.[0] ?? null;

/** 닉네임으로 mock 회원 id 를 찾는다. 없으면 null (프로필 링크를 걸지 않음) */
export const mockUserId = (nickname: string): number | null => mockUserIds[nickname] ?? null;

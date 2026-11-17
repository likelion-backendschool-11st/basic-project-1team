/**
 * 표 아래 페이지 번호에 넘기는 값. 서버 페이지네이션 목록(usePagedList)이 이 모양을 그대로 갖고 있다.
 */
export interface PaginationState {
  readonly page: number;
  readonly totalPages: number;
  readonly goTo: (page: number) => void;
}

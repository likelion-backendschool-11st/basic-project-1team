import { apiPageRequest, apiRequest, type PageResult, toQueryString } from '../../../shared/api';
import type { MyProfile, MyReport, PointHistory, PublicProfile } from '../data/mockData';

export type AvailabilityField = 'username' | 'nickname' | 'email';

export interface Availability {
  readonly field: AvailabilityField;
  readonly value: string;
  readonly isAvailable: boolean;
}

/** DELETE /api/users/me (API_SPEC 2장). 탈퇴 안내 동의(agreed: true)를 함께 보낸다. 성공은 204 */
export function withdrawMe(password: string): Promise<void> {
  return apiRequest<void>('/users/me', { method: 'DELETE', body: { agreed: true, password } });
}

/** GET /api/users/availability (API_SPEC 2장). 세 값 중 하나만 보낸다 */
export function getAvailability(field: AvailabilityField, value: string): Promise<Availability> {
  return apiRequest<Availability>(`/users/availability${toQueryString({ [field]: value })}`);
}

/** PATCH /api/users/me/password (API_SPEC 2장). 로그인 필수, 성공은 204 */
export function changeMyPassword(body: {
  readonly currentPassword: string;
  readonly newPassword: string;
}): Promise<void> {
  return apiRequest<void>('/users/me/password', { method: 'PATCH', body });
}

/** GET /api/users/me (API_SPEC 2장). 마이페이지·헤더 프로필 메뉴 */
export function getMyProfile(): Promise<MyProfile> {
  return apiRequest<MyProfile>('/users/me');
}

/** PATCH /api/users/me (API_SPEC 2장). 소개글·주력 게임 수정. 응답은 GET /api/users/me 와 같다 */
export function updateMyProfile(body: {
  readonly bio: string;
  readonly mainGameTagIds?: readonly number[];
}): Promise<MyProfile> {
  return apiRequest<MyProfile>('/users/me', { method: 'PATCH', body });
}

/** POST /api/users/me/profile-image (API_SPEC 2장). PNG/JPG, 최대 10MB */
export function uploadProfileImage(file: File): Promise<{ readonly profileImageUrl: string }> {
  const form = new FormData();
  form.append('file', file);
  return apiRequest('/users/me/profile-image', { method: 'POST', body: form });
}

/** DELETE /api/users/me/profile-image (API_SPEC 2장). 등록된 사진을 지워 비운다 */
export function deleteProfileImage(): Promise<void> {
  return apiRequest<void>('/users/me/profile-image', { method: 'DELETE' });
}

/** GET /api/users/:userId (API_SPEC 2장). 공개 항목만 온다 */
export function getUserProfile(userId: number): Promise<PublicProfile> {
  return apiRequest<PublicProfile>(`/users/${userId}`);
}

/** GET /api/users/me/point-histories (API_SPEC 11장). 로그인 필수, 최신순 */
export function getMyPointHistories(page: number, size: number): Promise<PageResult<PointHistory>> {
  return apiPageRequest<PointHistory>(`/users/me/point-histories${toQueryString({ page, size })}`);
}

/** GET /api/reports/me (API_SPEC 8장). 내가 접수한 신고, 최신순. 취소한 신고는 빠진다 */
export function getMyReports(page: number, size: number): Promise<PageResult<MyReport>> {
  return apiPageRequest<MyReport>(`/reports/me${toQueryString({ page, size })}`);
}

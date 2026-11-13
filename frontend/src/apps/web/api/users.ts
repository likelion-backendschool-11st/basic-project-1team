import { apiRequest, toQueryString } from '../../../shared/api';

export type AvailabilityField = 'username' | 'nickname' | 'email';

export interface Availability {
  readonly field: AvailabilityField;
  readonly value: string;
  readonly isAvailable: boolean;
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

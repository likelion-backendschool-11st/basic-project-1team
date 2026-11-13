import { apiRequest, toQueryString } from '../../../shared/api';

export type AvailabilityField = 'username' | 'nickname' | 'email';

export interface Availability {
  readonly field: AvailabilityField;
  readonly value: string;
  readonly isAvailable: boolean;
}

/** DELETE /api/users/me (API_SPEC 2장). 탈퇴 안내 동의(agreed: true)를 함께 보낸다. 성공은 204 */
export function withdrawMe(): Promise<void> {
  return apiRequest<void>('/users/me', { method: 'DELETE', body: { agreed: true } });
}

/** GET /api/users/availability (API_SPEC 2장). 세 값 중 하나만 보낸다 */
export function getAvailability(field: AvailabilityField, value: string): Promise<Availability> {
  return apiRequest<Availability>(`/users/availability${toQueryString({ [field]: value })}`);
}

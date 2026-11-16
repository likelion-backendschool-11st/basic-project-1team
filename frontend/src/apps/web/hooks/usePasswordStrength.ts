import { useMemo } from 'react';
import { isValidPassword } from '../../../shared/userRules';

export type StrengthScore = 0 | 1 | 2 | 3;

const SAFE_LENGTH = 12;

/**
 * 비밀번호 강도. '안전'이면 반드시 제출할 수 있도록 가입 규칙(API_SPEC 1.8)을 먼저 본다.
 * 0: 빈 값 · 1(취약): 규칙 위반 · 2(보통): 규칙 통과 · 3(안전): 규칙 통과 + 영문·숫자·특수문자 모두 또는 12자 이상
 */
export function usePasswordStrength(password: string): StrengthScore {
  return useMemo(() => {
    if (!password) return 0;
    if (!isValidPassword(password)) return 1;
    const hasAllKinds =
      /[A-Za-z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
    return hasAllKinds || password.length >= SAFE_LENGTH ? 3 : 2;
  }, [password]);
}

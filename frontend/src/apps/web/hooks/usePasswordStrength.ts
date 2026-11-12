import { useMemo } from 'react';

export type StrengthScore = 0 | 1 | 2 | 3;

/** 1pt: ≥8 chars · 1pt: letters + digits · 1pt: special character */
export function usePasswordStrength(password: string): StrengthScore {
  return useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Za-z]/.test(password) && /[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score as StrengthScore;
  }, [password]);
}

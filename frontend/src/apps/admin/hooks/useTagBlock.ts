import { useCallback, useEffect, useState } from 'react';
import { ApiError, getErrorMessage } from '../../../shared/api';
import { deleteTag, getTagBlockImpact } from '../api/tags';
import type { Tag, TagBlockImpact } from '../types';

export interface TagBlockState {
  /** 삭제(차단) 확인 창을 연 태그 */
  readonly target: Tag | null;
  /** 차단하면 빠지는 질문 수와 태그가 0개가 되는 질문 수. 불러오는 중이면 null */
  readonly impact: TagBlockImpact | null;
  readonly impactError: string | null;
  readonly open: (tag: Tag) => void;
  readonly close: () => void;
  /** 태그가 0개가 되는 질문이 있으면 replacementId 가 필요하다 (API_SPEC 10.5) */
  readonly confirm: (replacementId: number | undefined) => void;
  readonly submitting: boolean;
  readonly submitError: string | null;
}

/**
 * 태그 삭제(차단) 확인 창 (API_SPEC 10.5, REQ-ADMIN-010). 창을 열면 영향 범위를 불러오고,
 * 태그가 0개가 되는 질문이 있으면 대체 태그를 골라야 삭제할 수 있다.
 */
export function useTagBlock(onBlocked: (tagId: number) => void): TagBlockState {
  const [target, setTarget] = useState<Tag | null>(null);
  const [impact, setImpact] = useState<TagBlockImpact | null>(null);
  const [impactError, setImpactError] = useState<string | null>(null);
  // 창을 연 뒤 다른 관리자가 질문 태그를 바꿔 영향이 달라졌으면 다시 불러온다
  const [impactVersion, setImpactVersion] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!target) return undefined;
    let ignore = false;
    setImpact(null);
    setImpactError(null);
    getTagBlockImpact(target.id)
      .then((result) => {
        if (!ignore) setImpact(result);
      })
      .catch((error: unknown) => {
        if (!ignore) setImpactError(getErrorMessage(error));
      });
    return () => {
      ignore = true;
    };
  }, [target, impactVersion]);

  const open = useCallback((tag: Tag) => {
    setTarget(tag);
    setSubmitError(null);
  }, []);

  const close = useCallback(() => setTarget(null), []);

  // 실패하면 창을 열어 둔 채 이유를 보여 주고, 성공하면 닫고 알린다
  const confirm = useCallback(
    async (replacementId: number | undefined) => {
      if (!target) return;
      setSubmitting(true);
      setSubmitError(null);
      try {
        await deleteTag(target.id, replacementId);
        setTarget(null);
        onBlocked(target.id);
      } catch (error) {
        setSubmitError(getErrorMessage(error));
        if (error instanceof ApiError && error.code === 'TAG_REPLACEMENT_REQUIRED') {
          setImpactVersion((version) => version + 1);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [target, onBlocked],
  );

  return {
    target,
    impact,
    impactError,
    open,
    close,
    confirm: (replacementId) => void confirm(replacementId),
    submitting,
    submitError,
  };
}

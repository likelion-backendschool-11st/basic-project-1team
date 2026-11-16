import * as adminContentRepository from './admin-content.repository.js';
import * as reportTempHideRepository from './report-temp-hide.repository.js';

// 긴급 사유: 치트/핵/불법 프로그램, 개인정보 노출 (API 명세 8장)
const URGENT_REASONS = ['illegal', 'privacy'];
// 서로 다른 신고자가 이만큼 모이면 임시 숨김한다
const URGENT_REPORTER_THRESHOLD = 3;

export const TEMP_HIDE_LOG_DETAILS = Object.freeze({
  confirmed: '임시 숨김 확정',
  released: '임시 숨김 해제',
});

const targetKey = (type, id) => `${type}:${id}`;

/**
 * 긴급 신고 임시 숨김 (API 명세 8장, DB 설계서 4.25). 신고 접수 트랜잭션 안에서 **신고를 저장하기 전에** 부른다.
 * 대상 행을 먼저 잠가 같은 대상의 동시 긴급 신고를 줄 세운다. 신고를 넣은 뒤 잠그면 서로의 새 신고 행과
 * 대상 행을 엇갈려 기다려 교착이 난다. 그래서 이미 접수된 신고자 수에 지금 신고자 1명을 더해 센다
 * (중복 신고 검사를 지났으므로 지금 신고자는 아직 세지 않은 회원이다).
 * 이미 숨김·삭제된 대상과 채택된 답변은 바꾸지 않는다. 처리자가 없어 활동 로그는 남기지 않는다.
 */
export const hideForUrgentReport = async ({ targetType, targetId, reason }) => {
  if (!URGENT_REASONS.includes(reason)) {
    return;
  }

  const content = await adminContentRepository.findContentByIdForUpdate(targetType, targetId);

  if (content === null || content.status !== 'active' || content.is_accepted === 1) {
    return;
  }

  const reporterCount = await reportTempHideRepository.countUrgentReporters({
    targetType,
    targetId,
    reasons: URGENT_REASONS,
  });

  if (reporterCount + 1 < URGENT_REPORTER_THRESHOLD) {
    return;
  }

  await adminContentRepository.updateContentStatus(targetType, targetId, 'hidden');
  await reportTempHideRepository.createTempHide({ targetType, targetId });
};

/**
 * 관리자가 임시 숨김을 끝낸다 (API 명세 10.3·10.6). 대상 행은 호출하는 쪽에서 이미 잠갔다.
 * confirmed: 숨김 유지. released: 대상이 숨김 상태면 다시 공개한다 (삭제됐으면 기록만 끝낸다).
 * 임시 숨김 중이 아니었으면 아무것도 하지 않고 false를 돌려준다.
 */
export const endTempHide = async (adminId, { targetType, targetId, status, contentStatus }) => {
  const tempHide = await reportTempHideRepository.findActiveTempHideForUpdate({
    targetType,
    targetId,
  });

  if (tempHide === null) {
    return false;
  }

  if (status === 'released' && contentStatus === 'hidden') {
    await adminContentRepository.updateContentStatus(targetType, targetId, 'active');
  }

  await reportTempHideRepository.endTempHide(tempHide.id, { status, endedBy: adminId });

  return true;
};

/** 신고 목록 대상 중 임시 숨김 중인 것 (`type:id` Set) */
export const findTempHiddenTargetKeys = async (targets) => {
  const rows = await reportTempHideRepository.findActiveTempHideTargets(targets);

  return new Set(rows.map((row) => targetKey(row.target_type, row.target_id)));
};

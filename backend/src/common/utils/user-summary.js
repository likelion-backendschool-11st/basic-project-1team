const WITHDRAWN_USER = { id: null, nickname: '탈퇴한 회원', profileImageUrl: null };

// row의 <prefix>_id, <prefix>_nickname 등을 UserSummary로 바꾼다.
// 탈퇴한 회원은 '탈퇴한 회원'으로 내려 준다 (API 명세 1.6)
export const toUserSummary = (row, prefix) => {
  if (row[`${prefix}_status`] === 'withdrawn') {
    return WITHDRAWN_USER;
  }

  return {
    id: row[`${prefix}_id`],
    nickname: row[`${prefix}_nickname`],
    profileImageUrl: row[`${prefix}_profile_image_url`],
  };
};

/** 본문 글자 수 규칙 (API_SPEC 1.9): 태그·서식을 뺀 순수 글자 기준 */
export const BODY_TEXT_MAX = 10_000;
/** 저장되는 HTML 문자열 최대 길이 (API_SPEC 1.9) */
export const BODY_HTML_MAX = 100_000;
/** 소개글: 순수 글자 200자, 저장 HTML 1,000자 (API_SPEC 2장) */
export const BIO_TEXT_MAX = 200;
export const BIO_HTML_MAX = 1_000;

export const richTextMessages = {
  imageUploadFailed:
    '이미지를 올리지 못했습니다. 파일 형식(PNG·JPG·GIF)과 크기(20MB 이하)를 확인한 뒤 다시 시도해 주세요.',
} as const;

/** HTML 에서 태그를 뺀 글자만 꺼낸다. */
export function htmlToText(html: string): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // Froala 가 커서 위치용으로 넣는 폭 없는 공백(U+200B)은 글자로 세지 않는다
  return (doc.body.textContent ?? '').replace(/\u200b/g, '');
}

/** 순수 글자 수 */
export function textLength(html: string): number {
  return htmlToText(html).length;
}

/** 공백을 뺀 순수 글자 수 (질문 본문 15자 이상 규칙) */
export function visibleTextLength(html: string): number {
  return htmlToText(html).replace(/\s/g, '').length;
}

/** 줄바꿈이 있는 일반 텍스트를 문단 HTML 로 바꾼다. (기존 텍스트 데이터를 에디터에 넣을 때) */
export function textToHtml(text: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return text
    .split(/\n{2,}/)
    .map((block) => `<p>${escape(block).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

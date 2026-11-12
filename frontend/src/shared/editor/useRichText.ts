import { useState } from 'react';
import { BODY_HTML_MAX, BODY_TEXT_MAX, textLength, visibleTextLength } from './richText';

/**
 * 에디터 본문(HTML) 상태. 글자 수는 태그를 뺀 순수 글자 기준으로 계산한다.
 * 에디터의 글자 수 제한은 한글 입력(IME)을 막지 못하므로, 저장 전에 `limitError` 로 다시 확인한다.
 */
export function useRichText(
  initial = '',
  maxLength = BODY_TEXT_MAX,
  maxHtmlLength = BODY_HTML_MAX,
) {
  const [value, setValue] = useState(initial);
  const length = textLength(value);

  /** 본문 끝에 템플릿(HTML)을 붙인다. `confirmMessage` 가 있으면 내용이 있을 때 먼저 묻는다. */
  const appendHtml = (html: string, confirmMessage?: string) => {
    if (length > 0 && confirmMessage && !window.confirm(confirmMessage)) return;
    setValue((prev) => prev + html);
  };

  const limitError =
    length > maxLength
      ? `${maxLength.toLocaleString()}자까지 입력할 수 있습니다. (현재 ${length.toLocaleString()}자)`
      : value.length > maxHtmlLength
        ? '서식이 너무 많아 저장할 수 없습니다. 서식이나 표를 줄여 주세요.'
        : null;

  return {
    value,
    setValue,
    appendHtml,
    length,
    visibleLength: visibleTextLength(value),
    isEmpty: visibleTextLength(value) === 0,
    limitError,
  };
}

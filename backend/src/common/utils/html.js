import sanitizeHtml from 'sanitize-html';

/*
 * 에디터(Froala) 본문 HTML 정리 (API_SPEC 1.9).
 * 질문·답변·게시글·공지 본문에서 같이 쓴다.
 */

const ALLOWED_IFRAME_PREFIXES = [
  'https://www.youtube.com/embed/',
  'https://player.vimeo.com/video/',
];

const SANITIZE_OPTIONS = {
  allowedTags: [
    'p',
    'br',
    'hr',
    'span',
    'div',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'strike',
    'sub',
    'sup',
    'blockquote',
    'pre',
    'code',
    'ul',
    'ol',
    'li',
    'a',
    'img',
    'iframe',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
  ],
  allowedAttributes: {
    '*': ['class', 'style'],
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    iframe: ['src', 'width', 'height', 'allowfullscreen', 'frameborder'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan'],
  },
  allowedStyles: {
    '*': {
      'text-align': [/^(left|right|center|justify)$/],
      color: [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i],
      'background-color': [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i],
      width: [/^\d+(\.\d+)?(px|%)$/],
      height: [/^\d+(\.\d+)?(px|%)$/],
    },
  },
  // javascript:, data: 같은 위험한 주소를 막는다. 이미지도 업로드 API 가 준 URL(https)만 쓴다
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { img: ['http', 'https'], iframe: ['https'] },
  allowProtocolRelative: false,
  allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
  exclusiveFilter: (frame) =>
    frame.tag === 'iframe' &&
    !ALLOWED_IFRAME_PREFIXES.some((prefix) => (frame.attribs.src ?? '').startsWith(prefix)),
};

const HTML_ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
};

/** 허용 목록 밖의 태그·속성·주소를 지운 HTML */
export const sanitizeBodyHtml = (html) => sanitizeHtml(html, SANITIZE_OPTIONS);

/** 태그·서식을 뺀 순수 글자 (글자 수 검사용) */
export const toPlainText = (html) =>
  sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (entity) => HTML_ENTITIES[entity])
    .trim();

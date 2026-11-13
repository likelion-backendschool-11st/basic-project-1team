import sanitizeHtml from 'sanitize-html';

// 영상은 이 주소로 시작하는 플레이어 <iframe>만 남긴다 (API 명세 1.9)
const VIDEO_EMBED_PREFIXES = ['https://www.youtube.com/embed/', 'https://player.vimeo.com/video/'];

const ALLOWED_TAGS = [
  'p',
  'br',
  'hr',
  'div',
  'span',
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
  'tfoot',
  'tr',
  'th',
  'td',
];

const ALLOWED_ATTRIBUTES = {
  '*': ['class'],
  a: ['href', 'target', 'rel'],
  img: ['src', 'alt', 'width', 'height'],
  iframe: ['src', 'width', 'height', 'allowfullscreen', 'frameborder'],
  th: ['colspan', 'rowspan'],
  td: ['colspan', 'rowspan'],
};

const TEXT_ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };

const isVideoEmbedUrl = (src) => VIDEO_EMBED_PREFIXES.some((prefix) => src?.startsWith(prefix));

// 본문의 <img src> 목록. 저장 전에 이 중 사용 중인 에디터 이미지 URL을 찾는 데 쓴다
export const findImageSources = (html) => {
  const sources = [];

  sanitizeHtml(html, {
    allowedTags: ['img'],
    allowedAttributes: { img: ['src'] },
    allowedSchemesByTag: { img: ['http', 'https'] },
    exclusiveFilter: (frame) => {
      if (frame.tag === 'img' && frame.attribs.src !== undefined) {
        sources.push(frame.attribs.src);
      }

      return false;
    },
  });

  return [...new Set(sources)];
};

// 허용 목록 방식으로 정리한다. <img>는 allowedImageUrls에 있는 주소만 남긴다 (API 명세 1.9, 6장)
export const sanitizeRichText = (html, allowedImageUrls) =>
  sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['http', 'https'], iframe: ['https'] },
    exclusiveFilter: (frame) =>
      (frame.tag === 'img' && !allowedImageUrls.has(frame.attribs.src)) ||
      (frame.tag === 'iframe' && !isVideoEmbedUrl(frame.attribs.src)),
  });

// 태그·서식을 뺀 순수 글자 (API 명세 1.9 글자 수 기준)
export const toPlainText = (html) => {
  const texts = [];

  sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
    textFilter: (text) => {
      texts.push(text);

      return text;
    },
  });

  return texts.join('').replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => TEXT_ENTITIES[entity]);
};

// 이모지처럼 UTF-16 두 칸을 쓰는 글자도 1자로 센다
export const countCharacters = (text) => Array.from(text).length;

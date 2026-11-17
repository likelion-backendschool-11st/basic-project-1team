import { Mark, Node } from '@tiptap/core';
import { SPOILER_CLASS } from './richText';

/**
 * 스포일러: 고른 글자를 `<span class="spoiler">` 로 감싼다. 서버 정리 규칙이 span 의 class 를 남기므로
 * 백엔드 변경 없이 저장되고, RichTextView 가 흐리게 가렸다가 누르면 보여 준다 (REQ-BOARD-019)
 */
export const Spoiler = Mark.create({
  name: 'spoiler',
  parseHTML() {
    return [{ tag: `span.${SPOILER_CLASS}` }];
  },
  renderHTML() {
    return ['span', { class: SPOILER_CLASS }, 0];
  },
});

/** 서버가 남기는 영상 플레이어 주소 (API_SPEC 1.9) */
const VIDEO_EMBED_PREFIXES = ['https://www.youtube.com/embed/', 'https://player.vimeo.com/video/'];

const isVideoEmbedUrl = (src: string | null): src is string =>
  src !== null && VIDEO_EMBED_PREFIXES.some((prefix) => src.startsWith(prefix));

/**
 * 붙여넣은 YouTube·Vimeo 주소를 플레이어 주소로 바꾼다. 다른 사이트면 null.
 * 예: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/shorts/ID, vimeo.com/ID
 */
export function toVideoEmbedUrl(input: string): string | null {
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www\.|m\.)/, '');
  const [first, second] = url.pathname.split('/').filter(Boolean);
  const youtubeId =
    host === 'youtu.be'
      ? first
      : host === 'youtube.com' || host === 'youtube-nocookie.com'
        ? first === 'watch'
          ? url.searchParams.get('v')
          : first === 'shorts' || first === 'embed' || first === 'live'
            ? second
            : null
        : null;
  if (youtubeId && /^[\w-]{6,}$/.test(youtubeId)) {
    return `https://www.youtube.com/embed/${youtubeId}`;
  }
  const vimeoId =
    host === 'vimeo.com' ? first : host === 'player.vimeo.com' && first === 'video' ? second : null;
  if (vimeoId && /^\d+$/.test(vimeoId)) return `https://player.vimeo.com/video/${vimeoId}`;
  return null;
}

/**
 * 본문 영상: 파일 업로드 없이 영상 주소로만 넣는 플레이어(`<iframe>`) (API_SPEC 1.9).
 * 예전 에디터가 저장한 `<span class="fr-video"><iframe>` 도 그대로 읽는다.
 */
export const VideoEmbed = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return { src: { default: null } };
  },
  parseHTML() {
    return [
      {
        tag: 'iframe[src]',
        getAttrs: (element) => {
          const src = element.getAttribute('src');
          return isVideoEmbedUrl(src) ? { src } : false;
        },
      },
    ];
  },
  renderHTML({ node }) {
    return [
      'div',
      { class: 'video-embed' },
      [
        'iframe',
        {
          src: node.attrs.src as string,
          width: '640',
          height: '360',
          frameborder: '0',
          allowfullscreen: 'true',
        },
      ],
    ];
  },
});

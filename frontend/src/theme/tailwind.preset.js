import { readFileSync } from 'node:fs';

// 모든 모듈이 함께 쓰는 디자인 토큰 (Tailwind preset). Q&A(Stitch) 토큰을 기준으로, 회원·관리자에만 있던 토큰을 더했다.
// 모듈별 tailwind.config.js 는 이 preset 을 쓰고, content 와 plugin 만 따로 정한다.
const tokens = JSON.parse(readFileSync(new URL('./tokens.json', import.meta.url), 'utf-8'));

/** @type {Partial<import('tailwindcss').Config>} */
export default {
  theme: {
    extend: {
      ...tokens,
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 200ms ease-out',
      },
    },
  },
};

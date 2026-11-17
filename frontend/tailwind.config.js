import preset from './src/theme/tailwind.preset.js';

// 모듈 index.css 가 아닌 CSS(에디터 CSS, 라이브러리 CSS 등)를 처리할 때 쓰는 기본 설정.
// 모듈 화면의 스타일은 각 모듈 tailwind.config.js 가 만든다.
/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: ['./src/shared/**/*.{ts,tsx}'],
};

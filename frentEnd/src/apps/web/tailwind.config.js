import { readFileSync } from 'node:fs';

// Design tokens extracted from the Stitch project (GAMERS QnA Platform).
// Single source of truth: src/theme/style-guide.json
const { theme } = JSON.parse(
  readFileSync(new URL('./theme/style-guide.json', import.meta.url), 'utf-8'),
);

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: { relative: true, files: ['./**/*.{ts,tsx}'] },
  theme: {
    extend: {
      colors: theme.colors,
      borderRadius: theme.borderRadius,
      spacing: theme.spacing,
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize,
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
  plugins: [],
};

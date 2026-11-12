import preset from '../../theme/tailwind.preset.js';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: {
    relative: true,
    files: [
      './**/*.{ts,tsx}',
      '../qna/**/*.{ts,tsx}',
      '../board/**/*.{ts,tsx}',
      '../web/**/*.{ts,tsx}',
      '../../shared/**/*.{ts,tsx}',
    ],
  },
  plugins: [],
};

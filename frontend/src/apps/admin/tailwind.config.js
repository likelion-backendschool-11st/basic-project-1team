import forms from '@tailwindcss/forms';
import preset from '../../theme/tailwind.preset.js';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: { relative: true, files: ['./**/*.{ts,tsx}', '../../shared/**/*.{ts,tsx}'] },
  plugins: [forms],
};

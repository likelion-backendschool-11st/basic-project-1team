// Tokens synced from Stitch via .claude/skills/react-components/resources/style-guide.json
const guide = require('./style-guide.json');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: { relative: true, files: ['./**/*.{ts,tsx}'] },
  theme: {
    extend: {
      colors: guide.theme.colors,
      fontFamily: { sans: guide.theme.typography.sans },
      borderRadius: guide.theme.radius,
      maxWidth: { container: guide.theme.spacing['container-max'] },
    },
  },
  plugins: [],
};

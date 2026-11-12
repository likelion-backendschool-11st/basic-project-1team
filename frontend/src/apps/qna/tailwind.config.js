/** @type {import('tailwindcss').Config} */
// Design tokens synced from Stitch project 5800172365831750495 (see .stitch/metadata.json)
export default {
  darkMode: 'class',
  content: { relative: true, files: ['./**/*.{ts,tsx}'] },
  theme: {
    extend: {
      "colors": {
        "background": "#121314",
        "canvas": "#010102",
        "error": "#ffb4ab",
        "error-container": "#93000a",
        "hairline": "#23252a",
        "hairline-strong": "#34343a",
        "hairline-tertiary": "#3e3e44",
        "ink": "#f7f8f8",
        "ink-muted": "#d0d6e0",
        "ink-subtle": "#8a8f98",
        "ink-tertiary": "#62666d",
        "inverse-on-surface": "#303031",
        "inverse-primary": "#4854bb",
        "inverse-surface": "#e3e2e3",
        "on-background": "#e3e2e3",
        "on-error": "#690005",
        "on-error-container": "#ffdad6",
        "on-primary": "#ffffff",
        "on-primary-container": "#fdfaff",
        "on-primary-fixed": "#000965",
        "on-primary-fixed-variant": "#2e3aa2",
        "on-secondary": "#00390f",
        "on-secondary-container": "#00320c",
        "on-secondary-fixed": "#002106",
        "on-secondary-fixed-variant": "#00531a",
        "on-surface": "#e3e2e3",
        "on-surface-variant": "#c6c5d5",
        "on-tertiary": "#482900",
        "on-tertiary-container": "#fffaf8",
        "on-tertiary-fixed": "#2b1700",
        "on-tertiary-fixed-variant": "#673d00",
        "outline": "#908f9e",
        "outline-variant": "#454652",
        "primary": "#bdc2ff",
        "primary-container": "#5e6ad2",
        "primary-fixed": "#dfe0ff",
        "primary-fixed-dim": "#bdc2ff",
        "primary-focus": "#5e69d1",
        "primary-hover": "#828fff",
        "secondary": "#66df74",
        "secondary-container": "#27a644",
        "secondary-fixed": "#83fc8e",
        "secondary-fixed-dim": "#66df74",
        "semantic-danger": "#eb5757",
        "semantic-danger-border": "#4e2328",
        "semantic-danger-surface": "#231517",
        "semantic-overlay": "#000000",
        "semantic-success": "#27a644",
        "semantic-success-border": "#1b4d29",
        "semantic-success-surface": "#0d1f14",
        "surface": "#121314",
        "surface-1": "#0f1011",
        "surface-2": "#141516",
        "surface-3": "#18191a",
        "surface-4": "#191a1b",
        "surface-bright": "#39393a",
        "surface-container": "#1f2021",
        "surface-container-high": "#292a2b",
        "surface-container-highest": "#343536",
        "surface-container-low": "#1b1c1d",
        "surface-container-lowest": "#0d0e0f",
        "surface-dim": "#121314",
        "surface-tint": "#bdc2ff",
        "surface-variant": "#343536",
        "tertiary": "#ffb867",
        "tertiary-container": "#a56500",
        "tertiary-fixed": "#ffddbb",
        "tertiary-fixed-dim": "#ffb867"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "space-xl": "2rem",
        "margin": "1.5rem",
        "gutter": "1rem",
        "space-2xl": "3rem",
        "space-xxs": "0.25rem",
        "space-lg": "1.5rem",
        "space-xs": "0.5rem",
        "space-sm": "0.75rem",
        "space-md": "1rem"
      },
      "fontFamily": {
        "code-inline": [
          "JetBrains Mono"
        ],
        "caption": [
          "Inter"
        ],
        "headline-md": [
          "Inter"
        ],
        "body-sm": [
          "Inter"
        ],
        "body-md": [
          "Inter"
        ],
        "body-lg": [
          "Inter"
        ],
        "code-block": [
          "JetBrains Mono"
        ],
        "label-md": [
          "Inter"
        ],
        "display-lg-mobile": [
          "Inter"
        ],
        "headline-lg": [
          "Inter"
        ],
        "display-lg": [
          "Inter"
        ],
        "label-sm": [
          "Inter"
        ],
        "headline-sm": [
          "Inter"
        ]
      },
      "fontSize": {
        "code-inline": [
          "12px",
          {
            "lineHeight": "16px",
            "letterSpacing": "0px",
            "fontWeight": "400"
          }
        ],
        "caption": [
          "12px",
          {
            "lineHeight": "16px",
            "letterSpacing": "0.1px",
            "fontWeight": "400"
          }
        ],
        "headline-md": [
          "20px",
          {
            "lineHeight": "28px",
            "letterSpacing": "-0.3px",
            "fontWeight": "600"
          }
        ],
        "body-sm": [
          "13px",
          {
            "lineHeight": "18px",
            "letterSpacing": "0px",
            "fontWeight": "400"
          }
        ],
        "body-md": [
          "14px",
          {
            "lineHeight": "22px",
            "letterSpacing": "-0.05px",
            "fontWeight": "400"
          }
        ],
        "body-lg": [
          "16px",
          {
            "lineHeight": "26px",
            "letterSpacing": "-0.1px",
            "fontWeight": "400"
          }
        ],
        "code-block": [
          "13px",
          {
            "lineHeight": "20px",
            "letterSpacing": "0px",
            "fontWeight": "400"
          }
        ],
        "label-md": [
          "13px",
          {
            "lineHeight": "16px",
            "letterSpacing": "0px",
            "fontWeight": "500"
          }
        ],
        "display-lg-mobile": [
          "26px",
          {
            "lineHeight": "32px",
            "letterSpacing": "-0.6px",
            "fontWeight": "600"
          }
        ],
        "headline-lg": [
          "24px",
          {
            "lineHeight": "32px",
            "letterSpacing": "-0.5px",
            "fontWeight": "600"
          }
        ],
        "display-lg": [
          "36px",
          {
            "lineHeight": "44px",
            "letterSpacing": "-1.0px",
            "fontWeight": "600"
          }
        ],
        "label-sm": [
          "11px",
          {
            "lineHeight": "14px",
            "letterSpacing": "0.4px",
            "fontWeight": "600"
          }
        ],
        "headline-sm": [
          "16px",
          {
            "lineHeight": "24px",
            "letterSpacing": "-0.2px",
            "fontWeight": "600"
          }
        ]
      }
    },
  },
  plugins: [],
};

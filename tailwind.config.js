/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wire: {
          bg: 'var(--wire-bg)',
          panel: 'var(--wire-panel)',
          border: 'var(--wire-border)',
          text: 'var(--wire-text)',
          muted: 'var(--wire-muted)',
          accent: 'var(--wire-accent)',
          hover: 'var(--wire-hover)',
          canvas: 'var(--wire-canvas)',
        },
      },
      fontFamily: {
        sketch: ['"Comic Sans MS"', '"Sketchy"', 'cursive'],
        mono: ['"SF Mono"', '"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
}

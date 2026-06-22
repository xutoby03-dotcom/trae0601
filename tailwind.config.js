/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        'roboto-mono': ['"Roboto Mono"', 'monospace'],
      },
      colors: {
        field: {
          dark: '#0a0f0d',
          base: '#1a472a',
          light: '#1d5230',
        },
        offense: '#ff6b35',
        defense: '#0077b6',
        disc: '#ffd60a',
        'transfer-good': '#38b000',
        'transfer-great': '#9ef01a',
        'transfer-excellent': '#ffd60a',
        fake: '#d00000',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { filter: 'drop-shadow(0 0 5px currentColor)' },
          '100%': { filter: 'drop-shadow(0 0 15px currentColor)' },
        },
      },
    },
  },
  plugins: [],
};

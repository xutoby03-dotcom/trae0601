/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        indigo: {
          900: "#0f1f36",
          800: "#1e3a5f",
          700: "#2a4d7a",
        },
        copper: {
          50: "#faf5ef",
          100: "#f0e2cf",
          200: "#e5c9a6",
          300: "#d4a574",
          400: "#c48a4e",
          500: "#a86d3a",
        },
        cinnabar: {
          500: "#c44536",
          400: "#d65b4d",
          100: "#fbe0dc",
        },
        celadon: {
          500: "#4a7c59",
          400: "#5d9970",
          100: "#dbe8df",
        },
        parchment: {
          50: "#f8f4ec",
          100: "#f0e8d9",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', '"Source Han Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'inset-copper': 'inset 0 1px 0 0 rgba(212, 165, 116, 0.2)',
        'glow-copper': '0 0 20px rgba(212, 165, 116, 0.3)',
        'glow-red': '0 0 16px rgba(196, 69, 54, 0.4)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 165, 116, 0.4)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(212, 165, 116, 0.2)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out',
      },
    },
  },
  plugins: [],
};

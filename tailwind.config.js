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
        teal: {
          primary: '#0D7377',
          light: '#CCFBF1',
          dark: '#0A5C5F',
        },
        warn: {
          DEFAULT: '#E8590C',
          light: '#FFF7ED',
        },
        steel: '#6B7280',
        surface: '#F7F8FA',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Noto Sans SC', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fade-in-up 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(232, 89, 12, 0.4)' },
          '70%': { boxShadow: '0 0 0 6px rgba(232, 89, 12, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(232, 89, 12, 0)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

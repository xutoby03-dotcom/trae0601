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
        primary: {
          50: '#f0f4f9',
          100: '#dde7f2',
          200: '#b5cbe4',
          300: '#83a8d0',
          400: '#5081b7',
          500: '#2f639b',
          600: '#1f4d7f',
          700: '#1a365d',
          800: '#172d4d',
          900: '#162841',
        },
        gold: {
          50: '#fdf8e7',
          100: '#faeec3',
          200: '#f5dd8a',
          300: '#efc54e',
          400: '#e8af2a',
          500: '#d4a017',
          600: '#b58310',
          700: '#91650f',
          800: '#775213',
          900: '#654413',
        },
        seal: {
          red: '#c53030',
          bg: '#f7f5f2',
          paper: '#faf8f5',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'seal': '0 1px 3px rgba(26, 54, 93, 0.08), 0 1px 2px rgba(26, 54, 93, 0.06)',
        'seal-hover': '0 4px 12px rgba(26, 54, 93, 0.12), 0 2px 4px rgba(26, 54, 93, 0.08)',
      },
      animation: {
        'pulse-red': 'pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-red': {
          '0%, 100%': { backgroundColor: 'rgba(197, 48, 48, 0.1)' },
          '50%': { backgroundColor: 'rgba(197, 48, 48, 0.25)' },
        },
      },
    },
  },
  plugins: [],
};

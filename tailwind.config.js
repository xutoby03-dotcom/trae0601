/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f8f7f4',
          100: '#e8e6e1',
          200: '#d1cec6',
          300: '#b3ae9f',
          400: '#9a9385',
          500: '#847b6c',
          600: '#6e6658',
          700: '#5a5348',
          800: '#4a443c',
          900: '#3e3931',
          950: '#1a1b2e',
        },
        amber: {
          400: '#e8a838',
          500: '#d4952e',
        },
        mint: {
          400: '#4ecdc4',
          500: '#3ab8af',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Source Sans 3', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

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
          50: '#f0f7f3',
          100: '#daebe0',
          200: '#b8d7c2',
          300: '#8cbe9e',
          400: '#5fa07a',
          500: '#3f8560',
          600: '#2d6a48',
          700: '#1a4d2e',
          800: '#143d24',
          900: '#0f2d1a',
        },
        accent: {
          50: '#fdf8f2',
          100: '#f8ecd8',
          200: '#f0d7b0',
          300: '#e7bd84',
          400: '#dba85e',
          500: '#d4a574',
          600: '#c48a4a',
          700: '#a36e36',
          800: '#84582c',
          900: '#6b4726',
        },
        background: {
          DEFAULT: '#faf8f5',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'Times', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

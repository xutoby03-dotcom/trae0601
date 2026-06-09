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
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        cny: {
          red: '#DC2626',
          gold: '#D97706',
          cream: '#FFFBEB',
          brown: '#44403C',
        },
      },
    },
  },
  plugins: [],
};

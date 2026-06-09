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
        sans: ['"Noto Sans SC"', '"DM Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"DM Sans"', 'monospace'],
      },
      colors: {
        brand: {
          sky: '#0EA5E9',
          orange: '#F97316',
          mint: '#34D399',
          coral: '#F43F5E',
        },
      },
    },
  },
  plugins: [],
};

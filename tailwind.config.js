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
        sealant: {
          bg: "#12122a",
          card: "#22223a",
          surface: "#1a1a30",
          amber: "#e8a838",
          teal: "#6b8f9e",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "Georgia", "serif"],
        sans: ['"Noto Sans SC"', "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

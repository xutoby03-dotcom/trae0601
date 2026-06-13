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
        serif: [
          "Noto Serif SC",
          "STSong",
          "SimSun",
          "Georgia",
          "serif",
        ],
        sans: [
          "Noto Sans SC",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
      colors: {
        board: {
          brown: "#3E2723",
          gold: "#D4A84B",
          ivory: "#FAF3E0",
          green: "#2E5D4B",
          red: "#B5544A",
          dark: "#1a1209",
          card: "#2a1f14",
          cardLight: "#352818",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

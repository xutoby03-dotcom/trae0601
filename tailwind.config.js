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
        soup: {
          50: "#FFF8E1",
          100: "#FFECB3",
          200: "#FFE082",
          300: "#FFD54F",
          400: "#FFCA28",
          500: "#FFB300",
          600: "#FF8F00",
          700: "#FF6F00",
        },
        fire: {
          50: "#FBE9E7",
          100: "#FFCCBC",
          200: "#FFAB91",
          300: "#FF8A65",
          400: "#FF7043",
          500: "#FF5722",
          600: "#F4511E",
          700: "#E64A19",
        },
        broth: {
          50: "#EFEBE9",
          100: "#D7CCC8",
          200: "#BCAAA4",
          300: "#A1887F",
          400: "#8D6E63",
          500: "#795548",
          600: "#6D4C41",
          700: "#5D4037",
          800: "#4E342E",
          900: "#3E2723",
        },
      },
      fontFamily: {
        display: ['"Noto Serif SC"', '"Source Han Serif SC"', '"Songti SC"', "serif"],
        body: ['"Noto Sans SC"', '"Source Han Sans SC"', '"PingFang SC"', "sans-serif"],
      },
      boxShadow: {
        warm: "0 4px 20px rgba(93, 64, 55, 0.12)",
        warmer: "0 8px 32px rgba(93, 64, 55, 0.18)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "steam": "steam 3s ease-in-out infinite",
      },
      keyframes: {
        steam: {
          "0%, 100%": { transform: "translateY(0) scale(1)", opacity: "0.6" },
          "50%": { transform: "translateY(-8px) scale(1.05)", opacity: "0.3" },
        },
      },
    },
  },
  plugins: [],
};

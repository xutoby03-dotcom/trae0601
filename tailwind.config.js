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
        cream: {
          50: "#FFFBF5",
          100: "#FFF8F0",
          200: "#F5E9D7",
          300: "#E8D9C4",
        },
        sand: {
          100: "#F5DCC8",
          200: "#E8A87C",
          300: "#D89060",
          400: "#C47848",
        },
        forest: {
          100: "#A8C5B0",
          200: "#7BA889",
          300: "#4A7C59",
          400: "#3A6449",
        },
        coral: {
          100: "#E8A0A0",
          200: "#DC7A7A",
          300: "#C85A5A",
          400: "#B04040",
        },
        warm: {
          50: "#F5F0EB",
          100: "#E8DED2",
          200: "#D4C8BC",
          300: "#A09082",
          400: "#6B5B4F",
          500: "#4A3F35",
        },
      },
      fontFamily: {
        display: ['"ZCOOL KuaiLe"', "sans-serif"],
        body: ['"Noto Sans SC"', "sans-serif"],
      },
      animation: {
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(200, 90, 90, 0.4)" },
          "50%": { opacity: "0.9", boxShadow: "0 0 0 8px rgba(200, 90, 90, 0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

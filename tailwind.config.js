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
        walnut: {
          50: "#FAF5F0",
          100: "#F0E6D9",
          200: "#E0CCC9",
          300: "#C9A98A",
          400: "#A67C52",
          500: "#7B5B3A",
          600: "#5D4037",
          700: "#4E342E",
          800: "#3E2723",
          900: "#2D1B16",
        },
        amber: {
          500: "#FF8F00",
          600: "#EF6C00",
        },
        forest: {
          500: "#2E7D32",
          600: "#1B5E20",
        },
        slateblue: {
          500: "#455A64",
          600: "#37474F",
        },
        brick: {
          500: "#C62828",
          600: "#B71C1C",
        },
        violetpurple: {
          500: "#7B1FA2",
          600: "#6A1B9A",
        },
        cream: "#FFF8F1",
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "Georgia", "serif"],
        sans: ['"Noto Sans SC"', "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(93, 64, 55, 0.08)",
        "card-hover": "0 8px 30px rgba(93, 64, 55, 0.12)",
        "btn-raised": "0 2px 8px rgba(93, 64, 55, 0.15)",
        "btn-pressed": "0 1px 3px rgba(93, 64, 55, 0.1)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(255, 143, 0, 0.4)" },
          "70%": { boxShadow: "0 0 0 10px rgba(255, 143, 0, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(255, 143, 0, 0)" },
        },
        "urgent-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2s infinite",
        "urgent-blink": "urgent-blink 1.2s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

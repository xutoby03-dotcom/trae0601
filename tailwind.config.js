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
          50: "#f0f4f9",
          100: "#dae4f0",
          200: "#b9c9e0",
          300: "#8ea6c9",
          400: "#5c7eab",
          500: "#1e3a5f",
          600: "#1a3353",
          700: "#162b46",
          800: "#12243a",
          900: "#0e1d2e",
        },
        accent: {
          50: "#fff4ed",
          100: "#ffe4d4",
          200: "#ffc4a1",
          300: "#ff9c63",
          400: "#f97316",
          500: "#ea5a0a",
          600: "#cb4206",
          700: "#a93009",
          800: "#87290f",
          900: "#6f2510",
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-border": {
          "0%, 100%": { "box-shadow": "0 0 0 0 rgba(239, 68, 68, 0.4)" },
          "50%": { "box-shadow": "0 0 0 4px rgba(239, 68, 68, 0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out",
        "pulse-border": "pulse-border 2s infinite",
      },
    },
  },
  plugins: [],
};

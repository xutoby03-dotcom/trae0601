/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        water: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        coral: {
          50: "#fff7ed",
          100: "#ffedd5",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
      },
      fontFamily: {
        display: ["Noto Serif SC", "serif"],
        sans: ["Noto Sans SC", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        "ripple-bg": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "bubble-up": {
          "0%": { opacity: "0", transform: "translateY(0) scale(0.6)" },
          "50%": { opacity: "0.8" },
          "100%": { opacity: "0", transform: "translateY(-60px) scale(1.2)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "fade-slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "ripple-bg": "ripple-bg 8s ease-in-out infinite",
        "bubble-up": "bubble-up 1.8s ease-out forwards",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "fade-slide-up": "fade-slide-up 0.4s ease-out both",
        "scale-in": "scale-in 0.25s ease-out both",
      },
      boxShadow: {
        "soft-glow": "0 8px 32px rgba(12, 74, 110, 0.12)",
        "card-hover": "0 16px 40px -8px rgba(12, 74, 110, 0.22)",
      },
      backgroundImage: {
        "water-gradient": "linear-gradient(135deg, #e0f2fe 0%, #eff6ff 50%, #f0fdfa 100%)",
      },
    },
  },
  plugins: [],
};

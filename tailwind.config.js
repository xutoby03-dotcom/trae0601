/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        brand: {
          50: "#F0F9F7",
          100: "#D7EEE9",
          200: "#AFDDD4",
          300: "#7EC7BB",
          400: "#4DAFA0",
          500: "#2A9D8F",
          600: "#218074",
          700: "#1B675D",
          800: "#17534C",
          900: "#12403B",
        },
        warm: {
          50: "#F8F5F0",
          100: "#F0E9DD",
          200: "#E2D3BA",
          300: "#D2B992",
          400: "#C19F6D",
          500: "#B2874E",
        },
        accent: {
          orange: "#E9C46A",
          red: "#E76F51",
          blue: "#264653",
        },
      },
      fontFamily: {
        sans: [
          '"Noto Sans SC"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 4px 20px -4px rgba(38, 70, 83, 0.10)",
        card: "0 8px 32px -8px rgba(38, 70, 83, 0.12)",
        hover: "0 12px 40px -8px rgba(42, 157, 143, 0.20)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

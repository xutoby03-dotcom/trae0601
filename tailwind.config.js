/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        charcoal: {
          50: "#F5F5F5",
          100: "#E5E5E5",
          200: "#C9C9C9",
          300: "#9E9E9E",
          400: "#6B6B6B",
          500: "#4A4A4A",
          600: "#3A3A3A",
          700: "#2D2D2D",
          800: "#1F1F1F",
          900: "#121212",
        },
        cream: {
          50: "#FAF8F4",
          100: "#F5F0E8",
          200: "#EDE5D6",
          300: "#DED2B8",
          400: "#CCB98F",
          500: "#B89F6B",
        },
        terracotta: {
          50: "#FBF2EE",
          100: "#F7DFD4",
          200: "#EDBEA7",
          300: "#E19875",
          400: "#D47950",
          500: "#C75B39",
          600: "#B54828",
        },
        moss: {
          50: "#F1F5F2",
          100: "#DCE7DE",
          200: "#B8CEBD",
          300: "#8CB094",
          400: "#648B70",
          500: "#4A6B57",
          600: "#3A5545",
        },
        champagne: {
          50: "#FBF8F2",
          100: "#F5EFE0",
          200: "#EADCB8",
          300: "#DFC68E",
          400: "#D4B896",
          500: "#C7A77B",
        },
      },
      fontFamily: {
        display: ['"Noto Serif SC"', '"Source Han Serif SC"', '"思源宋体"', "serif"],
        sans: ['"Inter"', '"Noto Sans SC"', '"PingFang SC"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(45, 45, 45, 0.06)",
        card: "0 4px 20px rgba(45, 45, 45, 0.08)",
        hover: "0 8px 30px rgba(45, 45, 45, 0.12)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

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
        museum: {
          50: "#f7f5f0",
          100: "#f0ebe0",
          200: "#e0d5c2",
          300: "#c9b89a",
          400: "#b29a72",
          500: "#c9a962",
          600: "#a88a4d",
          700: "#8a6f3e",
          800: "#715a34",
          900: "#5d4a2c",
          950: "#332816",
        },
        deep: {
          50: "#f0f4f4",
          100: "#d9e3e3",
          200: "#b5c7c7",
          300: "#86a3a3",
          400: "#5d8080",
          500: "#436565",
          600: "#355050",
          700: "#2c4141",
          800: "#263636",
          900: "#1a3a3a",
          950: "#0f2323",
        },
        jade: {
          400: "#3d9970",
          500: "#2d7a4f",
          600: "#246240",
        },
        coral: {
          400: "#e8957d",
          500: "#e07b5f",
          600: "#c96348",
        },
      },
      fontFamily: {
        serif: ['"Source Han Serif SC"', '"Songti SC"', '"SimSun"', "Georgia", "serif"],
        sans: ['"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', '"Heiti SC"', "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "bounce-soft": "bounceSoft 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
    },
  },
  plugins: [],
};

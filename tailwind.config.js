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
          50: "#FFF4EC",
          100: "#FFE4D0",
          200: "#FFC79E",
          300: "#FCA86A",
          400: "#F28C47",
          500: "#E87A3F",
          600: "#CC5E2A",
          700: "#A84820",
          800: "#87391C",
          900: "#6E2F19",
        },
        forest: {
          50: "#EDF4EF",
          100: "#D4E5DA",
          200: "#A8CBB3",
          300: "#73AE86",
          400: "#498E60",
          500: "#2D5A3D",
          600: "#234831",
          700: "#1C3A28",
          800: "#172F21",
          900: "#13261B",
        },
        cream: {
          50: "#FEFCF9",
          100: "#FDF8F3",
          200: "#FAF0E3",
          300: "#F5E3CC",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "serif"],
        sans: ['"PingFang SC"', '"Microsoft YaHei"', "sans-serif"],
      },
      boxShadow: {
        book: "0 4px 14px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
        "book-hover": "0 10px 25px rgba(0,0,0,0.12), 0 3px 6px rgba(0,0,0,0.08)",
        cabinet:
          "inset 0 2px 4px rgba(139,69,19,0.15), 0 4px 12px rgba(0,0,0,0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

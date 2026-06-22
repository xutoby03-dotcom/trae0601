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
          50: "#FBF7F2",
          100: "#F5EDE4",
          200: "#EADBC8",
          300: "#DCC3A6",
        },
        rose: {
          gold: "#C9A17B",
          goldLight: "#D4B48F",
          goldDark: "#A8845F",
        },
        espresso: {
          DEFAULT: "#4A3728",
          light: "#6B5040",
          dark: "#2E2016",
        },
        risk: {
          dullness: "#6B6B6B",
          redness: "#D97059",
          shine: "#E8E0D0",
          colorShift: "#8B6AAE",
        },
        light: {
          natural: "#FFF4E0",
          warm: "#FFB060",
          cool: "#A8C5E8",
          mixed: "#D4B896",
        },
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        serif: ["Source Serif Pro", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 4px 24px -8px rgba(74, 55, 40, 0.15), 0 1px 3px rgba(74, 55, 40, 0.08)",
        cardHover: "0 12px 40px -12px rgba(74, 55, 40, 0.25), 0 2px 6px rgba(74, 55, 40, 0.1)",
        inset: "inset 0 1px 2px rgba(74, 55, 40, 0.06)",
      },
      borderRadius: {
        lg: "14px",
        xl: "20px",
      },
    },
  },
  plugins: [],
};

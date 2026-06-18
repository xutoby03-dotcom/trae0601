/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        forest: {
          50: "#F4F8EF",
          100: "#E6EFDB",
          200: "#C9DDB5",
          300: "#A3C685",
          400: "#7BAC59",
          500: "#5C923E",
          600: "#45742E",
          700: "#2D5016",
          800: "#1F3A0F",
          900: "#1A2E0F",
        },
        earth: {
          50: "#FDF4EC",
          100: "#F8E0CB",
          200: "#F0BD93",
          300: "#E5955B",
          400: "#D97237",
          500: "#C4652A",
          600: "#A74F20",
          700: "#873D1B",
          800: "#6B3219",
          900: "#572B18",
        },
        sky2: {
          50: "#EDF6F8",
          100: "#D3E9EF",
          200: "#A7D2DE",
          300: "#73B4C7",
          400: "#4A90A4",
          500: "#3B7486",
          600: "#335E6E",
          700: "#2E4D5B",
          800: "#2A414C",
          900: "#273741",
        },
        cream: "#FAF7F2",
        sand: "#F0EAE0",
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
        serif: ['"Noto Serif SC"', "Georgia", "serif"],
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "count-up": "count-up 0.6s ease-out",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(45, 80, 22, 0.08)",
        card: "0 4px 24px rgba(45, 80, 22, 0.06)",
        hover: "0 8px 32px rgba(45, 80, 22, 0.12)",
      },
    },
  },
  plugins: [],
};

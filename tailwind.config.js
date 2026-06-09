/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "16px",
        sm: "24px",
        lg: "32px",
      },
    },
    extend: {
      fontFamily: {
        display: ["Quicksand", "Noto Sans SC", "sans-serif"],
        body: ["Noto Sans SC", "Quicksand", "sans-serif"],
      },
      colors: {
        warm: {
          50: "#FFF8F0",
          100: "#FFECD2",
          200: "#FFD9A5",
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "slide-up": "slide-up 0.4s ease-out forwards",
        "count-up": "count-up 1.2s ease-out forwards",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "count-up": {
          from: { opacity: "0", transform: "scale(0.5)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

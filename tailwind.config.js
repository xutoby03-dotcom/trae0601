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
        ocean: {
          50: "#E8F4F8",
          100: "#C5DEE8",
          200: "#8FB9CD",
          300: "#5A93B1",
          400: "#346D8E",
          500: "#0F3460",
          600: "#0C2A4E",
          700: "#09203C",
          800: "#061629",
          900: "#030C17",
          950: "#01060B",
        },
        alert: {
          warning: "#E94560",
          safe: "#16C79A",
          caution: "#FFD93D",
          fog: "#8395A7",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        sans: ['"Noto Sans SC"', "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(15, 52, 96, 0.5)",
        "glow-warning": "0 0 20px rgba(233, 69, 96, 0.5)",
        "glow-safe": "0 0 20px rgba(22, 199, 154, 0.5)",
        "glow-caution": "0 0 20px rgba(255, 217, 61, 0.5)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        blink: "blink 1.5s ease-in-out infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
    },
  },
  plugins: [],
};

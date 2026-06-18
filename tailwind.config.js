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
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#FF8C42",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
        },
        cream: {
          50: "#FFFBF5",
          100: "#FFF7ED",
          200: "#FDECD8",
        },
        success: {
          400: "#5CC9B9",
          500: "#4DB6AC",
          600: "#3FA89E",
        },
        danger: {
          400: "#F76A67",
          500: "#EF5350",
          600: "#E53935",
        },
        brown: {
          50: "#EFEBE9",
          100: "#D7CCC8",
          700: "#5D4037",
          800: "#4E342E",
          900: "#3E2723",
        },
      },
      fontFamily: {
        display: ['"Poppins"', '"Noto Sans SC"', "system-ui", "sans-serif"],
        body: ['"Noto Sans SC"', '"PingFang SC"', "system-ui", "sans-serif"],
      },
      keyframes: {
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(255, 140, 66, 0.5)" },
          "70%": { boxShadow: "0 0 0 12px rgba(255, 140, 66, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(255, 140, 66, 0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(32px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "danger-blink": {
          "0%, 100%": { borderColor: "rgba(239, 83, 80, 0.3)" },
          "50%": { borderColor: "rgba(239, 83, 80, 1)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        "slide-in-right": "slide-in-right 0.4s ease-out both",
        "danger-blink": "danger-blink 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

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
        copper: {
          50: "#FFF8E7",
          100: "#FDECC7",
          200: "#F5D08A",
          300: "#ECB159",
          400: "#E29335",
          500: "#D2691E",
          600: "#B85A18",
          700: "#944613",
          800: "#6E330E",
          900: "#4A2109",
        },
        espresso: {
          50: "#EFEBE9",
          100: "#D7CCC8",
          200: "#BCAAA4",
          300: "#8D6E63",
          400: "#6D4C41",
          500: "#5D4037",
          600: "#4E342E",
          700: "#3E2723",
          800: "#2D1B17",
          900: "#1A0F0D",
        },
        cream: "#FFF8E7",
        warn: "#FF8C42",
        danger: "#E53935",
        success: "#43A047",
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        sans: ['"Noto Sans SC"', "sans-serif"],
      },
      keyframes: {
        pulseWarn: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        pulseDanger: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(229,57,53,0.7)" },
          "50%": { opacity: "0.8", boxShadow: "0 0 20px 8px rgba(229,57,53,0.3)" },
        },
      },
      animation: {
        pulseWarn: "pulseWarn 1.2s ease-in-out infinite",
        pulseDanger: "pulseDanger 0.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        primary: {
          50: "#FFF5F0",
          100: "#FFE8DC",
          200: "#FFD1BC",
          300: "#FFB08C",
          400: "#FF8A57",
          500: "#FF6B35",
          600: "#FF4D0F",
          700: "#E03F00",
          800: "#B33200",
          900: "#802400",
        },
        warm: {
          50: "#FFFDF8",
          100: "#FFF9ED",
          200: "#FFF2D6",
          300: "#FFE8B3",
          400: "#FFD980",
          500: "#FFC94D",
        },
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          500: "#22C55E",
          600: "#16A34A",
        },
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B",
          600: "#D97706",
        },
        danger: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          500: "#EF4444",
          600: "#DC2626",
        },
        info: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#3B82F6",
          600: "#2563EB",
        },
      },
      fontFamily: {
        sans: [
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 4px 16px rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};

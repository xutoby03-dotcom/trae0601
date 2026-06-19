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
          50: "#FFF4E6",
          100: "#FFE4CC",
          200: "#FFCC99",
          300: "#FFB366",
          400: "#FF9933",
          500: "#E85D04",
          600: "#CC5200",
          700: "#993D00",
          800: "#662900",
          900: "#331400",
        },
        success: {
          50: "#E8F5EF",
          100: "#C8E6D6",
          500: "#2D6A4F",
          600: "#1B4332",
          700: "#081C15",
        },
        danger: {
          50: "#FFE5E5",
          100: "#FFCCCC",
          500: "#D00000",
          600: "#9D0208",
          700: "#6A040F",
        },
        warning: {
          50: "#FFF8E1",
          100: "#FFECB3",
          500: "#F48C06",
          600: "#DC2F02",
        },
        warm: {
          50: "#FFFBF5",
          100: "#FEF3E2",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "Georgia", "serif"],
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(232, 93, 4, 0.08)",
        "card-hover": "0 8px 30px rgba(232, 93, 4, 0.15)",
      },
    },
  },
  plugins: [],
};

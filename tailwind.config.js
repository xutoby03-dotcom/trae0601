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
        navy: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#829ab1",
          500: "#627d98",
          600: "#486581",
          700: "#334e68",
          800: "#1e3a5f",
          900: "#102a43",
        },
        gold: {
          50: "#fdf8ec",
          100: "#f9edc6",
          200: "#f3dfa0",
          300: "#eccd78",
          400: "#e2b964",
          500: "#d4a853",
          600: "#b98c3d",
          700: "#9a6f2b",
          800: "#7b551d",
          900: "#624013",
        },
      },
      fontFamily: {
        serif: ['"Source Han Serif SC"', '"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Source Han Sans SC"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(30, 58, 95, 0.08), 0 1px 2px -1px rgba(30, 58, 95, 0.06)",
        "card-hover": "0 10px 15px -3px rgba(30, 58, 95, 0.1), 0 4px 6px -4px rgba(30, 58, 95, 0.08)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease-out both",
        "fade-in": "fadeIn 0.4s ease-out both",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

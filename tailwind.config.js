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
          50: "#f0f5fa",
          100: "#dce7f2",
          200: "#b8cfe5",
          300: "#8bb1d3",
          400: "#598cbc",
          500: "#3a6ea5",
          600: "#2a5689",
          700: "#1e3a5f",
          800: "#1a3352",
          900: "#182d47",
          950: "#0f1e30",
        },
        accent: {
          50: "#fff8eb",
          100: "#ffefcc",
          200: "#ffdc90",
          300: "#ffc54d",
          400: "#ffae1f",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
      },
      fontFamily: {
        sans: [
          '"Source Han Sans SC"',
          '"Noto Sans SC"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

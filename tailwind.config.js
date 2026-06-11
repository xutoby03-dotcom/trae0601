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
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#829ab1",
          500: "#627d98",
          600: "#486581",
          700: "#334e68",
          800: "#243b53",
          900: "#1e3a5f",
          950: "#102a43",
        },
        success: {
          50: "#eafaf1",
          100: "#d4efdf",
          500: "#27ae60",
          600: "#229954",
          700: "#1e8449",
        },
        warning: {
          50: "#fef5e7",
          100: "#fdebd0",
          500: "#f39c12",
          600: "#e67e22",
          700: "#d35400",
        },
        danger: {
          50: "#fdedec",
          100: "#fadbd8",
          500: "#e74c3c",
          600: "#cb4335",
          700: "#b03a2e",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "Georgia", "serif"],
        sans: ['"Inter"', "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Noto Sans", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 8px 24px rgba(0, 0, 0, 0.1)",
        "card-danger": "0 2px 8px rgba(231, 76, 60, 0.15)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-subtle": "bounce 2s infinite",
      },
      scale: {
        '98': '0.98',
      },
    },
  },
  plugins: [],
};

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
        brand: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#78350F",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "ui-serif", "Georgia", "serif"],
        sans: ['"Noto Sans SC"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px -2px rgba(120, 53, 15, 0.08), 0 4px 16px -4px rgba(120, 53, 15, 0.06)",
        "card-hover": "0 8px 24px -4px rgba(120, 53, 15, 0.12), 0 16px 40px -8px rgba(120, 53, 15, 0.08)",
      },
    },
  },
  plugins: [],
};

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
        forest: {
          50: "#f0f7f4",
          100: "#dbece2",
          200: "#b8d8c5",
          300: "#8bbd9f",
          400: "#5b9c77",
          500: "#3a805a",
          600: "#286747",
          700: "#1B4332",
          800: "#16382a",
          900: "#112d22",
          950: "#0a1a14",
        },
        copper: {
          50: "#fbf6f0",
          100: "#f4ead9",
          200: "#e8d2b1",
          300: "#dab382",
          400: "#cf9054",
          500: "#C77B30",
          600: "#b3632a",
          700: "#934b24",
          800: "#773e24",
          900: "#623521",
          950: "#351910",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(27, 67, 50, 0.08)',
        'lift': '0 8px 24px rgba(27, 67, 50, 0.12)',
        'copper': '0 4px 16px rgba(199, 123, 48, 0.25)',
      },
    },
  },
  plugins: [],
};

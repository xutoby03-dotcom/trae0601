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
          100: "#dcebe4",
          200: "#b9d7c9",
          300: "#8bbca7",
          400: "#5d9a83",
          500: "#3f7d67",
          600: "#2d7a57",
          700: "#1f523d",
          800: "#163d2d",
          900: "#0f2a1f",
          950: "#0a1f17",
        },
        moss: {
          400: "#4ade80",
          500: "#22c55e",
        },
        cream: {
          DEFAULT: "#fef3c7",
          100: "#fffbeb",
        },
        amber: {
          400: "#fbbf24",
          500: "#d97706",
          600: "#b45309",
        },
        rust: {
          500: "#ef4444",
        },
        slate: {
          panel: "#1e293b",
        },
        "mist-blue": "#38bdf8",
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Georgia', 'serif'],
        body: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'Monaco', 'monospace'],
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sonar-ping': 'sonar-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'float-in': 'float-in 0.5s ease-out forwards',
        'bounce-in': 'bounce-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '50%': { transform: 'scale(1.1)', opacity: '0.4' },
          '100%': { transform: 'scale(0.8)', opacity: '0.8' },
        },
        'sonar-ping': {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(3)', opacity: '0' },
        },
        'float-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

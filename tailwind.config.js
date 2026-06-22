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
        ink: {
          950: "#0c0a09",
          900: "#1c1917",
          800: "#292524",
          700: "#3f3b37",
          600: "#57534e",
          500: "#78716c",
          400: "#a8a29e",
          300: "#d6d3d1",
          200: "#e7e5e4",
          100: "#f5f5f4",
          50: "#fafaf9",
        },
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        jade: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
        },
        ruby: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'gold-sm': '0 1px 2px 0 rgba(217, 119, 6, 0.15), 0 0 0 1px rgba(217, 119, 6, 0.2)',
        'gold': '0 4px 16px -2px rgba(217, 119, 6, 0.25), 0 0 0 1px rgba(217, 119, 6, 0.3)',
        'card': '0 8px 32px -8px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(217, 119, 6, 0.12)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ruby': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.5)' },
          '50%': { boxShadow: '0 0 0 6px rgba(220, 38, 38, 0)' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(217, 119, 6, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(217, 119, 6, 0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
        'pulse-ruby': 'pulse-ruby 2s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        teal: {
          50: "#f0f9f9",
          100: "#ccf0f1",
          200: "#99e1e3",
          300: "#66d2d5",
          400: "#33c3c7",
          500: "#0DB4B9",
          600: "#0D7377",
          700: "#0A5A5D",
          800: "#074043",
          900: "#052B2D",
        },
        orange: {
          50: "#fff3ed",
          100: "#ffdcc7",
          200: "#ffb88f",
          300: "#ff9557",
          400: "#FF7A33",
          500: "#FF6B35",
          600: "#E55A2A",
          700: "#B84620",
        },
        cream: {
          50: "#FDFBF5",
          100: "#F7F3E9",
          200: "#EFE7D4",
        },
        ink: {
          50: "#f5f5f5",
          100: "#e0e0e0",
          200: "#a6a6a6",
          300: "#6b6b6b",
          400: "#4a4a4a",
          500: "#2D2D2D",
          600: "#1F1F1F",
          700: "#141414",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: "0 2px 8px rgba(13, 115, 119, 0.06), 0 8px 24px rgba(13, 115, 119, 0.08)",
        cardHover: "0 4px 12px rgba(13, 115, 119, 0.1), 0 16px 40px rgba(13, 115, 119, 0.14)",
        soft: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04)",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};

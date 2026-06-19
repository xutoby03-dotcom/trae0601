/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#FEF3F2',
          100: '#FDE2E0',
          200: '#F9C5C1',
          300: '#F29A93',
          400: '#EB6C63',
          500: '#E85A4F',
          600: '#D0483D',
          700: '#AE3A30',
          800: '#903129',
          900: '#782B25',
        },
        cream: {
          50: '#FBF9F4',
          100: '#F5F0E6',
          200: '#E8DECB',
          300: '#D7C6A6',
        },
        success: {
          50: '#EAF5EE',
          100: '#CFE8D7',
          500: '#2E8B57',
          600: '#267347',
        },
        warning: {
          50: '#FEF5EC',
          100: '#FCE4CB',
          500: '#F4A261',
          600: '#E08A42',
        },
        danger: {
          50: '#FBECEC',
          100: '#F5D1D1',
          500: '#C1121F',
          600: '#A0101A',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
      },
      keyframes: {
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

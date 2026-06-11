/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        primary: {
          50: '#FFF5F0',
          100: '#FFE5D8',
          200: '#FFC9B0',
          300: '#FFA77E',
          400: '#FF8350',
          500: '#E85D3A',
          600: '#D14528',
          700: '#AF341F',
          800: '#8B2818',
          900: '#6B1F12',
        },
        warm: {
          50: '#FBF7F0',
          100: '#F5EDE0',
          200: '#EBD9BF',
          300: '#DFC099',
          400: '#D2A673',
        },
        success: {
          50: '#F0F7F3',
          100: '#DAEBE0',
          200: '#B4D7C1',
          300: '#85BE9A',
          400: '#58A374',
          500: '#2D6A4F',
          600: '#255741',
          700: '#1E4534',
        },
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

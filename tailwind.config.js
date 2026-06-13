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
          50: '#F0F4FA',
          100: '#D9E3F0',
          200: '#B3C7E0',
          300: '#7DA0C9',
          400: '#4C75AB',
          500: '#2A548A',
          600: '#1E3A5F',
          700: '#192F4D',
          800: '#15263E',
          900: '#101E30',
        },
        accent: {
          50: '#FFF1EA',
          100: '#FFE0D0',
          200: '#FFBFA1',
          300: '#FA9666',
          400: '#F26B3A',
          500: '#E64E1A',
          600: '#CC3A10',
          700: '#A92E0E',
          800: '#882610',
          900: '#6E2110',
        },
      },
      fontFamily: {
        sans: ['"Source Han Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(16, 30, 48, 0.08), 0 4px 16px rgba(16, 30, 48, 0.06)',
        'card-hover': '0 4px 12px rgba(16, 30, 48, 0.12), 0 12px 32px rgba(16, 30, 48, 0.10)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

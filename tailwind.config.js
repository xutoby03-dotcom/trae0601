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
        cream: {
          50: '#FFFBF5',
          100: '#FFF8F0',
          200: '#FFEFE0',
        },
        orange: {
          400: '#FFA561',
          500: '#FF8C42',
          600: '#F57A2E',
        },
        mint: {
          400: '#6EDDD6',
          500: '#4ECDC4',
          600: '#3DB8B0',
        },
        coral: {
          400: '#FF8A8A',
          500: '#FF6B6B',
          600: '#F05252',
        },
        lavender: {
          400: '#B0A5D9',
          500: '#9B8EC7',
          600: '#8677B8',
        },
      },
      fontFamily: {
        display: ['"ZCOOL KuaiLe"', '"Baloo 2"', 'cursive', 'system-ui'],
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px rgba(255, 140, 66, 0.1)',
        card: '0 8px 30px rgba(0, 0, 0, 0.06)',
        hover: '0 12px 40px rgba(255, 140, 66, 0.18)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

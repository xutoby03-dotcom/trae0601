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
        sky: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          500: '#4A90D9',
          600: '#3B82F6',
          700: '#2563EB',
        },
        warm: {
          50: '#FFF7E6',
          100: '#FFE4B5',
          500: '#F5A623',
          600: '#EA8C0E',
          700: '#C27803',
        },
        rain: {
          500: '#3B82F6',
        },
        night: {
          500: '#8B5CF6',
        },
        danger: {
          500: '#EF4444',
        },
      },
      fontFamily: {
        display: ['"LXGW WenKai"', '"PingFang SC"', 'sans-serif'],
        body: ['"PingFang SC"', '"Hiragino Sans GB"', 'sans-serif'],
      },
      animation: {
        'sway': 'sway 3s ease-in-out infinite',
        'rain-fall': 'rainFall 1s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        sway: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        rainFall: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100px)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

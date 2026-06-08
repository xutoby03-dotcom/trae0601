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
        brand: {
          50: '#FFF5F0',
          100: '#FFE8DB',
          200: '#FFCDB3',
          300: '#FFB08A',
          400: '#FF8C5E',
          500: '#E8652D',
          600: '#CC5020',
          700: '#A63E18',
          800: '#7D2F12',
          900: '#54200C',
        },
        surface: {
          50: '#FAF7F2',
          100: '#F5F0E8',
          200: '#EBE3D5',
          300: '#DDD2BE',
        },
        dark: {
          900: '#1A1A2E',
          800: '#2D2D44',
          700: '#3D3D5C',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(26,26,46,0.06), 0 1px 2px rgba(26,26,46,0.04)',
        'card-hover': '0 4px 12px rgba(26,26,46,0.08), 0 2px 4px rgba(26,26,46,0.04)',
        'button': '0 2px 4px rgba(232,101,45,0.2), 0 1px 2px rgba(232,101,45,0.1)',
      },
    },
  },
  plugins: [],
};

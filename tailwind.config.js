/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '24px',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        brand: {
          50: '#E8F5F0',
          100: '#C8E8DC',
          200: '#96D1BB',
          300: '#64BA99',
          400: '#3DA77D',
          500: '#2D7A5E',
          600: '#25644D',
          700: '#1D4E3C',
          800: '#15382B',
          900: '#0D221A',
        },
        warn: {
          50: '#FFF6E5',
          100: '#FFE8BF',
          200: '#FFD989',
          300: '#FFCA53',
          400: '#F5B840',
          500: '#F0A63B',
          600: '#C9862C',
          700: '#A2671E',
          800: '#7B4811',
          900: '#542A05',
        },
        danger: {
          50: '#FCE9E6',
          500: '#E05A47',
          600: '#C54230',
        },
        air: {
          excellent: '#52C41A',
          good: '#73D13D',
          moderate: '#FADB14',
          poor: '#FF7A45',
          severe: '#F5222D',
        },
        surface: {
          bg: '#F4F9F7',
          card: '#FFFFFF',
          border: '#E5EEE9',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(45,122,94,0.08)',
        'card-hover': '0 8px 28px rgba(45,122,94,0.14)',
        'btn-primary': '0 4px 14px rgba(45,122,94,0.35)',
      },
      backgroundImage: {
        'btn-primary': 'linear-gradient(135deg, #2D7A5E 0%, #3DA77D 100%)',
        'warn-stripe': 'repeating-linear-gradient(45deg, #FFF6E5, #FFF6E5 10px, #FFE8BF 10px, #FFE8BF 20px)',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        breathe: 'breathe 2s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.4, 0, 0.2, 1) both',
        'slide-in-right': 'slide-in-right 280ms cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

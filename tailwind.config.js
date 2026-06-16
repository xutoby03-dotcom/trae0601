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
          50: '#FFF5EB',
          100: '#FFE8D6',
          200: '#FFD0A8',
          300: '#FFB575',
          400: '#FF9950',
          500: '#FF7A45',
          600: '#F05C2E',
          700: '#D8421B',
          800: '#B83210',
          900: '#8F2710',
        },
        warm: {
          50: '#FFFAF5',
          100: '#FFF5EB',
          200: '#FFE8D6',
          300: '#F9D7B8',
          400: '#F0C29A',
          500: '#E5AA7B',
          600: '#D48F5C',
          700: '#B87241',
          800: '#8A5530',
          900: '#5C3A21',
        },
        brown: {
          50: '#F7F3F0',
          100: '#EBE4DD',
          200: '#D6C8BB',
          300: '#B8A28A',
          400: '#947B60',
          500: '#6F5A45',
          600: '#524132',
          700: '#3D2C24',
          800: '#2A1E18',
          900: '#1A130F',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(61, 44, 36, 0.08)',
        'medium': '0 8px 30px rgba(61, 44, 36, 0.12)',
        'large': '0 12px 40px rgba(61, 44, 36, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

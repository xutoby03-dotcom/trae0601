/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        lg: '2rem',
      },
    },
    extend: {
      fontFamily: {
        display: ['"Nunito"', 'system-ui', 'sans-serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      colors: {
        baby: {
          50: '#FFF5F7',
          100: '#FFE4EA',
          200: '#FFC9D6',
          300: '#FFB6C1',
          400: '#FF8FA3',
          500: '#FF6B8A',
        },
        mint: {
          50: '#F0FBF7',
          100: '#DBF5EB',
          200: '#B8EBD6',
          300: '#98D8C8',
          400: '#6EC4AE',
          500: '#4AB098',
        },
        clean: {
          50: '#EBF5FB',
          100: '#D4E9F7',
          200: '#A9D3EF',
          300: '#5DADE2',
          400: '#3E97D6',
          500: '#2E86C1',
        },
        woody: {
          50: '#FBF5EE',
          100: '#F5E6D3',
          200: '#EACCAA',
          300: '#D4A574',
          400: '#C08A55',
          500: '#A67040',
        },
        alert: {
          50: '#FDECEA',
          100: '#FADBD8',
          200: '#F5B7B1',
          300: '#E74C3C',
          400: '#CB4335',
          500: '#C0392B',
        },
      },
      borderRadius: {
        'xl-plus': '1rem',
        '2xl-plus': '1.25rem',
        '3xl-plus': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 16px 40px rgba(0, 0, 0, 0.12)',
        'glow-pink': '0 0 20px rgba(255, 182, 193, 0.4)',
        'glow-red': '0 0 24px rgba(231, 76, 60, 0.35)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        'bounce-soft': 'bounceSoft 0.6s ease-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(231, 76, 60, 0.25)' },
          '50%': { boxShadow: '0 0 28px rgba(231, 76, 60, 0.5)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceSoft: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.08)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

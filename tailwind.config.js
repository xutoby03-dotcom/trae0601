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
        coral: {
          50: '#FFF5F5',
          100: '#FFE8E8',
          200: '#FFD1D1',
          300: '#FFB3B3',
          400: '#FF8F8F',
          500: '#FF6B6B',
          600: '#F55252',
          700: '#E03E3E',
          800: '#C92A2A',
          900: '#A61E1E',
        },
        cream: {
          50: '#FFFDE7',
          100: '#FFF9C4',
          200: '#FFF59D',
          300: '#FFF176',
          400: '#FFEE58',
          500: '#FFE66D',
          600: '#FDD835',
          700: '#FBC02D',
          800: '#F9A825',
          900: '#F57F17',
        },
        mint: {
          50: '#E8F8F7',
          100: '#C5F0ED',
          200: '#A2E7E2',
          300: '#7EDDD8',
          400: '#5FD4CE',
          500: '#4ECDC4',
          600: '#3DB9B0',
          700: '#2EA49C',
          800: '#208E87',
          900: '#15746E',
        },
        slate2: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#2C3E50',
          900: '#1E293B',
        },
      },
      fontFamily: {
        display: ['"ZCOOL KuaiLe"', '"Noto Sans SC"', 'cursive'],
        body: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'confetti': 'confetti 3s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(3deg)' },
        },
        pulseSoft: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 107, 107, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(255, 107, 107, 0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        confetti: {
          '0%': { opacity: '1', transform: 'translateY(0) rotate(0deg)' },
          '100%': { opacity: '0', transform: 'translateY(100vh) rotate(720deg)' },
        },
      },
      boxShadow: {
        'card': '0 4px 20px rgba(44, 62, 80, 0.08)',
        'card-hover': '0 12px 40px rgba(44, 62, 80, 0.15)',
        'glow-coral': '0 0 24px rgba(255, 107, 107, 0.3)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 50%, #FFE66D 100%)',
        'gradient-card': 'linear-gradient(180deg, #FFFFFF 0%, #FFF9F9 100%)',
        'gradient-secret': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-sameday': 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
        'gradient-advance': 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
      },
    },
  },
  plugins: [],
};

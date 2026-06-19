/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
    },
    extend: {
      colors: {
        'night-teal': {
          50: '#eef8f8',
          100: '#d6efee',
          200: '#aadfdd',
          300: '#73c7c4',
          400: '#44a7a3',
          500: '#2a8a86',
          600: '#1d6f6c',
          700: '#185957',
          800: '#0d4f4f',
          900: '#0a3f3f',
          950: '#042323',
        },
        'warm-orange': {
          50: '#fef5ef',
          100: '#fde7d7',
          200: '#facbad',
          300: '#f6a779',
          400: '#f07e47',
          500: '#e0784f',
          600: '#cc5f32',
          700: '#aa4929',
          800: '#883b26',
          900: '#6e3322',
          950: '#3a170e',
        },
        'cream': '#faf6ef',
        'deep-brown': '#3a2e2a',
        'forest': '#4a7c59',
      },
      fontFamily: {
        display: ['"ZCOOL KuaiLe"', 'cursive'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -4px rgba(13, 79, 79, 0.12), 0 2px 6px -2px rgba(13, 79, 79, 0.08)',
        'card-hover': '0 12px 40px -8px rgba(13, 79, 79, 0.2), 0 4px 12px -4px rgba(13, 79, 79, 0.12)',
        'glow': '0 0 30px rgba(224, 120, 79, 0.3)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'pulse-ring': 'pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(224, 120, 79, 0.6)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 20px rgba(224, 120, 79, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(224, 120, 79, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

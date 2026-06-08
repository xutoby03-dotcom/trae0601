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
        cream: '#FFF8F0',
        caramel: '#C4854C',
        'caramel-light': '#E8C9A0',
        'caramel-dark': '#8B5E34',
        blush: '#F5C6C6',
        mint: '#A8D5BA',
        sky: '#B8D4E3',
        sunny: '#F5E6A3',
        bark: '#5C3D2E',
        parchment: '#FFF1E0',
        'warm-gray': '#9B8E82',
      },
      fontFamily: {
        display: ['ZCOOL XiaoWei', 'serif'],
        body: ['Noto Sans SC', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'warm': '0 4px 14px rgba(196, 133, 76, 0.15)',
        'warm-lg': '0 8px 24px rgba(196, 133, 76, 0.2)',
        'soft': '0 2px 8px rgba(0,0,0,0.06)',
      },
      animation: {
        'bounce-in': 'bounceIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};

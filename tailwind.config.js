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
        ocher: {
          50: '#FAF3E6',
          100: '#F5E6D3',
          200: '#E8CCAA',
          300: '#D4A574',
          400: '#C48B4F',
          500: '#8B4513',
          600: '#6B3410',
          700: '#4A240B',
          800: '#2D1607',
          900: '#1A0D04',
        },
        gold: {
          50: '#FBF5E4',
          100: '#F5E6B8',
          200: '#E8D188',
          300: '#D4AF37',
          400: '#B8941F',
          500: '#8B6914',
        },
        parchment: '#F5E6D3',
        ink: '#1A1A1A',
        crimson: '#8B0000',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'paper-texture': "linear-gradient(135deg, rgba(139,69,19,0.03) 0%, rgba(212,175,55,0.05) 100%)",
        'shadow-pattern': "radial-gradient(circle at 20% 80%, rgba(139,69,19,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(212,175,55,0.06) 0%, transparent 50%)",
      },
      boxShadow: {
        'paper': '0 2px 12px rgba(139,69,19,0.15), 0 1px 3px rgba(26,26,26,0.1)',
        'paper-hover': '0 8px 24px rgba(139,69,19,0.2), 0 2px 8px rgba(26,26,26,0.12)',
      },
    },
  },
  plugins: [],
};

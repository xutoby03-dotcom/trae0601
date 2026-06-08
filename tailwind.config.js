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
        caramel: '#8B5E3C',
        'caramel-light': '#A67C5B',
        'caramel-dark': '#5C3D2E',
        mint: '#6BBF8A',
        'mint-light': '#A8E6CF',
        clay: '#E8A0BF',
        'clay-light': '#F5D0E8',
        sand: '#D4B896',
        'sand-light': '#E8D5BF',
        bark: '#5C3D2E',
        parchment: '#FAF0E6',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'craft': '0 2px 8px rgba(139, 94, 60, 0.12)',
        'craft-hover': '0 4px 16px rgba(139, 94, 60, 0.2)',
        'craft-lg': '0 8px 24px rgba(139, 94, 60, 0.15)',
      },
    },
  },
  plugins: [],
};

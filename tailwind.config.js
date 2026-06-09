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
        cream: '#F5E6D3',
        'cream-dark': '#EAD5BC',
        'cream-light': '#FBF5ED',
        brown: {
          DEFAULT: '#8B6F47',
          light: '#A68B5B',
          dark: '#6B5235',
          muted: '#C4AD8C',
        },
        pink: {
          soft: '#E8B4B8',
          light: '#F2D4D6',
          deep: '#D4858B',
        },
        mint: {
          DEFAULT: '#A8D5BA',
          light: '#C8E6D4',
          deep: '#7BBF95',
        },
        coral: {
          DEFAULT: '#E8927C',
          light: '#F0B5A6',
          deep: '#D47158',
        },
      },
      fontFamily: {
        serif: ['"Crimson Pro"', 'Georgia', '"Noto Serif SC"', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"Noto Sans SC"', 'sans-serif'],
      },
      backgroundImage: {
        'kraft': 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(139,111,71,0.02) 2px, rgba(139,111,71,0.02) 4px)',
      },
    },
  },
  plugins: [],
};

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
        dark: {
          bg: '#18181B',
          surface: '#1F1F23',
          hover: '#27272A',
          border: '#3F3F46',
        },
        accent: {
          DEFAULT: '#F97316',
          hover: '#FB923C',
        },
        status: '#06B6D4',
        urgent: '#EC4899',
        success: '#22C55E',
      },
      fontFamily: {
        heading: ['Outfit', 'Noto Sans SC', 'sans-serif'],
        body: ['Noto Sans SC', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

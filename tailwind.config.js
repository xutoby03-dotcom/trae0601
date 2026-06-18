/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wedding-rose': '#e8b4b8',
        'wedding-pink': '#f5d5d7',
        'wedding-gold': '#c9a962',
        'wedding-cream': '#fdf8f3',
        'wedding-dark': '#4a3728',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        energy: {
          1: '#ef4444',
          2: '#f97316',
          3: '#eab308',
          4: '#84cc16',
          5: '#22c55e',
        }
      }
    },
  },
  plugins: [],
}

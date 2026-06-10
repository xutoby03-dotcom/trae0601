/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        freezer: {
          bg: '#f0f9ff',
          drawer: '#e0f2fe',
          accent: '#0284c7',
        },
        expiring: {
          urgent: '#ef4444',
          warning: '#f97316',
          soon: '#eab308',
        },
        category: {
          meat: '#dc2626',
          staple: '#2563eb',
          vegetable: '#16a34a',
          seafood: '#0891b2',
          dessert: '#db2777',
          other: '#6b7280',
        }
      }
    },
  },
  plugins: [],
}

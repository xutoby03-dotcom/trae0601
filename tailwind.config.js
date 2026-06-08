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
        forest: {
          50: '#f0f7eb',
          100: '#d9edcc',
          200: '#b5da9a',
          300: '#87c260',
          400: '#5fa93a',
          500: '#3d8a1e',
          600: '#2D5016',
          700: '#23400f',
          800: '#1a300b',
          900: '#112007',
        },
        earth: {
          50: '#faf6ed',
          100: '#f2e8ce',
          200: '#e4cf9b',
          300: '#d5b466',
          400: '#c89e3f',
          500: '#8B6914',
          600: '#7a5c10',
          700: '#654b0d',
          800: '#503b0a',
          900: '#3b2b07',
        },
        sunset: {
          50: '#fef3ed',
          100: '#fde2d0',
          200: '#fac5a0',
          300: '#f6a06a',
          400: '#E87040',
          500: '#d5572a',
          600: '#b8431f',
          700: '#953518',
          800: '#732a15',
          900: '#5a2312',
        },
        cream: {
          50: '#FDFBF7',
          100: '#F5F0E8',
          200: '#EDE5D8',
          300: '#DDD2BF',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

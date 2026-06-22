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
        olive: {
          50: "#f4f7f4",
          100: "#e6ede7",
          200: "#cdd9cf",
          300: "#a9bdad",
          400: "#7d9a83",
          500: "#5c7c63",
          600: "#47624d",
          700: "#3a4f3f",
          800: "#314135",
          900: "#2a372d",
          950: "#161d18",
        },
        earth: {
          50: "#faf7ed",
          100: "#f2eccf",
          200: "#e5d79f",
          300: "#d6bd67",
          400: "#c9a640",
          500: "#b89130",
          600: "#9a7327",
          700: "#7c5823",
          800: "#674723",
          900: "#573c22",
          950: "#321f10",
        },
        rope: {
          50: "#fef7ee",
          100: "#fcedd6",
          200: "#f7d7ac",
          300: "#f1bb76",
          400: "#eb943d",
          500: "#e67718",
          600: "#d75e0e",
          700: "#b2460e",
          800: "#8e3814",
          900: "#732f14",
          950: "#3e1508",
        },
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "Times New Roman", "Times", "serif"],
        body: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

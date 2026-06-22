/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        equestrian: {
          brown: {
            50: "#EFEBE9",
            100: "#D7CCC8",
            200: "#BCAAA4",
            300: "#A1887F",
            400: "#8D6E63",
            500: "#795548",
            600: "#6D4C41",
            700: "#5D4037",
            800: "#4E342E",
            900: "#3E2723",
          },
          gold: {
            50: "#FFFDE7",
            100: "#FFF9C4",
            200: "#FFF59D",
            300: "#FFF176",
            400: "#FFEE58",
            500: "#FFEB3B",
            600: "#FDD835",
            700: "#FBC02D",
            800: "#F9A825",
            900: "#F57F17",
          },
          sand: {
            50: "#FAFAF5",
            100: "#F5F5E8",
            200: "#EFEFE0",
            300: "#E8E8D0",
          },
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "Times", "serif"],
      },
      boxShadow: {
        elegant: "0 4px 20px -2px rgba(93, 64, 55, 0.15)",
        "elegant-lg": "0 10px 40px -5px rgba(93, 64, 55, 0.2)",
      },
    },
  },
  plugins: [],
};

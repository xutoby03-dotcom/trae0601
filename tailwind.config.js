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
        primary: {
          50: "#E8F3FF",
          100: "#BEDAFF",
          200: "#94BDFF",
          300: "#6AA2FF",
          400: "#4087FF",
          500: "#165DFF",
          600: "#0E42D2",
          700: "#0A2BA0",
          800: "#061A6E",
          900: "#030D3C",
        },
        success: {
          50: "#E8FFEA",
          100: "#B3FFBA",
          200: "#80F292",
          300: "#4DE66B",
          400: "#26D94D",
          500: "#00B42A",
          600: "#009A24",
          700: "#00801E",
          800: "#006618",
          900: "#004D12",
        },
        warning: {
          50: "#FFF7E8",
          100: "#FFE7B3",
          200: "#FFD480",
          300: "#FFC14D",
          400: "#FFAF26",
          500: "#FF7D00",
          600: "#D96B00",
          700: "#B35900",
          800: "#8C4700",
          900: "#663500",
        },
        danger: {
          50: "#FFECE8",
          100: "#FFC7B3",
          200: "#FFA380",
          300: "#FF7E4D",
          400: "#FF5A26",
          500: "#F53F3F",
          600: "#D92A2A",
          700: "#B31E1E",
          800: "#8C1717",
          900: "#660F0F",
        },
      },
    },
  },
  plugins: [],
};

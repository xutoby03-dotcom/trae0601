/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
    },
    extend: {
      colors: {
        forest: {
          50: "#f1f8ef",
          100: "#dcecd6",
          200: "#bbd9b0",
          300: "#8fbf7f",
          400: "#66a054",
          500: "#4a8239",
          600: "#38672a",
          700: "#2D5A27",
          800: "#254720",
          900: "#1e3a1b",
        },
        earth: {
          50: "#faf6ee",
          100: "#f1e7cf",
          200: "#e3cc9f",
          300: "#d4ac68",
          400: "#c89142",
          500: "#b67a33",
          600: "#9b5f2a",
          700: "#8B6914",
          800: "#6b4e15",
          900: "#574014",
        },
        warn: {
          50: "#fef6ee",
          100: "#fbe9d6",
          200: "#f6cfab",
          300: "#f0ac75",
          400: "#E8743B",
          500: "#e05a20",
          600: "#c54318",
          700: "#a33317",
          800: "#832a18",
          900: "#6b2417",
        },
        firstaid: {
          50: "#fbeaea",
          100: "#f6d6d6",
          200: "#edafaf",
          300: "#e17d7d",
          400: "#d34d4d",
          500: "#C0392B",
          600: "#aa2a21",
          700: "#8c211d",
          800: "#731e1c",
          900: "#611c1b",
        },
        parchment: {
          50: "#FBF8F0",
          100: "#F5F0E6",
          200: "#EDE6D5",
          300: "#E0D6BE",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', '"Noto Serif SC"', "Georgia", "serif"],
        body: ['"Noto Sans SC"', '"Source Han Sans SC"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 12px rgba(45, 90, 39, 0.08), 0 1px 3px rgba(45, 90, 39, 0.06)",
        "card-hover": "0 8px 24px rgba(45, 90, 39, 0.12), 0 2px 6px rgba(45, 90, 39, 0.08)",
        inner: "inset 0 1px 3px rgba(139, 105, 20, 0.08)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-warn": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(232, 116, 59, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(232, 116, 59, 0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out forwards",
        "pulse-warn": "pulse-warn 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

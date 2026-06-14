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
      screens: {
        xs: '480px',
      },
      colors: {
        primary: {
          50: "#F0F4F9",
          100: "#D9E3EF",
          200: "#B4C7DE",
          300: "#8FABCE",
          400: "#6A8FBD",
          500: "#4573AD",
          600: "#2E5A8F",
          700: "#1E3A5F",
          800: "#162B46",
          900: "#0E1D2F",
        },
        accent: {
          50: "#FFF3EE",
          100: "#FFE2D5",
          200: "#FFC5AB",
          300: "#FFA881",
          400: "#FF8B57",
          500: "#FF7A45",
          600: "#E85D25",
          700: "#B8481C",
          800: "#883413",
          900: "#58200A",
        },
        mint: {
          50: "#EDFBFA",
          100: "#D5F6F4",
          200: "#ABEDE9",
          300: "#81E4DE",
          400: "#57DBD3",
          500: "#36CFC9",
          600: "#25A8A3",
          700: "#1C7F7B",
          800: "#135654",
          900: "#0A2D2C",
        },
        neutral: {
          50: "#FAFAFC",
          100: "#F3F4F7",
          200: "#E6E8EF",
          300: "#CED2DE",
          400: "#A9AFBF",
          500: "#7E8599",
          600: "#5B6174",
          700: "#424755",
          800: "#2A2D38",
          900: "#17191F",
        },
      },
      fontFamily: {
        sans: [
          '"Source Han Sans CN"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(30, 58, 95, 0.08)",
        "card-hover": "0 8px 30px rgba(30, 58, 95, 0.12)",
        button: "0 2px 8px rgba(30, 58, 95, 0.15)",
      },
      borderRadius: {
        card: "12px",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.3)" },
        },
        breathe: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255, 122, 69, 0.4)" },
          "50%": { boxShadow: "0 0 0 10px rgba(255, 122, 69, 0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        "slide-in-right": "slide-in-right 0.3s ease-out both",
        "pulse-dot": "pulse-dot 1.5s ease-in-out infinite",
        breathe: "breathe 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

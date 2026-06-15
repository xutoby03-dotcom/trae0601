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
        cream: {
          50: "#FFFBF5",
          100: "#FFF8F0",
          200: "#FBEFE0",
          300: "#F4E0C3",
        },
        coffee: {
          800: "#4A3520",
          900: "#3D2914",
        },
        matcha: {
          500: "#7CB342",
          600: "#689F38",
        },
        warning: {
          500: "#FB8C00",
        },
        danger: {
          500: "#E53935",
          600: "#D32F2F",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "serif"],
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      keyframes: {
        pulseRed: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(229, 57, 53, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(229, 57, 53, 0)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-red": "pulseRed 1.5s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

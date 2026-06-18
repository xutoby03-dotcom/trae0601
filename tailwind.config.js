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
          50: "#FFF3EE",
          100: "#FFE2D5",
          200: "#FFC4AB",
          300: "#FFA681",
          400: "#FF8857",
          500: "#FF6B35",
          600: "#E55019",
          700: "#B83E13",
          800: "#8A2E0E",
          900: "#5C1E09",
        },
        table: {
          50: "#E8F4FD",
          100: "#C5E3F8",
          200: "#90CAF3",
          300: "#5BB0ED",
          400: "#349AE9",
          500: "#1E88E5",
          600: "#1976D2",
          700: "#1565C0",
          800: "#0D47A1",
          900: "#0A3371",
        },
        floor: {
          500: "#2E7D32",
          600: "#256428",
        },
      },
      fontFamily: {
        display: ['"ZCOOL KuaiLe"', '"Noto Sans SC"', "sans-serif"],
        body: ['"Noto Sans SC"', "sans-serif"],
      },
      animation: {
        "bounce-gentle": "bounceGentle 0.6s ease-in-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "slide-in": "slideIn 0.3s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
        "scale-pop": "scalePop 0.3s ease-out",
      },
      keyframes: {
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        slideIn: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scalePop: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        sky: {
          50: "#f0f7ff",
          100: "#e0efff",
          200: "#bae0ff",
          300: "#7cc8ff",
          400: "#4A90D9",
          500: "#3b7bc0",
          600: "#2d63a0",
          700: "#254f80",
          800: "#1e4169",
          900: "#1b3758",
        },
        sun: {
          400: "#FF9F43",
          500: "#f08820",
        },
        warn: {
          red: "#EE5253",
          yellow: "#FECA57",
          green: "#1DD1A1",
        },
      },
      fontFamily: {
        display: ['"ZCOOL XiaoWei"', "serif"],
        sans: ['"PingFang SC"', '"Hiragino Sans GB"', "-apple-system", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "warning-blink": "warningBlink 2s ease-in-out infinite",
        "slide-in-right": "slideInRight 0.4s ease-out",
        "check-pop": "checkPop 0.5s ease-out",
        "float-slow": "float 6s ease-in-out infinite",
      },
      keyframes: {
        warningBlink: {
          "0%, 100%": { backgroundColor: "#fff6d6" },
          "50%": { backgroundColor: "#FECA57" },
        },
        slideInRight: {
          "0%": { transform: "translateX(30px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        checkPop: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      backgroundImage: {
        "cloud-pattern":
          "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.8) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.6) 0%, transparent 35%)",
      },
    },
  },
  plugins: [],
};

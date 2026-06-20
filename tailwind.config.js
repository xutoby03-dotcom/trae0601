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
        clay: {
          50: "#FAF7F2",
          100: "#F3EEE4",
          200: "#E8E1D5",
          300: "#D9CFBD",
          400: "#C4B59C",
          500: "#A89578",
          600: "#8B7656",
          700: "#6B5840",
          800: "#4D3E2B",
          900: "#3A2E25",
        },
        glaze: {
          celadon: "#5B8A72",
          iron: "#A34B3B",
          cobalt: "#3B5A8A",
          amber: "#D4A853",
        },
      },
      fontFamily: {
        serif: ['"Songti SC"', '"STSong"', '"SimSun"', '"Noto Serif SC"', "serif"],
        sans: ['"PingFang SC"', '"Microsoft YaHei"', '"Noto Sans SC"', '"Source Han Sans SC"', "sans-serif"],
      },
      boxShadow: {
        tile: "0 2px 8px rgba(58, 46, 37, 0.08), 0 1px 2px rgba(58, 46, 37, 0.06)",
        "tile-hover": "0 8px 24px rgba(58, 46, 37, 0.16), 0 2px 6px rgba(58, 46, 37, 0.1)",
        "inset-clay": "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(58,46,37,0.08)",
      },
      backgroundImage: {
        "clay-texture":
          "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.5) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(168, 149, 120, 0.15) 0%, transparent 50%)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "draw-line": "drawLine 1.2s ease-out forwards",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        drawLine: {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};

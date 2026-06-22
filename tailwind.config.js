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
        oak: {
          50: "#F5F0EB",
          100: "#E8DDD2",
          200: "#D4BFA8",
          300: "#B89978",
          400: "#8B6914",
          500: "#5D4037",
          600: "#4E342E",
          700: "#3E2723",
          800: "#2E1A15",
          900: "#1B100D",
        },
        brass: {
          50: "#FBF5E6",
          100: "#F5E6BF",
          200: "#EBD189",
          300: "#DDB54F",
          400: "#CD9927",
          500: "#B8860B",
          600: "#9A6F08",
          700: "#7A5706",
          800: "#5C4205",
          900: "#423004",
        },
        forest: {
          50: "#E8F5E9",
          100: "#C8E6C9",
          200: "#A5D6A7",
          300: "#81C784",
          400: "#66BB6A",
          500: "#2E7D32",
          600: "#1B5E20",
          700: "#1565C0",
          800: "#0D47A1",
          900: "#0A3D91",
        },
        ink: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#DCDCDC",
          300: "#B0B0B0",
          400: "#757575",
          500: "#424242",
          600: "#2B2B2B",
          700: "#1F1F1F",
          800: "#181818",
          900: "#0F0F0F",
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', '"PingFang SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'vinyl': '0 8px 32px -8px rgba(62, 39, 35, 0.4)',
        'brass-glow': '0 0 20px rgba(184, 134, 11, 0.3)',
        'card': '0 4px 16px -4px rgba(0, 0, 0, 0.15)',
      },
      backgroundImage: {
        'wood-grain': `repeating-linear-gradient(
          90deg,
          rgba(93, 64, 55, 0.03) 0px,
          rgba(93, 64, 55, 0.03) 1px,
          transparent 1px,
          transparent 4px
        )`,
      },
    },
  },
  plugins: [],
};

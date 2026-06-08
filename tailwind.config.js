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
        bg: {
          primary: "#0f172a",
          secondary: "#1e293b",
          card: "#1e293b/80",
        },
        accent: {
          amber: "#f59e0b",
          amberLight: "#fbbf24",
        },
        peak: "#ef4444",
        valley: "#22c55e",
        flat: "#3b82f6",
      },
      fontFamily: {
        display: ['"DM Sans"', "sans-serif"],
        body: ['"Noto Sans SC"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

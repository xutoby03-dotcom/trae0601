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
        ink: {
          950: "#0f0f1a",
          900: "#1a1a2e",
          800: "#22223a",
          700: "#2d2d4a",
          600: "#3a3a5c",
        },
        copper: {
          400: "#f0c090",
          500: "#e8a87c",
          600: "#d49268",
          700: "#b87a54",
        },
        jade: {
          400: "#6eebc4",
          500: "#4ecca3",
          600: "#3db089",
        },
        rust: {
          400: "#f07078",
          500: "#e8505b",
          600: "#cc3e49",
        },
        amber: {
          soft: "#f5c16c",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(232, 168, 124, 0.25)",
        card: "0 4px 24px rgba(0, 0, 0, 0.4)",
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

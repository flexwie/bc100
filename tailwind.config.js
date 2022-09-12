/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    fontFamily: {
      sans: ["system-ui", "sans-serif"],
      serif: [],
    },
    extend: {
      borderRadius: {
        ml: "0.4rem",
      },
      colors: {
        ciblue: {
          100: "#DCD8FE",
          300: "#9689FC",
          500: "#4F39FA",
          700: "#1A05BE",
        },
        ciwhite: "#f5f0f0",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

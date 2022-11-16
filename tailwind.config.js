/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  variants: {
    extend: {},
  },
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
        ciwhite: {
          100: "#f8f5f5",
          300: "#f5f0f0",
          500: "#ddd8d8",
          700: "#c4c0c0",
        },
        ciblack: {
          100: "#7b7878",
          300: "#4a4848",
          500: "#313030",
          700: "#181818",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

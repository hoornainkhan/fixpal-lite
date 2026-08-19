/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        black: "#000000",
        offwhite: "#F6F6F6",
        mint: {
          DEFAULT: "#CFFFE2",
          soft: "#A2D5C6",
        },
      },
      fontFamily: {
        display: ['"Handlee"', "cursive"],
        body: ['"Manrope"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

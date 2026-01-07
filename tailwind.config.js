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
        neo: {
          black: "#0A0A0C",
          white: "#F2EDE7",
          purple: "#82667F",
          red: "#D14A61",
        },
      },
      boxShadow: {
        neo: "4px 4px 0px 0px #0A0A0C",
        "neo-sm": "2px 2px 0px 0px #0A0A0C",
        "neo-lg": "6px 6px 0px 0px #0A0A0C",
      },
      borderWidth: {
        3: '3px',
      }
    },
  },
  plugins: [],
};

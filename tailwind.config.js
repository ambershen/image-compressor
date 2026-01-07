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
        brut: {
          black: "#0A0A0C",
          white: "#F2EDE7",
          red: "#D14A61",
          gray: "#2A2A2C", // Added for utility
        },
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
        sans: ['"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        brut: "4px 4px 0px 0px #0A0A0C",
        "brut-sm": "2px 2px 0px 0px #0A0A0C",
        "brut-lg": "8px 8px 0px 0px #0A0A0C",
      },
      borderWidth: {
        1: '1px',
        3: '3px',
        4: '4px',
      }
    },
  },
  plugins: [],
};

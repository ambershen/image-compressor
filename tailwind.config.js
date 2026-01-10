/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem", // Tighter padding for gallery feel
    },
    extend: {
      colors: {
        brand: {
          black: "#0A0A0C",
          beige: "#F2EDE7",
          purple: "#82667F",
          blue: "#2C3E5C",
          red: "#D14A61",
        },
      },
      fontFamily: {
        // Whitney uses Neue Haas Grotesk / Helvetica. We use a strong grotesque stack.
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Courier New"', 'Courier', 'monospace'],
      },
      // Removed hard shadows for a flatter, Whitney-like look
      boxShadow: {
        'none': 'none',
      },
      borderWidth: {
        1: '1px',
        2: '2px', // Keep 2px for primary structural lines
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      }
    },
  },
  plugins: [],
};

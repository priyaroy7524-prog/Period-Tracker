/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Dark theme switch karne ke liye
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: '#FDE2E4',
          rose: '#FFCAD4',
          lavender: '#E2ECE9',
          purple: '#E0BBE4',
          peach: '#FFDFD3',
          darkBg: '#1E1B2E',
          darkCard: '#2A2438',
          darkAccent: '#B388FF'
        }
      }
    },
  },
  plugins: [],
}
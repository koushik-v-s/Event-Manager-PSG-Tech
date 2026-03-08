/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0074b7',
        secondary: '#003b73',
        background: '#bfd7ed',
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
};
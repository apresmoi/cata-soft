/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // or 'media' or 'class'
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./electron/**/*.{js,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

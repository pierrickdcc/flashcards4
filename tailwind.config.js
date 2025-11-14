/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
  // J'ajoute ceci pour que Tailwind respecte votre ThemeContext (body.dark)
  darkMode: 'class',
}
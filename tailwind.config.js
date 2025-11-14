/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background-body)',
        foreground: 'var(--text-color)',
        primary: 'var(--primary-color)',
        muted: 'var(--muted-color)',
      },
    },
  },
  plugins: [],
}

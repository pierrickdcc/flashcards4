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
        heading: 'var(--text-heading-color)',
        primary: {
          DEFAULT: 'var(--primary-color)',
          gradient: 'var(--primary-gradient)',
        },
        glass: 'var(--background-glass)',
        border: 'var(--border-color)',
        // Memo Colors from the new design system
        memo: {
          yellow: { bg: 'var(--memo-yellow-bg)', border: 'var(--memo-yellow-border)', text: 'var(--memo-yellow-text)' },
          blue: { bg: 'var(--memo-blue-bg)', border: 'var(--memo-blue-border)', text: 'var(--memo-blue-text)' },
          green: { bg: 'var(--memo-green-bg)', border: 'var(--memo-green-border)', text: 'var(--memo-green-text)' },
          pink: { bg: 'var(--memo-pink-bg)', border: 'var(--memo-pink-border)', text: 'var(--memo-pink-text)' },
          purple: { bg: 'var(--memo-purple-bg)', border: 'var(--memo-purple-border)', text: 'var(--memo-purple-text)' },
          gray: { bg: 'var(--memo-gray-bg)', border: 'var(--memo-gray-border)', text: 'var(--memo-gray-text)' },
        },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',
          primary: '#2563eb',
          accent: '#38bdf8',
          surface: '#f8fafc'
        }
      }
    },
  },
  plugins: [],
}
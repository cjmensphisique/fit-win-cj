/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FACC15', // yellow-400
          hover: '#EAB308',   // yellow-500
        },
        dark: {
          bg: '#000000',
          card: '#1F2937',    // gray-800
          hover: '#374151',   // gray-700
          input: '#374151',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Or default
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Conference colors
        afc: {
          primary: '#002D72',
          light: '#0052CC',
          bg: '#E6F3FF',
        },
        nfc: {
          primary: '#C8102E',
          light: '#FF2E4C',
          bg: '#FFE6EA',
        },
        superbowl: {
          primary: '#FFD700',
          secondary: '#B8860B',
          bg: '#FFFDF0',
        },
        // Pick status colors
        pick: {
          correct: '#22C55E',
          incorrect: '#EF4444',
          pending: '#6B7280',
        },
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

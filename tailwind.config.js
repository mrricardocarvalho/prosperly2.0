/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { primary: '#2563eb', secondary: '#f97316' },
      fontFamily: { sans: ['Inter', 'sans-serif'] }
    }
  },
  plugins: []
};


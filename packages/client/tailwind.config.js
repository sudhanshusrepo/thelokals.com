
module.exports = {
  content: [
    './index.html',
    './{components,contexts,services}/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        gray: {
          750: '#2d3748',
          850: '#1a202c',
          950: '#0d1117',
        },
      },
    },
  },
  plugins: [],
};

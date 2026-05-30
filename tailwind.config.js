/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        parchment: {
          50:  '#fdfaf5',
          100: '#f8f2e6',
          200: '#f0e6d2',
          300: '#e4d4b8',
          400: '#d4bc98',
          500: '#bfa07a',
        },
        sepia: {
          50:  '#f7f3ef',
          100: '#ede3d8',
          200: '#d9c8b4',
          300: '#c0a882',
          400: '#9e7f56',
          500: '#7a5c38',
          600: '#5c4228',
          700: '#3e2c18',
          800: '#2a1e10',
          900: '#1a1208',
        },
        gold: {
          300: '#e8c96a',
          400: '#d4a832',
          500: '#b8881a',
          600: '#9a6e10',
          700: '#7a5408',
        },
        terra: {
          400: '#c4856a',
          500: '#a86348',
          600: '#8a4a30',
        },
      },
      fontFamily: {
        serif: ['"EB Garamond"', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.25em',
      },
    },
  },
  plugins: [],
}

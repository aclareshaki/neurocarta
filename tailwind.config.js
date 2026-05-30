/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cosmos: {
          50: '#f0eeff',
          100: '#e4e0ff',
          200: '#cdc5ff',
          300: '#a99bff',
          400: '#8b6aff',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#2e1065',
        },
        mystic: {
          900: '#0a0a1a',
          800: '#0f0f2e',
          700: '#141438',
          600: '#1a1a4a',
          500: '#1e1e5a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'star-field': "radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.1) 0%, transparent 50%)",
      },
    },
  },
  plugins: [],
}

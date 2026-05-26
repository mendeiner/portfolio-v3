/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        crimson: '#A0153E',
        plum:    '#5C0E40',
        signal:  '#FE214D',
        navy:    '#01224D',
        paper:   '#FFFEFE',
      },
      fontFamily: {
        display:   ['Anton',      'sans-serif'],
        body:      ['Montserrat', 'sans-serif'],
        editorial: ['Trykker',    'serif'],
      },
      aspectRatio: {
        reel:   '9 / 16',
        cinema: '239 / 100',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 22s linear infinite',
        fadeUp:  'fadeUp 0.7s ease forwards',
      },
    },
  },
  plugins: [],
}

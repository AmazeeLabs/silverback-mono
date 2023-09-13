/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    colors: {
      white: '#FFFFFF',
      black: '#000000',
      yellow: {
        400: '#FFE669',
        500: '#fde900',
        600: '#DBA82B',
      },
      turquoise: {
        500: '#00a29a',
        600: '#008a83',
      },
      purple: {
        500: '#951b81',
        600: '#7f176e',
      },
      blue: {
        500: '#60839b',
        900: '#d7e0e6',
      },
      gray: {
        100: '#202020',
        200: '#2c3539',
        300: '#464F53',
        900: '#f7f5f2',
      },
      green: {
        100: '#EBFBF6',
        500: '#349D7A',
      },
      red: {
        100: '#FEF3F7',
        500: '#CA375C',
      },
    },
    fontFamily: {
      alt: 'LexendGiga, Verdana, sans-serif',
    },
    extend: {},
  },
  plugins: [],
};

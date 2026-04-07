import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-handwritten)', 'cursive'],
        handwritten: ['var(--font-handwritten)', 'cursive'],
        display: ['var(--font-display)', 'cursive'],
      },
      colors: {
        coffee: {
          oil: '#2D1E17',
          judge: '#523F31',
          roman: '#796254',
          oyster: '#9D8A7C',
          cream: '#F5F0E8',
          parchment: '#EDE6D3',
          gorzka: '#3B2614',
          mleczna: '#7B4F32',
          cappuccino: '#C8963E',
          latte: '#D9BC7A',
        },
      },
    },
  },
  plugins: [],
};

export default config;

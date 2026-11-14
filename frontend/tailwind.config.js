/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF8F3',
          100: '#F4F0E3', // Warm cream
          200: '#ECE6D4',
          300: '#E4DCC5',
        },
        sand: {
          100: '#EFEAD9',
          200: '#E6DFC9', // Sand beige
          300: '#D9D0B4',
          400: '#C8BE9E',
        },
        sage: {
          100: '#E9E9D7',
          200: '#D7D7B8', // Soft sage
          300: '#C5C59F',
          400: '#ADAE84',
        },
        olive: {
          light: '#636A47',
          DEFAULT: '#4B5035', // Dark olive
          dark: '#353925',
          deep: '#242719',
        },
        terracotta: {
          subtle: '#FBF2ED',
          light: '#CC8462',
          DEFAULT: '#B96F4B', // Terracotta
          hover: '#A25D3B',
          dark: '#854627',
        },
        charcoal: {
          muted: '#767464',
          light: '#4C4B3D',
          DEFAULT: '#302F25', // Deep charcoal
          dark: '#212019',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(48, 47, 37, 0.05), 0 1px 2px rgba(48, 47, 37, 0.03)',
        'warm': '0 4px 12px -2px rgba(48, 47, 37, 0.08), 0 2px 6px -2px rgba(48, 47, 37, 0.04)',
        'warm-lg': '0 10px 25px -4px rgba(48, 47, 37, 0.1), 0 6px 12px -3px rgba(48, 47, 37, 0.05)',
        'warm-xl': '0 20px 35px -5px rgba(48, 47, 37, 0.12), 0 10px 18px -4px rgba(48, 47, 37, 0.06)',
      }
    },
  },
  plugins: [],
}

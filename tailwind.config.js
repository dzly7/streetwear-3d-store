/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['Space Grotesk', 'sans-serif'],
        gothic: ['UnifrakturMaguntia', 'serif'],
      },
      colors: {
        sky: {
          450: '#1da1f2',
          950: '#07162c',
        },
        chrome: {
          light: '#f8fafc',
          silver: '#94a3b8',
          dark: '#334155',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
        'glass-hover': '0 14px 40px 0 rgba(0, 100, 255, 0.25), inset 0 0 0 1.5px rgba(255, 255, 255, 0.4)',
        'glow-cyan': '0 0 30px rgba(56, 189, 248, 0.4)',
        'glow-white': '0 0 25px rgba(255, 255, 255, 0.5)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}

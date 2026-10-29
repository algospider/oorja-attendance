/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        retro: ['"MS Sans Serif"', 'Geneva', 'Tahoma', 'sans-serif'],
        pixel: ['"Press Start 2P"', '"VT323"', 'Courier New', 'monospace'],
        mono: ['"Space Mono"', '"Courier New"', 'Courier', 'monospace'],
      },
      colors: {
        oorja: {
          dark: '#070b14',
          substation: '#121926',
          panel: '#1f2937',
          yellow: '#ffcc00',
          amber: '#f59e0b',
          electric: '#00f0ff',
          neonGreen: '#39ff14',
          danger: '#ef4444',
          wire: '#d97706',
        },
        win: {
          desktop: '#004040', // Deep electrical teal/petrol
          gray: '#c0c0c0',
          dark: '#808080',
          blue: '#000080',
          light: '#dfdfdf',
        }
      },
      boxShadow: {
        'win-out': 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf',
        'win-in': 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf',
        'electric-glow': '0 0 12px rgba(255, 204, 0, 0.45)',
        'cyan-glow': '0 0 12px rgba(0, 240, 255, 0.45)',
      }
    },
  },
  plugins: [],
}

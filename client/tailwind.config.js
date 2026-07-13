/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        felt: {
          DEFAULT: '#0B3D2E',
          dark: '#062A20',
          light: '#134A38',
        },
        cream: '#F7F3E9',
        card: {
          red: '#D7263D',
          yellow: '#F4C95D',
          green: '#1E8A5F',
          blue: '#1F6FB2',
          black: '#171717',
        },
      },
      fontFamily: {
        display: ['"Baloo 2"', 'cursive'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 6px 0 rgba(0,0,0,0.25), 0 10px 20px rgba(0,0,0,0.35)',
        stub: 'inset 0 0 0 2px rgba(247,243,233,0.15)',
      },
      keyframes: {
        deal: {
          '0%': { transform: 'translateY(-40px) rotate(-8deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
        },
        played: {
          '0%': { transform: 'scale(0.9) translateY(20px)', opacity: '0.4' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(244,201,93,0.6)' },
          '50%': { boxShadow: '0 0 0 10px rgba(244,201,93,0)' },
        },
      },
      animation: {
        deal: 'deal 0.35s ease-out',
        played: 'played 0.25s ease-out',
        pulseGlow: 'pulseGlow 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        felt: {
          DEFAULT: '#0B3D2E',
          dark: '#052219',
          light: '#13543F',
          gold: '#D4AF37',
        },
        cream: '#F7F3E9',
        card: {
          red: '#E63946',
          yellow: '#FFB703',
          green: '#2A9D8F',
          blue: '#1D3557',
          black: '#1D1E2C',
        },
      },
      fontFamily: {
        display: ['"Baloo 2"', 'cursive'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 8px 0 rgba(0,0,0,0.3), 0 12px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 16px 0 rgba(0,0,0,0.25), 0 20px 32px rgba(0,0,0,0.45)',
        table: 'inset 0 0 80px rgba(0,0,0,0.6), 0 20px 50px rgba(0,0,0,0.5)',
        glow: '0 0 25px rgba(255, 183, 3, 0.6)',
        'glow-cyan': '0 0 25px rgba(42, 157, 143, 0.6)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      keyframes: {
        deal: {
          '0%': { transform: 'translateY(-60px) scale(0.8) rotate(-12deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1) rotate(0deg)', opacity: '1' },
        },
        played: {
          '0%': { transform: 'scale(0.8) translateY(30px) rotate(15deg)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0) rotate(0deg)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px 2px rgba(255, 183, 3, 0.7)' },
          '50%': { boxShadow: '0 0 30px 8px rgba(255, 183, 3, 0.9)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        deal: 'deal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        played: 'played 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        pulseGlow: 'pulseGlow 1.8s ease-in-out infinite',
        floatSlow: 'floatSlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

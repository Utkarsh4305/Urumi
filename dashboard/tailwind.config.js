/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        peach: {
          50: '#fff5f0',
          100: '#ffe9dd',
          200: '#ffd4bc',
          300: '#ffb894',
          400: '#ff9a6b',
          500: '#ff7f50',
        },
        coral: {
          50: '#fff0f0',
          100: '#ffd9d9',
          200: '#ffb3b3',
          300: '#ff8c8c',
          400: '#ff6666',
          500: '#ff5252',
        },
        lavender: {
          50: '#f7f5ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
        },
        mint: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
        },
        sand: {
          50: '#fefcf8',
          100: '#fdf8f0',
          200: '#fcf0e0',
          300: '#f8e5c8',
          400: '#f0d4a8',
          500: '#e8c490',
        }
      },
      backgroundImage: {
        'gradient-peach': 'linear-gradient(135deg, #ffe9dd 0%, #ffd4bc 100%)',
        'gradient-lavender': 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
        'gradient-mint': 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        'gradient-sand': 'linear-gradient(135deg, #fdf8f0 0%, #fcf0e0 100%)',
        'gradient-blue': 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
        'gradient-coral': 'linear-gradient(135deg, #ffd9d9 0%, #ffb3b3 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

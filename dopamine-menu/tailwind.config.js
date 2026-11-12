/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        walnut: {
          950: '#1a110b',
          900: '#24170f',
          800: '#332115',
          700: '#4a3020',
          600: '#6b4630',
        },
        cream: '#f3e6cf',
        amber: { glow: '#f2a65a', deep: '#d9822b' },
        mustard: '#d8a83f',
        rust: '#c25a2c',
        teal: {
          cord: '#6e9896',
          dark: '#46706e',
          mist: '#a9c5c2',
        },
        chrome: '#c9ccd1',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        rise: {
          '0%': { opacity: 0, transform: 'translateY(12px) scale(.98)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        glow: {
          '0%,100%': { opacity: 0.55 },
          '50%': { opacity: 0.85 },
        },
        orbit: { to: { transform: 'rotate(360deg)' } },
        ripple: {
          '0%': { transform: 'scale(.6)', opacity: 0.5 },
          '100%': { transform: 'scale(2.2)', opacity: 0 },
        },
      },
      animation: {
        rise: 'rise .45s cubic-bezier(.2,.8,.2,1) both',
        glow: 'glow 6s ease-in-out infinite',
        orbit: 'orbit 1s linear infinite',
        ripple: 'ripple .6s ease-out forwards',
      },
    },
  },
  plugins: [],
}

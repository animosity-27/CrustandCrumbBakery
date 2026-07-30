/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: { 50: '#FDFCFA', 100: '#F9F6F1', 200: '#F3EDE4', 300: '#ECE3D6' },
        kraft: { 100: '#F5EFE7', 200: '#EDE0D4', 300: '#E0CDB8', 400: '#D2BD9F' },
        espresso: { 500: '#6D4C41', 600: '#5D4037', 700: '#4E342E', 800: '#3E2723', 900: '#2A1B16' },
        gold: { 300: '#E3BE8E', 400: '#D9B077', 500: '#D4A373', 600: '#C08A55', 700: '#A6723F' },
        sage: { 300: '#B0BDA3', 400: '#9CAB8B', 500: '#8D9C7C', 600: '#74836A', 700: '#5F6C57' },
        mustard: { 400: '#E8B544', 500: '#E1A93A', 600: '#CC9430', 700: '#AE7C22' },
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        body: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        receipt: ['JetBrains Mono', 'Courier New', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(62, 39, 35, 0.18)',
        card: '0 14px 44px -18px rgba(62, 39, 35, 0.30)',
        ticket: '0 22px 60px -24px rgba(62, 39, 35, 0.40)',
        press: '0 4px 0 0 rgba(62, 39, 35, 0.28)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(6deg)' },
        },
        floaty2: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(-8deg)' },
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        floaty: 'floaty 7s ease-in-out infinite',
        floaty2: 'floaty2 9s ease-in-out infinite',
        bob: 'bob 2.4s ease-in-out infinite',
        slideUp: 'slideUp 0.4s cubic-bezier(0.22,1,0.36,1)',
        popIn: 'popIn 0.3s cubic-bezier(0.22,1,0.36,1)',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}', './store/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        accent: '#06B6D4',
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        bg: '#0F172A',
        card: '#1E293B',
        text: '#FFFFFF',
        'text-secondary': '#94A3B8',
        border: '#334155',
      },
    },
  },
  plugins: [],
};

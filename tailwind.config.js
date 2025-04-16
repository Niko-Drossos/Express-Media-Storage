/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,js,ejs}", // Adjust paths as necessary
  ],
  theme: {
    extend: {
      colors: {
        'royal-purple': 'var(--royal-purple)',
        'violet-blaze': 'var(--violet-blaze)',
        'lavender-haze': 'var(--lavender-haze)',
        'lilac-mist': 'var(--lilac-mist)',
        'golden-glow': 'var(--golden-glow)'
      },
      animation: {
        'spin-smooth': 'spin 1s linear infinite',
      },
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp')
  ],
};

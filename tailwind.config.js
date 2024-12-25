/** @type {import('tailwindcss').Config} */
module.exports = {
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
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp')
  ],
};

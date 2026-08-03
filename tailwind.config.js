/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // CSS-variable-backed semantic colors (light/dark via global.css) —
        // mirrors the affected app's token setup.
        surface: 'var(--color-surface)',
        'text-primary': 'var(--color-text-primary)',
        'border-control': 'var(--color-border-control)',
      },
    },
  },
  plugins: [],
};

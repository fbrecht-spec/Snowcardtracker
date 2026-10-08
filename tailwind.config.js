/** @type {import('tailwindcss').Config} */

// Farben als RGB-Kanäle in CSS-Variablen (index.css), damit Hell/Dunkel automatisch wechselt
// und Tailwind-Deckkraft-Modifier wie bg-card/80 funktionieren.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './*.tsx', './components/**/*.tsx', './views/**/*.tsx'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        card: token('card'),
        bar: token('bar'),
        fill: token('fill'),
        label: token('label'),
        secondary: token('secondary'),
        tertiary: token('tertiary'),
        separator: token('separator'),
        accent: token('accent'),
        success: token('success'),
        warning: token('warning'),
        danger: token('danger'),
        indigo: token('indigo'),
        teal: token('teal'),
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Inter Variable"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

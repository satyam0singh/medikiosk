/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#1F6C9F',
          600: '#195680',
          700: '#134363',
          800: '#0e3149',
          900: '#081f2f',
          950: '#041019',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      boxShadow: {
        'double-bezel': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.15), 0 2px 8px -2px rgba(0, 0, 0, 0.08)',
        'double-bezel-dark': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.06), 0 2px 10px -2px rgba(0, 0, 0, 0.4)',
        'soft-ambient': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [],
}

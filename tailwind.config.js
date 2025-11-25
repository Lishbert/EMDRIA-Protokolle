/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f1419',
        surface: '#1a2332',
        'on-surface': '#cbd5e1',
        'on-surface-strong': '#f1f5f9',
        muted: '#64748b',
        'brand-primary': '#3b82f6',
        'brand-secondary': '#10b981',
      },
    },
  },
  plugins: [],
}


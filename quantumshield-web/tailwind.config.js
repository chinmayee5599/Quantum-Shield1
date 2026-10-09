/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'quantum-bg': '#050a15',
        'quantum-panel': '#0c152a',
        'quantum-accent': '#00f0ff',
        'quantum-purple': '#7000ff',
      },
    },
  },
  plugins: [],
}

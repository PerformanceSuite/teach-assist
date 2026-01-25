/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'cc-bg': '#0a0b0d',        // Main background
        'cc-surface': '#12141a',   // Card/panel background
        'cc-border': '#1e2028',    // Borders
        'cc-text': '#e5e5e5',      // Primary text
        'cc-muted': '#8b8d98',     // Secondary text
        'cc-accent': '#6366f1',    // Accent color (indigo)
      }
    }
  },
  plugins: []
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Priority colors (semantic)
        priority: {
          p0: {
            DEFAULT: '#dc2626', // Error/Critical (red)
            light: '#fee2e2',
            dark: '#991b1b',
          },
          p1: {
            DEFAULT: '#ea580c', // Warning/High (orange)
            light: '#ffedd5',
            dark: '#c2410c',
          },
          p2: {
            DEFAULT: '#2563eb', // Info/Standard (blue)
            light: '#dbeafe',
            dark: '#1e40af',
          },
          p3: {
            DEFAULT: '#6b7280', // Neutral/Low (gray)
            light: '#f3f4f6',
            dark: '#4b5563',
          },
        },
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      screens: {
        'betterhover': { 'raw': '(hover: hover)' },
      },
    },
  },
  plugins: [
    function({ addBase, theme }) {
      addBase({
        "h1": {
          fontSize: theme('fontSize.3xl'),
          fontWeight: theme('fontWeight.bold'),
        },
        "h2": {
          fontSize: theme('fontSize.2xl'),
          fontWeight: theme('fontWeight.bold'),
        },
        "h3": {
          fontSize: theme('fontSize.xl'),
          fontWeight: theme('fontWeight.bold'),
        },
        "p": {
          fontSize: theme('fontSize.base'),
          fontWeight: theme('fontWeight.normal'),
        },
        "@screen md": {
          "h1": {
            fontSize: theme('fontSize.4xl'),
          },
          "h2": {
            fontSize: theme('fontSize.3xl'),
          },
          "h3": {
            fontSize: theme('fontSize.2xl'),
          },
          "p": {
            fontSize: theme('fontSize.lg'),
          },
        },
        "@screen lg": {
          "h1": {
            fontSize: theme('fontSize.5xl'),
          },
          "h2": {
            fontSize: theme('fontSize.4xl'),
          },
          "h3": {
            fontSize: theme('fontSize.3xl'),
          },
          "p": {
            fontSize: theme('fontSize.xl'),
          },
        },
      })
    },
  ],
}

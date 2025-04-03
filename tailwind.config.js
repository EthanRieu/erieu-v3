/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./components/**/*.{js,vue,ts}",
      "./layouts/**/*.vue",
      "./pages/**/*.vue",
      "./plugins/**/*.{js,ts}",
      "./nuxt.config.{js,ts}",
      "./app.vue",
    ],
    theme: {
      extend: {
        colors: {
          'site': {
            'bg': '#EEEEEE',
            'primary': '#000000',
            'secondary': '#2F4A4F',
            'link': '#899EA2',
            'divider': '#2F4A4F',
            'logo': '#2F4A4F',
            'header-link': '#2F4A4F',
          },
        },
        fontFamily: {
          'schibsted': ['"Schibsted Grotesk"', 'sans-serif'],
        },
      },
    },
    safelist: [
      'primary-color',
      'secondary-color',
      'bg-color',
      'link-color',
      'divider',
      'theme-text',
      'header-theme-text',
      'smooth-underline',
      'smooth-underline-xl',
      'reveal-text',
      'reveal-text-staggered',
      'reveal-title',
      'reveal-divider',
      'reveal-element',
      'reveal-tool',
      'reveal-cta',
      'invisible-path',
    ],
    plugins: [],
  }
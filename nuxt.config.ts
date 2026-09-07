import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  alias: {
    '@': resolve(__dirname, '/'),
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  modules: ['@pinia/nuxt', '@nuxtjs/i18n'],
  pinia: {
    autoImports: ['defineStore', 'acceptHMRUpdate'],
  },
});

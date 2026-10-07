import tailwindcss from '@tailwindcss/vite';

const isDev = process.env.NODE_ENV === 'development';
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://erieu.fr';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },

  modules: ['@pinia/nuxt', '@nuxtjs/i18n', '@nuxt/fonts', 'nuxt-security'],

  pinia: {
    autoImports: ['defineStore', 'acceptHMRUpdate'],
  },

  app: {
    head: {
      meta: [{ name: 'theme-color', content: '#EEEEEE' }],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  // Clés serveur uniquement (jamais envoyées au client). Surchargées par les variables
  // NUXT_RESEND_API_KEY, NUXT_CONTACT_TO, NUXT_CONTACT_FROM et NUXT_PUBLIC_SITE_URL.
  runtimeConfig: {
    resendApiKey: '',
    contactTo: 'contact@erieu.fr',
    contactFrom: 'ERIEU <onboarding@resend.dev>',
    public: {
      siteUrl,
    },
  },

  i18n: {
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    lazy: true,
    baseUrl: siteUrl,
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: 'en',
    },
    bundle: {
      // Option dépréciée en v10 et source de bugs : désactivée explicitement (supprime aussi l'avertissement au build)
      optimizeTranslationDirective: false,
    },
  },

  // Police auto-hébergée (téléchargée au build, servie depuis /_fonts) : plus de requête vers Google Fonts.
  fonts: {
    families: [
      {
        name: 'Schibsted Grotesk',
        provider: 'google',
        weights: [400, 500, 600, 700, 800],
        styles: ['normal', 'italic'],
      },
    ],
  },

  security: {
    nonce: true,
    headers: {
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'base-uri': ["'self'"],
        'object-src': ["'none'"],
        'frame-ancestors': ["'none'"],
        'form-action': ["'self'"],
        // Scripts : uniquement les bundles nonce-és + vanilla-tilt (CDN encore utilisé par pages/projects.vue).
        'script-src': ["'self'", "'nonce-{{nonce}}'", "'strict-dynamic'", 'https://cdnjs.cloudflare.com'],
        'script-src-attr': ["'none'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        // blob: : textures embarquées dans les modèles .glb (GLTFLoader les décode via des URL blob locales)
        'img-src': ["'self'", 'data:', 'blob:'],
        'font-src': ["'self'"],
        'connect-src': ["'self'", 'blob:'],
        'worker-src': ["'self'", 'blob:'],
        'upgrade-insecure-requests': !isDev,
      },
      // Pas de SharedArrayBuffer sur le site : COEP inutile et source de blocages sur les ressources tierces.
      crossOriginEmbedderPolicy: false,
      referrerPolicy: 'strict-origin-when-cross-origin',
      strictTransportSecurity: isDev ? false : { maxAge: 15552000, includeSubdomains: true },
      xContentTypeOptions: 'nosniff',
      xFrameOptions: 'DENY',
      permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: [],
        payment: [],
      },
    },
    // Rate limiting : désactivé ici (son middleware appelle useStorage() au niveau module, que Nitro 2.11
    // ordonne avant l'initialisation du storage → crash au démarrage). La limite 5 msg/h/IP de
    // /api/contact est implémentée dans server/api/contact.post.ts.
    rateLimiter: false,
    corsHandler: {
      origin: siteUrl,
      methods: ['GET', 'HEAD', 'POST'],
    },
    hidePoweredBy: true,
  },

  nitro: {
    // Génère les variantes .br/.gz des assets publics au build (utile hors CDN, ex. Node/VPS)
    compressPublicAssets: true,
  },

  routeRules: {
    // Images publiques non hashées : cache d'une semaine (les assets /_nuxt hashés sont immutables par défaut)
    '/img/**': { headers: { 'cache-control': 'public, max-age=604800' } },
    '/api/contact': {
      security: {
        // Un message de contact tient largement dans 16 Ko
        requestSizeLimiter: {
          maxRequestSizeInBytes: 16384,
          maxUploadFileRequestInBytes: 16384,
        },
      },
    },
  },
});

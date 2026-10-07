import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;

/**
 * Smoke tests du build de production (`npm run build` d'abord) : servent de garde-fou aux PR de mises à jour
 * Renovate. On teste le vrai serveur Nitro (.output), donc les headers nuxt-security (CSP) sont actifs.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL: `http://localhost:${PORT}`,
    // Anglais forcé : sinon la détection navigateur redirige vers /fr selon la locale du poste
    locale: 'en-US',
    extraHTTPHeaders: { 'Accept-Language': 'en-US,en' },
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // WebGL en rendu logiciel : nécessaire pour charger les scènes Three.js en headless
        launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
      },
    },
  ],

  webServer: {
    command: 'node .output/server/index.mjs',
    url: `http://localhost:${PORT}`,
    env: { PORT: String(PORT), NUXT_PUBLIC_SITE_URL: `http://localhost:${PORT}` },
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});

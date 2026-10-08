import { test, expect, type Page } from '@playwright/test';

// Vercel Analytics : /_vercel/insights/* n'existe que sur l'infra Vercel (404 JSON en local/CI).
// On sert un script vide pour garder la page sans erreur console, sans masquer les autres erreurs.
test.beforeEach(async ({ page }) => {
  await page.route('**/_vercel/insights/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }),
  );
});

/**
 * Collecte les erreurs JS et console d'une page (violations CSP comprises : Chrome les logge en erreur console).
 * Une MàJ de dépendance qui casse l'hydratation, un import ou un header de sécurité finit presque toujours ici.
 */
const trackErrors = (page: Page) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  return errors;
};

const pages = [
  { path: '/', title: /Creative full-stack developer/ },
  { path: '/fr', title: /Développeur full-stack créatif/ },
  { path: '/about', title: /About/ },
  { path: '/fr/about', title: /À propos/ },
  { path: '/projects', title: /Projects/ },
  { path: '/projects/agreego', title: /Agreego/i },
  { path: '/contact', title: /Contact/ },
  { path: '/fr/contact', title: /Contact/ },
];

for (const { path, title } of pages) {
  test(`${path} se charge sans erreur`, async ({ page }) => {
    const errors = trackErrors(page);

    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('h1').first()).toBeVisible();

    // Une clé i18n manquante s'affiche telle quelle (ex. « home.box.title ») : on n'en veut aucune dans la page
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/\b(meta|home|about|projects|contact|nav|footer)\.[a-zA-Z]+\.[a-zA-Z.]+\b/);

    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });
}

test('la scène 3D de la home se charge', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/');

  // Le canvas reste masqué tant que la scène n'est pas prête : on amène le conteneur à l'écran
  await page.locator('.desk-scene').scrollIntoViewIfNeeded();
  const canvas = page.locator('.desk-scene canvas');
  await expect(canvas).toBeVisible({ timeout: 20_000 });

  expect(errors).toEqual([]);
});

test('la toolbox 3D de la page About se charge', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/about');

  await page.locator('.toolbox-scene').scrollIntoViewIfNeeded();
  const canvas = page.locator('.toolbox-scene canvas');
  await expect(canvas).toBeVisible({ timeout: 20_000 });

  expect(errors).toEqual([]);
});

test.describe('formulaire de contact', () => {
  test('affiche les erreurs de validation quand il est vide', async ({ page }) => {
    await page.goto('/contact');
    await page.getByRole('button', { name: /send/i }).click();

    await expect(page.locator('#contact-name-error')).toBeVisible();
    await expect(page.locator('#contact-email-error')).toBeVisible();
    await expect(page.locator('#contact-message-error')).toBeVisible();
    await expect(page.locator('#contact-name')).toBeFocused();
  });

  test('affiche le succès quand l’API répond 200', async ({ page }) => {
    // API simulée : on teste le front sans envoyer de vrai mail via Resend
    await page.route('**/api/contact', (route) => route.fulfill({ status: 200, json: { ok: true } }));
    await page.goto('/contact');

    await page.locator('#contact-name').fill('Test Renovate');
    await page.locator('#contact-email').fill('test@example.com');
    await page.locator('#contact-message').fill('Message de test automatique.');
    await page.getByRole('button', { name: /send/i }).click();

    await expect(page.getByRole('status')).not.toBeEmpty();
    await expect(page.locator('.field-error')).toHaveCount(0);
  });

  test('l’API rejette un envoi invalide', async ({ request }) => {
    const response = await request.post('/api/contact', { data: { name: '', email: 'x', message: '' } });
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });
});

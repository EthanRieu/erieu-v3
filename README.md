# ERIEU — portfolio (erieu-v3)

Site personnel d'Ethan Rieu, développeur full-stack créatif à Reims.

**Stack** : Nuxt 4 · Vue 3.5 · Tailwind CSS v4 (plugin Vite) · Pinia · GSAP (ScrollTrigger) · Three.js · `@nuxtjs/i18n` · `@nuxt/fonts` · `nuxt-security`.

## Démarrer

```bash
npm install
cp .env.example .env   # puis renseigner les clés (voir ci-dessous)
npm run dev            # http://localhost:3000
```

```bash
npm run build          # build de production (.output)
npm run preview        # sert le build localement
```

## Variables d'environnement

Toutes les clés sont lues côté serveur via `runtimeConfig` : rien n'est exposé au client.

| Variable | Rôle |
|---|---|
| `NUXT_PUBLIC_SITE_URL` | URL publique du site (canonical, hreflang, origine CORS). Défaut : `https://erieu.fr` |
| `NUXT_RESEND_API_KEY` | Clé API Resend pour le formulaire de contact |
| `NUXT_CONTACT_TO` | Destinataire des messages. Défaut : `contact@erieu.fr` |
| `NUXT_CONTACT_FROM` | Expéditeur, sur un domaine vérifié chez Resend (ex. `ERIEU <no-reply@erieu.fr>`). Tant que le domaine n'est pas vérifié, `onboarding@resend.dev` ne délivre qu'à l'adresse du compte Resend |

Sans clé Resend, le formulaire répond `503` et affiche le message d'erreur générique ; le lien `mailto:` reste disponible.

## Structure

```
app/                      code du site (convention Nuxt 4, alias ~)
  app.vue
  pages/                  index (home), about, contact, projects
  components/             header, footer, LiveClock, SelectedProject, DeskScene / ToolboxScene (Three.js)
  composables/            useRevealAnimations (reveal GSAP partagé), useMessageList (listes i18n)
  stores/                 projectStore.js (données non textuelles des projets)
  lib/                    sous-ensembles tree-shakés de three
  assets/css/             main.css (tokens @theme Tailwind v4 = charte graphique)
server/api/               contact.post.ts (validation, honeypot, envoi Resend)
i18n/locales/             en.json (défaut, sans préfixe), fr.json (/fr/...)
public/img/               images servies telles quelles (WebP)
```

## i18n

- Anglais par défaut sans préfixe (`/about`), français sous `/fr` (`/fr/about`), détection du navigateur au premier passage sur la racine (cookie `i18n_redirected`).
- Tous les textes vivent dans `i18n/locales/*.json`. Les listes (paragraphes, outils, parcours...) sont lues avec `useMessageList()`.
- Les textes de la page About et les descriptions des projets « Mouvements & Harmonie » et « So'Deco » sont des brouillons : chercher `TODO` dans les fichiers de locale.

## Animations

Les classes `reveal-title`, `reveal-text`, `reveal-text-staggered`, `reveal-divider`, `reveal-element`, `reveal-project-N`, `reveal-tool` et `reveal-cta` sont pré-cachées puis révélées au scroll par `useRevealAnimations()` (GSAP ScrollTrigger, une seule fois par élément). `prefers-reduced-motion` désactive les reveals, le dessin du tracé et le balancement automatique de la scène 3D.

## Scène 3D (`DeskScene`)

Mini bureau isométrique de la home (`public/models/desk.glb`, ~90 Ko), assemblé dans `blender/desk.blend` à partir du [Furniture Kit de Kenney](https://kenney.nl/assets/furniture-kit) (CC0) et recoloré aux couleurs du site. Il pivote avec le curseur ; au survol chaque objet se soulève et affiche ce qu'il représente, au clic il réagit (l'écran change de contenu, la lampe s'allume / s'éteint, la chaise tourne…). Seul un sous-ensemble de `three` (`app/lib/three-desk.js`) est chargé, dynamiquement : à l'approche du viewport sur pointeur fin (souris/trackpad), au premier tap sur écran tactile ou en mode économie de données. Sans WebGL, un texte de repli reste affiché.

## Scène 3D (`ToolboxScene`)

Boîte à outils de la page About (`public/models/toolbox.glb`, ~2,9 Mo), modifiée dans `blender/toolbox.blend` à partir de [« Metal Toolbox » de Mateusz Sadek sur Poly Haven](https://polyhaven.com/a/metal_toolbox) (CC0), recolorée aux couleurs du site avec un médaillon ERIEU. Au clic, le couvercle s'ouvre et les jetons de la stack sautent dehors ; ils se déplacent à la souris / au doigt (physique maison). Même stratégie de chargement que `DeskScene`, avec `app/lib/three-toolbox.js`.

## Crédits

| Ressource | Auteur | Source | Licence |
| --- | --- | --- | --- |
| Metal Toolbox (boîte à outils, page About) | Mateusz Sadek | [Poly Haven](https://polyhaven.com/a/metal_toolbox) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Furniture Kit (bureau 3D, home) | Kenney | [kenney.nl](https://kenney.nl/assets/furniture-kit) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |

Les deux modèles sont modifiés (recoloration, assemblage, médaillon). Le CC0 n'impose aucune attribution ; ces crédits sont donnés par courtoisie.

## Sécurité

- Headers (CSP avec nonce, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy) et taille de requête de `/api/contact` via `nuxt-security` dans `nuxt.config.ts`.
- Formulaire : rate limiting (5 messages / heure / IP, en mémoire dans `server/api/contact.post.ts`), validation client et serveur, honeypot, délai minimal de remplissage, mail envoyé en texte brut.
- Le rate limiting en mémoire est par instance : suffisant pour un portfolio en serverless (Vercel / Netlify). Pour un partage entre instances, remplacer la `Map` par un stockage KV/Redis (`useStorage`).
- Le rate limiter de `nuxt-security` n'est pas utilisé : son middleware appelle `useStorage()` au niveau module, ce que Nitro 2.11 ordonne avant l'initialisation du storage (crash au démarrage du build de production).

## Déploiement (Vercel / Netlify)

`npm run build` avec le preset Nitro détecté automatiquement. Définir les variables d'environnement ci-dessus dans le dashboard de l'hébergeur. La route `/api/contact` nécessite un runtime serveur : le site ne doit pas être déployé en statique (`nuxt generate`) sans remplacer le formulaire.

## Tests et mises à jour automatiques

```bash
npm run build && npm run test:e2e   # smoke tests Playwright sur le build de production
```

- `tests/e2e/smoke.spec.ts` : chaque page (EN/FR) répond 200 sans erreur JS ni violation CSP et sans clé i18n brute, les scènes Three.js (home, About) se chargent, et le formulaire de contact valide puis affiche le succès (API simulée, aucun mail envoyé).
- `.github/workflows/ci.yml` : build + smoke tests sur chaque PR et chaque push sur `master`.
- `renovate.json` : chaque lundi matin, Renovate ouvre une PR « MàJ mineures » (patch + minor), une PR `three` (0.x, donc à risque) et une PR par version majeure. Merge manuel pour l'instant ; si la CI échoue, la PR reste ouverte et GitHub notifie. Le tableau de bord Renovate (issue « Dependency Dashboard ») liste tout ce qui est en attente.
- Pour passer en merge automatique des patch/minor : `"automerge": true` dans la règle « MàJ mineures » de `renovate.json` (Renovate ne merge que si la CI est verte ; Vercel redéploie ensuite `master`).

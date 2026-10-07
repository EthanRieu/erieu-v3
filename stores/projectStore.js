// stores/projectStore.js
import { defineStore } from 'pinia'

/**
 * Données non textuelles des projets. Les titres, services, descriptions et textes des études de cas
 * vivent dans i18n/locales/{en,fr}.json sous la clé projects.<id> (FR/EN).
 * L'id sert aussi de slug d'URL : /projects/<id> (et /fr/projects/<id>).
 * Les images sont servies depuis public/img/projects (WebP, dimensions intrinsèques fournies).
 *
 * category : cadre de réalisation, affiché en badge ('pro' | 'school' | 'personal', libellés dans
 * projects.categories.*). Laisser à null tant que le cadre n'est pas confirmé : aucun badge n'est affiché.
 */

// Captures desktop (1600w + 800w) : même srcset pour toutes les vignettes et images de couverture
// name : clé du texte alternatif dans projects.<id>.shots.<name>
const desktopShot = (slug, name) => ({
  name,
  src: `/img/projects/${slug}-${name}.webp`,
  srcset: `/img/projects/${slug}-${name}-800.webp 800w, /img/projects/${slug}-${name}.webp 1600w`,
  width: 1600,
  height: 1000
})

// Captures mobiles (780 x 1688, ratio iPhone 390 x 844)
const mobileShot = (slug, name) => ({
  name: `mobile-${name}`,
  src: `/img/projects/${slug}-mobile-${name}.webp`,
  width: 780,
  height: 1688
})

export const useProjectStore = defineStore('projects', {
  state: () => ({
    projects: [
      {
        id: 'intralab',
        category: 'school',
        annee: '2025-2026',
        // Pas de version en ligne : seul le dépôt est public
        repo: 'https://github.com/EthanRieu/IntraLab',
        stack: ['Nuxt 4', 'TypeScript', 'Tailwind CSS', 'Prisma', 'PostgreSQL', 'WebSocket', 'JWT', 'Zod', 'OGL (WebGL)', 'PM2', 'Apache'],
        imageUrl: '/img/projects/intralab-home.webp',
        imageSrcset: '/img/projects/intralab-home-800.webp 800w, /img/projects/intralab-home.webp 1600w',
        imageWidth: 1600,
        imageHeight: 1000,
        cover: desktopShot('intralab', 'home'),
        gallery: [
          desktopShot('intralab', 'messages'),
          desktopShot('intralab', 'dashboard'),
          desktopShot('intralab', 'admin-users'),
          desktopShot('intralab', 'loans')
        ],
        mobileShots: [mobileShot('intralab', 'home'), mobileShot('intralab', 'messages'), mobileShot('intralab', 'blog')],
        featured: true
      },
      {
        id: 'agreego',
        category: 'pro',
        annee: '2024-2026',
        url: 'https://www.agreego.fr/',
        stack: ['Figma', 'Nuxt 4', 'Tailwind CSS', 'AOS', 'Nuxt i18n', 'Google Analytics', 'Vercel'],
        imageUrl: '/img/projects/agreego-home.webp',
        imageSrcset: '/img/projects/agreego-home-800.webp 800w, /img/projects/agreego-home.webp 1600w',
        imageWidth: 1600,
        imageHeight: 1000,
        cover: desktopShot('agreego', 'home'),
        gallery: [desktopShot('agreego', 'cloud'), desktopShot('agreego', 'seeding')],
        mobileShots: [mobileShot('agreego', 'home'), mobileShot('agreego', 'cloud'), mobileShot('agreego', 'treatments')],
        // Audit Lighthouse de la page d'accueil en production (performance mobile : médiane de 3 passages)
        lighthouse: {
          date: '2026-10-06',
          mobile: { performance: 80, accessibility: 96, bestPractices: 100, seo: 100 },
          desktop: { performance: 98, accessibility: 96, bestPractices: 100, seo: 100 }
        },
        related: 'viteego',
        featured: true
      },
      {
        id: 'viteego',
        category: 'pro',
        annee: '2024-2026',
        url: 'https://www.viteego.fr/',
        stack: ['Figma', 'Nuxt 4', 'Tailwind CSS', 'AOS', 'Nuxt i18n', 'Google Analytics', 'Vercel'],
        imageUrl: '/img/projects/viteego-home.webp',
        imageSrcset: '/img/projects/viteego-home-800.webp 800w, /img/projects/viteego-home.webp 1600w',
        imageWidth: 1600,
        imageHeight: 1000,
        cover: desktopShot('viteego', 'home'),
        gallery: [desktopShot('viteego', 'solutions'), desktopShot('viteego', 'demarche')],
        mobileShots: [mobileShot('viteego', 'home'), mobileShot('viteego', 'solutions'), mobileShot('viteego', 'apropos')],
        lighthouse: {
          date: '2026-10-06',
          mobile: { performance: 86, accessibility: 100, bestPractices: 100, seo: 100 },
          desktop: { performance: 97, accessibility: 100, bestPractices: 100, seo: 100 }
        },
        related: 'agreego',
        featured: false
      }
    ],
    // IDs des projets à afficher sur la page d'accueil
    featuredProjectIds: ['intralab', 'agreego']
  }),

  getters: {
    getProjectById: (state) => (id) => {
      return state.projects.find(project => project.id === id)
    },
    getFeaturedProjects: (state) => {
      return state.projects.filter(project => state.featuredProjectIds.includes(project.id))
    },
    getAllProjects: (state) => {
      return state.projects
    },
    // Une page détail n'existe que pour les projets dont l'étude de cas est rédigée (cover renseignée)
    hasCaseStudy: (state) => (id) => {
      return Boolean(state.projects.find(project => project.id === id)?.cover)
    }
  },

  actions: {
    setFeaturedProjects(ids) {
      // Permet de choisir quels projets afficher sur la page d'accueil
      this.featuredProjectIds = ids
    },
    addProject(project) {
      this.projects.push({
        ...project,
        featured: project.featured || false
      })
    },
    updateProject(id, updatedData) {
      const index = this.projects.findIndex(project => project.id === id)
      if (index !== -1) {
        this.projects[index] = { ...this.projects[index], ...updatedData }
      }
    },
    deleteProject(id) {
      this.projects = this.projects.filter(project => project.id !== id)
      // Supprimer également des projets en vedette si nécessaire
      this.featuredProjectIds = this.featuredProjectIds.filter(featuredId => featuredId !== id)
    }
  }
})

// stores/projectStore.js
import { defineStore } from 'pinia'

export const useProjectStore = defineStore('projects', {
  state: () => ({
    projects: [
      {
        id: 'projet-1',
        datePrincipal: '01/02',
        annee: '2024-2025',
        services: 'Interactive Design <br /> Full Development',
        description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quos quisquam omnis architecto neque minus soluta! Fuga laudantium perferendis, explicabo modi similique reprehenderit! Quae et reprehenderit quaerat facilis voluptate, dolorum pariatur!',
        titre: 'Mouvements & Harmonie',
        imageUrl: '/assets/img/projects/MouvementsEtHarmonie.png',
        featured: true
      },
      {
        id: 'projet-2',
        datePrincipal: '02/02',
        annee: '2025',
        services: 'Interactive Design <br /> Full Development',
        description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quos quisquam omnis architecto neque minus soluta! Fuga laudantium perferendis, explicabo modi similique reprehenderit! Quae et reprehenderit quaerat facilis voluptate, dolorum pariatur!',
        titre: 'So\'Deco',
        imageUrl: '/assets/img/projects/MouvementsEtHarmonie.png',
        featured: true
      },
      {
        id: 'projet-3',
        datePrincipal: '01/05',
        annee: '2024',
        services: 'UI/UX Design <br /> Backend Development',
        description: 'Une application web innovante pour la gestion de projets collaboratifs, permettant aux équipes de travailler efficacement ensemble, de partager des idées et de suivre l\'avancement des tâches en temps réel.',
        titre: 'CollabSphere',
        imageUrl: '/assets/img/projects/MouvementsEtHarmonie.png',
        featured: false
      },
      {
        id: 'projet-4',
        datePrincipal: '02/05',
        annee: '2023-2024',
        services: 'E-commerce <br /> API Integration',
        description: 'Plateforme e-commerce complète avec gestion des stocks, paiements sécurisés et interface administrateur intuitive, offrant une expérience d\'achat fluide et responsive sur tous les appareils.',
        titre: 'E-Shop Premium',
        imageUrl: '/assets/img/projects/MouvementsEtHarmonie.png',
        featured: false
      },
      {
        id: 'projet-5',
        datePrincipal: '03/05',
        annee: '2023',
        services: 'Mobile App <br /> Cross-platform Development',
        description: 'Application mobile de fitness personnalisée qui adapte les programmes d\'entraînement en fonction des objectifs et des progrès de l\'utilisateur, avec suivi des statistiques et conseils nutritionnels.',
        titre: 'FitTrack Pro',
        imageUrl: '/assets/img/projects/MouvementsEtHarmonie.png',
        featured: false
      }
    ],
    selectedProjectId: null,
    // IDs des projets à afficher sur la page d'accueil
    featuredProjectIds: ['projet-1', 'projet-2']
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
    getSelectedProject: (state) => {
      return state.projects.find(project => project.id === state.selectedProjectId)
    }
  },

  actions: {
    selectProject(id) {
      this.selectedProjectId = id
    },
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
      if (this.selectedProjectId === id) {
        this.selectedProjectId = null
      }
      // Supprimer également des projets en vedette si nécessaire
      this.featuredProjectIds = this.featuredProjectIds.filter(featuredId => featuredId !== id)
    }
  }
})
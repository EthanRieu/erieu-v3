<template>
  <div class="flex flex-col my-8 md:items-center lg:flex-row justify-between project-card">
    <div class="flex flex-col xl:w-1/2 justify-between">
      <div class="flex flex-row justify-between xl:mr-4 text-right">
        <div class="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-semibold secondary-color project-date">{{
          datePrincipal }}</div>
        <div class="flex flex-col project-meta">
          <div class="text-sm sm:text-lg secondary-color font-semibold">
            {{ annee }}
          </div>
          <div class="text-sm sm:text-lg font-medium" v-html="services"></div>
        </div>
      </div>
      <div class="mt-8 text-sm sm:text-lg lg:w-100 xl:w-128 font-medium project-description">
        {{ description }}
      </div>
      <div
        class="mt-8 text-2xl xl:text-4xl font-semibold secondary-color smooth-underline-xl cursor-pointer w-fit project-title"
        @click="onTitleClick">
        {{ titre }}
      </div>
    </div>
    <div class="mt-8 md:w-2/3 lg:w-1/2">
      <div class="w-full flex justify-center mb-8 xl:mb-0 project-image">
        <div class="mt-8 bg-slate-300 w-full h-64 sm:h-72 md:h-80 rounded-lg" v-if="!imageUrl"></div>
        <img v-else :src="imageUrl"
          class="w-full sm:w-4/5 md:w-3/4 xl:w-full max-w-md h-48 sm:h-56 md:h-64 rounded-lg object-cover"
          :alt="titre" />
      </div>
    </div>
  </div>
</template>

<script>
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default {
  name: 'SelectedProject',
  props: {
    id: {
      type: String,
      required: true
    },
    // Date principale affichée en grand (ex: "01/02")
    datePrincipal: {
      type: String,
      default: '01/02'
    },
    // Année du projet
    annee: {
      type: String,
      default: '2024'
    },
    // Services fournis (peut contenir du HTML pour le saut de ligne)
    services: {
      type: String,
      default: 'Interactive Design <br /> Full Development'
    },
    // Description du projet
    description: {
      type: String,
      default: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quos quisquam omnis architecto neque minus soluta! Fuga laudantium perferendis, explicabo modi similique reprehenderit! Quae et reprehenderit quaerat facilis voluptate, dolorum pariatur!'
    },
    // Titre du projet
    titre: {
      type: String,
      default: 'Mouvements & Harmonie'
    },
    // URL de l'image (optionnelle)
    imageUrl: {
      type: String,
      default: ''
    }
  },
  mounted() {
    // S'assurer que nous sommes dans le navigateur et que GSAP est disponible
    if (process.client && typeof gsap !== 'undefined' && gsap.registerPlugin) {
      // S'assurer que ScrollTrigger est enregistré
      gsap.registerPlugin(ScrollTrigger);
      
      // Utiliser $nextTick pour s'assurer que le DOM est prêt
      this.$nextTick(() => {
        // Pré-cacher les éléments
        this.preHideElements();
        
        // Nettoyer d'abord les animations existantes
        this.cleanupAnimations();
        
        // Puis initialiser
        this.initAnimations();
      });
    }
  },
  
  // Nouvelle méthode pour pré-cacher les éléments
  preHideElements() {
    if (!process.client) return;
    
    const card = this.$el;
    if (!card) return;
    
    // Sélectionner les éléments à animer
    const date = card.querySelector('.project-date');
    const meta = card.querySelector('.project-meta');
    const description = card.querySelector('.project-description');
    const title = card.querySelector('.project-title');
    const image = card.querySelector('.project-image');
    
    // Cacher tous les éléments dès le début
    if (date) gsap.set(date, { y: 30, opacity: 0 });
    if (meta) gsap.set(meta, { y: 30, opacity: 0 });
    if (description) gsap.set(description, { y: 20, opacity: 0 });
    if (title) gsap.set(title, { y: 20, opacity: 0 });
    if (image) gsap.set(image, { scale: 0.95, opacity: 0 });
  },
  data() {
    return {
      // Stocker les instances ScrollTrigger pour le nettoyage
      scrollTriggerInstances: []
    };
  },
  methods: {
    onTitleClick() {
      this.$emit('project-click', this.id);
    },
    
    initAnimations() {
      if (!process.client) return;
      
      // Nettoyer les animations existantes
      this.cleanupAnimations();
      
      const card = this.$el;
      if (!card) return;

      // Animation des parties du projet en utilisant onEnter pour plus d'efficacité
      this.animateProjectParts(card);

      // Animation au survol du titre
      this.setupTitleHoverEffect();
    },
    
    cleanupAnimations() {
      // Tuer toutes les instances ScrollTrigger
      if (this.scrollTriggerInstances && this.scrollTriggerInstances.length) {
        this.scrollTriggerInstances.forEach(instance => {
          if (instance && instance.kill) {
            instance.kill();
          }
        });
        
        this.scrollTriggerInstances = [];
      }
    },
    
    animateProjectParts(card) {
      // Sélectionner les éléments à animer
      const date = card.querySelector('.project-date');
      const meta = card.querySelector('.project-meta');
      const description = card.querySelector('.project-description');
      const title = card.querySelector('.project-title');
      const image = card.querySelector('.project-image');
      
      // Vérifier que tous les éléments existent
      if (!date || !meta || !description || !title || !image) return;
      
      // Créer un ScrollTrigger qui animera les éléments quand la carte devient visible
      const instance = ScrollTrigger.create({
        trigger: card,
        start: "top 85%",
        onEnter: () => {
          // Animation en séquence avec délais
          gsap.fromTo(date, 
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
          );
          
          gsap.fromTo(meta,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.1 }
          );
          
          gsap.fromTo(description,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.2 }
          );
          
          gsap.fromTo(title,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.3 }
          );
          
          gsap.fromTo(image,
            { scale: 0.95, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.2)", delay: 0.4 }
          );
        },
        once: true
      });
      
      // Stocker l'instance pour nettoyage
      this.scrollTriggerInstances.push(instance);
    },
    
    setupTitleHoverEffect() {
      if (!process.client) return;
      
      const title = this.$el.querySelector('.project-title');
      if (!title) return;

      // Effet de survol en utilisant un eventListener
      title.addEventListener('mouseenter', () => {
        gsap.to(title, {
          scale: 1.05,
          x: 10,
          duration: 0.3,
          ease: "power1.out"
        });
      });

      title.addEventListener('mouseleave', () => {
        gsap.to(title, {
          scale: 1,
          x: 0,
          duration: 0.3,
          ease: "power1.out"
        });
      });
    }
  },
  beforeDestroy() {
    // Nettoyer les animations et événements
    this.cleanupAnimations();
  }
}
</script>

<style scoped>
.secondary-color {
  color: #2F4A4F;
}

.smooth-underline-xl {
  position: relative;
  display: inline-block;
}

.smooth-underline-xl::after {
  content: '';
  position: absolute;
  width: 0;
  height: 3px;
  bottom: 0;
  left: 0;
  background-color: #2F4A4F;
  transition: width 0.3s ease;
}

.smooth-underline-xl:hover::after {
  width: 100%;
}

.project-card {
  transition: transform 0.3s ease;
}

/* Animation subtile au survol de la carte complète */
.project-card:hover .project-image {
  transform: translateY(-5px);
  transition: transform 0.5s ease;
}

.project-image {
  transition: transform 0.5s ease;
}
</style>
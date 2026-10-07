<template>
  <article class="flex flex-col my-8 md:items-center lg:flex-row justify-between project-card">
    <div class="flex flex-col xl:w-1/2 justify-between">
      <div class="flex flex-row justify-between xl:mr-4 text-right">
        <div class="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-semibold secondary-color project-date">
          {{ datePrincipal }}
        </div>
        <div class="flex flex-col items-end project-meta">
          <ProjectCategoryBadge :category="category" class="mb-2" />
          <div class="text-sm sm:text-lg secondary-color font-semibold">
            {{ annee }}
          </div>
          <div class="primary-color text-sm sm:text-lg font-medium">
            <span v-for="(service, index) in services" :key="index" class="block">{{ service }}</span>
          </div>
        </div>
      </div>
      <p class="primary-color mt-8 text-sm sm:text-lg lg:w-100 xl:w-128 font-medium project-description">
        {{ description }}
      </p>
      <h3 class="mt-8 text-2xl xl:text-4xl font-semibold secondary-color w-fit project-title">
        <button type="button" class="smooth-underline-xl cursor-pointer text-left" @click="emit('project-click', id)">
          {{ titre }}
        </button>
      </h3>
    </div>
    <div class="mt-8 md:w-2/3 lg:w-1/2">
      <div class="w-full flex justify-center mb-8 xl:mb-0 project-image">
        <div v-if="!imageUrl" class="mt-8 bg-slate-300 w-full h-64 sm:h-72 md:h-80 rounded-lg" aria-hidden="true"></div>
        <img v-else :src="imageUrl" :srcset="imageSrcset || undefined"
          :sizes="imageSrcset ? '(min-width: 1280px) 448px, (min-width: 768px) 60vw, 100vw' : undefined"
          :width="imageWidth" :height="imageHeight" loading="lazy" decoding="async"
          class="w-full sm:w-4/5 md:w-3/4 xl:w-full max-w-md h-48 sm:h-56 md:h-64 rounded-lg object-cover"
          :alt="titre" />
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

/**
 * Carte projet purement présentationnelle. Les textes (titre, services, description) viennent des
 * fichiers de locale (projects.<id>.*), les données non textuelles du store.
 * L'animation d'apparition est gérée par le wrapper reveal-project-N du parent (useRevealAnimations).
 */
const props = defineProps({
  id: { type: String, required: true },
  // Date principale affichée en grand (ex: "01/02")
  datePrincipal: { type: String, default: '01/02' },
  // Année du projet
  annee: { type: String, default: '2024' },
  // Cadre de réalisation ('pro' | 'school' | 'personal'), affiché en badge
  category: { type: String, default: null },
  // URL de l'image (optionnelle) et dimensions intrinsèques (évite le décalage de mise en page)
  imageUrl: { type: String, default: '' },
  // Variantes responsives optionnelles ("... 600w, ... 1200w")
  imageSrcset: { type: String, default: '' },
  imageWidth: { type: Number, default: 1200 },
  imageHeight: { type: Number, default: 686 }
})

const emit = defineEmits(['project-click'])

const { t } = useI18n()
const list = useMessageList()

const titre = computed(() => t(`projects.${props.id}.title`))
const description = computed(() => t(`projects.${props.id}.description`))
const services = computed(() => list(`projects.${props.id}.services`))
</script>

<style scoped>
.project-card {
  transition: transform 0.3s ease;
}

/* Animation subtile au survol de la carte complète */
.project-card:hover .project-image {
  transform: translateY(-5px);
}

.project-image {
  transition: transform 0.5s ease;
}

@media (prefers-reduced-motion: reduce) {
  .project-card:hover .project-image {
    transform: none;
  }
}
</style>

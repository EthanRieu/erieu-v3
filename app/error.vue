<template>
  <div class="min-h-screen bg-site-bg">
    <!-- Header + héros remplissent au moins l'écran : le footer n'apparaît qu'au scroll
         (svh : hauteur stable sur mobile, barre d'adresse comprise) -->
    <div class="min-h-svh flex flex-col">
      <Header />
      <div class="site-container flex-1 flex items-center pt-8 sm:pt-16">
        <!-- Héros : titre + texte à gauche, scène à droite (lg) ; titre, scène puis texte sur mobile.
             h1 en text-section (comme /projects) pour que la scène reste au-dessus de la ligne de flottaison -->
        <main class="w-full mb-16 md:mb-24 grid grid-cols-1 gap-x-12 gap-y-8 lg:gap-y-10 lg:items-center"
          :class="{ 'lg:grid-cols-2': isNotFound }">
          <div class="lg:self-end">
            <p class="secondary-color font-semibold text-base sm:text-lg mb-6 break-all reveal-text">
              {{ $t('notFound.eyebrow', { code: statusCode }) }}
              <span v-if="isNotFound" class="link-color">· {{ $t('notFound.path', { path: route.path }) }}</span>
            </p>
            <h1 class="secondary-color text-section text-balance reveal-title">
              {{ isNotFound ? $t('notFound.title') : $t('notFound.error.title') }}
            </h1>
          </div>

          <!-- Le bureau de la home, abandonné (plus grand que sur la home) -->
          <div v-if="isNotFound"
            class="w-full h-96 sm:h-[28rem] lg:h-[40rem] lg:col-start-2 lg:row-start-1 lg:row-span-2 reveal-element">
            <NotFoundScene />
          </div>

          <div class="space-y-6 sm:space-y-8 lg:self-start">
            <p class="primary-color text-lead reveal-text-staggered">
              {{ isNotFound ? $t('notFound.lead') : $t('notFound.error.lead') }}
            </p>
            <p v-if="isNotFound" class="primary-color text-base sm:text-lg md:text-xl reveal-text-staggered">
              {{ $t('notFound.body') }}
            </p>
            <div class="flex flex-wrap items-baseline gap-x-12 gap-y-6 pt-4">
              <a :href="homePath" class="secondary-color text-subtitle smooth-underline-xl w-fit reveal-cta"
                @click.prevent="leave(homePath)">
                <span aria-hidden="true">←</span> {{ $t('notFound.home') }}
              </a>
              <a :href="contactPath" class="primary-color font-semibold text-lg smooth-underline w-fit reveal-cta"
                @click.prevent="leave(contactPath)">
                {{ $t('notFound.contact') }} <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { useRevealAnimations } from '~/composables/useRevealAnimations'

/**
 * Page d'erreur (Nuxt remplace app.vue par ce composant) : 404 avec scène 3D et texte perso,
 * message générique pour les autres codes. Pas de redirection forcée : le visiteur repart par les liens.
 * Les liens passent par clearError pour sortir de l'état d'erreur (une simple navigation le garderait).
 */
const props = defineProps({
  error: { type: Object, required: true }
})

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const statusCode = computed(() => props.error?.statusCode || 500)
const isNotFound = computed(() => statusCode.value === 404)

const homePath = computed(() => localePath('/'))
const contactPath = computed(() => localePath('/contact'))
const leave = (path) => clearError({ redirect: path })

// app.vue n'est pas rendu en cas d'erreur : <html lang> et alternates sont repris ici
useHead(useLocaleHead())
useSeoMeta({
  title: () => (isNotFound.value ? t('notFound.meta.title') : t('notFound.meta.errorTitle')),
  robots: 'noindex'
})

useRevealAnimations()
</script>

<template>
  <section class="my-16 md:my-24" :class="{ 'lg:grid lg:grid-cols-2 lg:gap-16': compact }"
    :aria-labelledby="headingId">
    <h2 :id="headingId" class="secondary-color text-section text-balance reveal-title"
      :class="{ 'lg:text-display': !compact }">
      {{ heading }}
    </h2>
    <div class="mt-8 md:mt-12 grid grid-cols-1 gap-6"
      :class="compact ? 'lg:mt-0 lg:gap-8 lg:content-start' : 'lg:grid-cols-2 lg:gap-16 lg:items-start'">
      <a :href="`mailto:${contactEmail}`"
        class="secondary-color text-subtitle smooth-underline-xl break-all w-fit reveal-cta">
        {{ contactEmail }}
      </a>
      <div class="flex flex-col items-start gap-4">
        <p class="primary-color font-bold reveal-cta">{{ $t('cta.availability') }}</p>
        <NuxtLink :to="localePath('/contact')" class="primary-color font-semibold text-lg smooth-underline reveal-cta">
          {{ $t('cta.form') }} <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * Appel à l'action de fin de page, sur toutes les pages sauf Contact.
 * Par défaut (home) : titre géant pleine largeur, puis e-mail à gauche, disponibilité + lien vers le formulaire à droite.
 * compact (À propos, études de cas) : titre de section à gauche, e-mail, disponibilité et lien empilés à droite.
 */
const props = defineProps({
  // Titre personnalisé (sinon cta.title)
  title: { type: String, default: '' },
  compact: { type: Boolean, default: false }
})

const { t } = useI18n()
const contactEmail = 'contact@erieu.fr'
const localePath = useLocalePath()
const headingId = useId()

// Typographie française : espace insécable avant ! ? : ; pour que la ponctuation ne passe jamais seule à la ligne
const heading = computed(() => (props.title || t('cta.title')).replace(/ ([!?:;])/g, ' $1'))
</script>

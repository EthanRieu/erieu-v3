<template>
  <section class="my-16 md:my-24 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 lg:items-end"
    :aria-labelledby="headingId">
    <h2 :id="headingId" class="secondary-color text-section reveal-title">
      {{ title || $t('cta.title') }}
    </h2>
    <div class="flex flex-col items-start gap-6 lg:pb-2">
      <a :href="`mailto:${contactEmail}`"
        class="secondary-color text-subtitle smooth-underline-xl break-all reveal-cta">
        {{ contactEmail }}
      </a>
      <p class="primary-color font-bold reveal-cta">{{ $t('cta.availability') }}</p>
      <NuxtLink :to="localePath('/contact')" class="primary-color font-semibold text-lg smooth-underline reveal-cta">
        {{ $t('cta.form') }} <span aria-hidden="true">→</span>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup>
/**
 * Appel à l'action de fin de page, identique sur toutes les pages (sauf Contact) :
 * titre de section à gauche, e-mail + disponibilité + lien vers le formulaire à droite.
 */
defineProps({
  // Titre personnalisé (sinon cta.title)
  title: { type: String, default: '' }
})

const contactEmail = 'contact@erieu.fr'
const localePath = useLocalePath()
const headingId = useId()
</script>

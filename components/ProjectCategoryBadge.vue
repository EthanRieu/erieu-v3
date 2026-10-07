<template>
  <span v-if="category"
    class="inline-flex items-center rounded-full border-2 border-site-secondary px-3 py-0.5 text-xs sm:text-sm font-bold tracking-widest uppercase secondary-color"
    :title="$t(`projects.categoryHint.${category}`)">
    {{ $t(`projects.categories.${category}`) }}
    <span class="sr-only">— {{ $t(`projects.categoryHint.${category}`) }}</span>
  </span>
</template>

<script setup>
/**
 * Badge du cadre de réalisation d'un projet : PRO, SCOLAIRE ou PERSO (libellés dans projects.categories.*).
 * Rien n'est rendu si la catégorie n'est pas renseignée dans le store.
 */
defineProps({
  category: {
    type: String,
    default: null,
    validator: (value) => value === null || ['pro', 'school', 'personal'].includes(value)
  }
})
</script>

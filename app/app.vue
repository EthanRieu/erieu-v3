<template>
  <div class="min-h-screen bg-site-bg">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// <html lang>, alternates hreflang et canonical gérés par @nuxtjs/i18n
const head = useLocaleHead()
useHead(head)
</script>

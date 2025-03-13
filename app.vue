<template>
  <div :class="themeClass" class="min-h-screen">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useTheme } from '~/utils/useTheme';

const { isDarkMode, themeClass, toggleTheme } = useTheme();
</script>
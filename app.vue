<template>
  <div :class="themeClass" :style="themeStyles" class="min-h-screen">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useTheme } from '~/utils/useTheme';

const { isDarkMode, themeClass, themeStyles, toggleTheme } = useTheme();
</script>
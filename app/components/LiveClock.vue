<template>
    <div class="text-xl font-medium clock-color">
        {{ $t('clock.location') }} | <time>{{ time }}</time>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    timezone: {
        type: String,
        default: 'Europe/Paris'
    }
})

const { locale } = useI18n()

// Rendu vide côté serveur, rempli au montage : évite un mismatch d'hydratation sur l'heure.
const time = ref('')
let timer = null

const formatter = computed(() => new Intl.DateTimeFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    timeZone: props.timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
}))

const updateTime = () => {
    time.value = formatter.value.format(new Date())
}

onMounted(() => {
    updateTime()
    timer = setInterval(updateTime, 1000)
})

// beforeDestroy (Vue 2) n'était jamais appelé en Vue 3 : le setInterval fuyait à chaque changement de page.
onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
})
</script>

<style scoped>
.clock-color {
    color: var(--header-link-color);
}
</style>

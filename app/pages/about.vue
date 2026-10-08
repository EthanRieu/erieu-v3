<template>
    <Header />
    <div class="flex flex-col items-center">
        <div class="site-container pt-8 sm:pt-16">
            <main>
                <!-- Hero -->
                <h1
                    class="secondary-color text-display reveal-title">
                    {{ $t('about.title') }}
                </h1>
                <p
                    class="primary-color text-lead md:w-4/5 my-8 sm:my-12 lg:my-16 reveal-text">
                    {{ $t('about.intro') }}
                </p>
                <div class="w-full h-[2px] divider reveal-divider"></div>

                <!-- Bio -->
                <section class="my-16 md:my-24 flex flex-col lg:flex-row lg:space-x-16" aria-labelledby="about-bio">
                    <h2 id="about-bio"
                        class="secondary-color text-subtitle lg:w-1/3 mb-8 lg:mb-0 reveal-text">
                        {{ $t('about.bioTitle') }}
                    </h2>
                    <div class="space-y-8 primary-color text-base sm:text-lg md:text-xl xl:text-2xl lg:w-2/3">
                        <p v-for="(paragraph, index) in bio" :key="index" class="reveal-text-staggered">
                            {{ paragraph }}
                        </p>
                    </div>
                </section>
                <div class="w-full h-[2px] divider reveal-divider"></div>

                <!-- Parcours -->
                <section class="my-16 md:my-24" aria-labelledby="about-journey">
                    <h2 id="about-journey"
                        class="secondary-color text-section mb-8 md:mb-12 reveal-title">
                        {{ $t('about.journeyTitle') }}
                    </h2>
                    <ol class="flex flex-col">
                        <li v-for="(step, index) in journey" :key="index"
                            class="reveal-tool grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-2 md:gap-8 py-8 border-b-2 border-site-secondary/30 last:border-b-0">
                            <div class="secondary-color text-xl md:text-2xl font-semibold">{{ step.period }}</div>
                            <div>
                                <h3 class="primary-color text-subtitle">{{ step.title }}</h3>
                                <p class="secondary-color font-medium mt-1">{{ step.place }}</p>
                                <p class="primary-color mt-4 text-base md:text-lg">{{ step.description }}</p>
                            </div>
                        </li>
                    </ol>
                </section>
                <div class="w-full h-[2px] divider reveal-divider"></div>

                <!-- Valeurs -->
                <section class="my-16 md:my-24" aria-labelledby="about-values">
                    <h2 id="about-values"
                        class="secondary-color text-section mb-8 md:mb-12 reveal-title">
                        {{ $t('about.valuesTitle') }}
                    </h2>
                    <div class="primary-color grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        <div v-for="(value, index) in values" :key="index" class="reveal-tool">
                            <h3 class="text-subtitle mb-4">{{ value.title }}</h3>
                            <p class="text-base md:text-lg">{{ value.description }}</p>
                        </div>
                    </div>
                </section>
                <div class="w-full h-[2px] divider reveal-divider"></div>

                <!-- Boîte à outils -->
                <section class="my-16 md:my-24" aria-labelledby="about-stack">
                    <h2 id="about-stack"
                        class="secondary-color text-section mb-8 md:mb-12 reveal-title">
                        {{ $t('about.stackTitle') }}
                    </h2>
                    <!-- Boîte à outils 3D interactive (Three.js + modèle Blender) : un jeton par outil de la liste ci-dessous -->
                    <div class="w-full h-80 sm:h-96 lg:h-[30rem] mb-12 md:mb-16 reveal-element">
                        <ToolboxScene :tools="toolNames" />
                    </div>
                    <div class="primary-color grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div v-for="(group, index) in stack" :key="index" class="reveal-tool">
                            <h3 class="secondary-color text-subtitle mb-3">{{ group.category }}</h3>
                            <p class="text-base md:text-lg">{{ group.items }}</p>
                        </div>
                    </div>
                </section>

                <div class="w-full h-[2px] divider reveal-divider"></div>

                <ContactCta compact />
            </main>
        </div>

        <Footer />
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRevealAnimations } from '~/composables/useRevealAnimations'
import { useMessageList } from '~/composables/useMessageList'

const { t } = useI18n()
const list = useMessageList()

const bio = computed(() => list('about.bio'))
const journey = computed(() => list('about.journey'))
const values = computed(() => list('about.values'))
const stack = computed(() => list('about.stack'))
// Outils un par un (« Vercel / Netlify » compte pour deux), dans l'ordre des jetons de ToolboxScene
const toolNames = computed(() => stack.value.flatMap((group) => group.items.split(/,\s*|\s*\/\s*/)))

useSeoMeta({
    title: () => t('meta.about.title'),
    description: () => t('meta.about.description'),
    ogTitle: () => t('meta.about.title'),
    ogDescription: () => t('meta.about.description')
})

// Même système de reveal que la home (classes reveal-*), nettoyé automatiquement au démontage
useRevealAnimations()
</script>

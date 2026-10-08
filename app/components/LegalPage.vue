<template>
    <Header />
    <div class="flex flex-col items-center">
        <div class="site-container pt-8 sm:pt-16">
            <main>
                <!-- Hero -->
                <h1 class="secondary-color text-display text-balance reveal-title">
                    {{ $t(`${page}.title`) }}
                </h1>
                <p class="primary-color text-lead md:w-4/5 my-8 sm:my-12 lg:my-16 reveal-text">
                    {{ $t(`${page}.intro`) }}
                </p>
                <p class="secondary-color font-semibold text-base sm:text-lg mb-16 reveal-text">
                    {{ $t('legalPages.updated', { date: updatedOn }) }}
                </p>

                <!-- Sections : même structure que « Contexte » des études de cas (titre 1/3, texte 2/3) -->
                <template v-for="(section, index) in sections" :key="section.title">
                    <div class="w-full h-[2px] divider reveal-divider"></div>
                    <section class="my-16 md:my-24 flex flex-col lg:flex-row lg:space-x-16"
                        :aria-labelledby="`${page}-section-${index}`">
                        <h2 :id="`${page}-section-${index}`"
                            class="secondary-color text-subtitle lg:w-1/3 mb-8 lg:mb-0 reveal-text">
                            {{ section.title }}
                        </h2>
                        <div class="space-y-6 primary-color text-base sm:text-lg md:text-xl lg:w-2/3">
                            <p v-for="(paragraph, pIndex) in section.body" :key="pIndex" class="reveal-text-staggered">
                                {{ paragraph }}
                            </p>
                            <!-- Les adresses e-mail et liens restent hors des messages i18n (« @ » y est réservé) -->
                            <a v-if="section.email" :href="`mailto:${contactEmail}`"
                                class="inline-block secondary-color font-semibold smooth-underline reveal-text">
                                {{ contactEmail }}
                            </a>
                            <ul v-if="section.links?.length" class="flex flex-col gap-3 font-semibold reveal-text">
                                <li v-for="link in section.links" :key="link.label">
                                    <NuxtLink v-if="link.to" :to="localePath(link.to)"
                                        class="secondary-color smooth-underline">
                                        {{ link.label }} <span aria-hidden="true">→</span>
                                    </NuxtLink>
                                    <a v-else :href="link.href" target="_blank" rel="noopener noreferrer"
                                        class="secondary-color smooth-underline">
                                        {{ link.label }} <span aria-hidden="true">↗</span>
                                        <span class="sr-only">{{ $t('projectPage.newTab') }}</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </section>
                </template>
            </main>
        </div>

        <Footer />
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRevealAnimations } from '~/composables/useRevealAnimations'
import { useMessageList } from '~/composables/useMessageList'

/**
 * Gabarit des pages légales (mentions légales, confidentialité).
 * Textes : <page>.title / .intro / .sections[{ title, body[], email?, links[{ label, href | to }]? }]
 * dans les fichiers de locale. Liens internes : `to` = nom de route (résolu par localePath).
 */
const props = defineProps({
    page: { type: String, required: true, validator: (value) => ['legal', 'privacy'].includes(value) }
})

// À mettre à jour à chaque modification du contenu des pages légales
const UPDATED_AT = '2026-10-08'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const list = useMessageList()
const contactEmail = 'contact@erieu.fr'

const sections = computed(() => list(`${props.page}.sections`))
const updatedOn = computed(() =>
    new Date(UPDATED_AT).toLocaleDateString(locale.value, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
)

useSeoMeta({
    title: () => t(`meta.${props.page}.title`),
    description: () => t(`meta.${props.page}.description`),
    ogTitle: () => t(`meta.${props.page}.title`),
    ogDescription: () => t(`meta.${props.page}.description`)
})

useRevealAnimations()
</script>

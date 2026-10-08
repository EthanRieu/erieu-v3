<template>
    <Header />
    <div class="flex flex-col items-center">
        <div class="site-container pt-8 sm:pt-16">
            <main>
                <NuxtLink :to="localePath('/projects')"
                    class="inline-block secondary-color font-semibold text-base sm:text-lg smooth-underline reveal-cta">
                    <span aria-hidden="true">←</span> {{ $t('projectPage.back') }}
                </NuxtLink>

                <!-- Hero -->
                <div class="flex flex-wrap items-center gap-4 mt-12 mb-6 reveal-text">
                    <ProjectCategoryBadge :category="project.category" />
                    <span class="secondary-color font-semibold text-base sm:text-lg">{{ $t(`${key}.period`) }}</span>
                </div>
                <h1
                    class="secondary-color text-display reveal-title">
                    {{ $t(`${key}.title`) }}
                </h1>
                <p
                    class="primary-color text-lead md:w-4/5 my-8 sm:my-12 lg:my-16 reveal-text">
                    {{ $t(`${key}.tagline`) }}
                </p>

                <!-- Fiche projet -->
                <dl class="primary-color grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    <div class="reveal-tool">
                        <dt class="secondary-color text-lg md:text-xl font-semibold mb-2">{{ $t('projectPage.role') }}</dt>
                        <dd class="text-base md:text-lg">{{ $t(`${key}.role`) }}</dd>
                    </div>
                    <div class="reveal-tool">
                        <dt class="secondary-color text-lg md:text-xl font-semibold mb-2">{{ $t('projectPage.period') }}</dt>
                        <dd class="text-base md:text-lg">{{ $t(`${key}.period`) }}</dd>
                    </div>
                    <div class="reveal-tool">
                        <dt class="secondary-color text-lg md:text-xl font-semibold mb-2">{{ $t('projectPage.services') }}</dt>
                        <dd v-for="service in services" :key="service" class="text-base md:text-lg">{{ service }}</dd>
                    </div>
                    <div class="reveal-tool">
                        <dt class="secondary-color text-lg md:text-xl font-semibold mb-2">{{ $t('projectPage.stack') }}</dt>
                        <dd class="text-base md:text-lg">{{ project.stack.join(' · ') }}</dd>
                    </div>
                </dl>

                <!-- Site en ligne et/ou dépôt de code -->
                <div class="flex flex-wrap gap-x-12 gap-y-4">
                    <a v-for="link in externalLinks" :key="link.href" :href="link.href" target="_blank" rel="noopener"
                        class="inline-block text-subtitle secondary-color w-fit smooth-underline-xl reveal-cta">
                        {{ $t(link.label) }} <span aria-hidden="true">↗</span>
                        <span class="sr-only">{{ $t('projectPage.newTab') }}</span>
                    </a>
                </div>

                <!-- Capture principale dans un cadre de navigateur -->
                <figure class="my-16 md:my-24 reveal-element">
                    <div class="rounded-xl overflow-hidden shadow-2xl bg-white">
                        <div class="flex items-center gap-2 px-4 py-3 bg-slate-200" aria-hidden="true">
                            <span class="w-3 h-3 rounded-full bg-slate-400"></span>
                            <span class="w-3 h-3 rounded-full bg-slate-400"></span>
                            <span class="w-3 h-3 rounded-full bg-slate-400"></span>
                            <span
                                class="ml-4 flex-1 max-w-sm truncate rounded-md bg-white px-3 py-1 text-xs sm:text-sm text-slate-600">
                                {{ displayUrl }}
                            </span>
                        </div>
                        <img :src="project.cover.src" :srcset="project.cover.srcset"
                            sizes="(min-width: 1280px) 1088px, (min-width: 640px) calc(100vw - 192px), calc(100vw - 64px)"
                            :width="project.cover.width" :height="project.cover.height" fetchpriority="high"
                            decoding="async" class="w-full h-auto block" :alt="shotAlt(project.cover.name)" />
                    </div>
                </figure>
                <div class="w-full h-[2px] divider reveal-divider"></div>

                <!-- Contexte -->
                <section class="my-16 md:my-24 flex flex-col lg:flex-row lg:space-x-16" aria-labelledby="project-context">
                    <h2 id="project-context"
                        class="secondary-color text-subtitle lg:w-1/3 mb-8 lg:mb-0 reveal-text">
                        {{ $t('projectPage.context') }}
                    </h2>
                    <div class="space-y-8 primary-color text-base sm:text-lg md:text-xl xl:text-2xl lg:w-2/3">
                        <p v-for="(paragraph, index) in context" :key="index" class="reveal-text-staggered">
                            {{ paragraph }}
                        </p>
                    </div>
                </section>
                <div class="w-full h-[2px] divider reveal-divider"></div>

                <!-- Missions -->
                <section class="my-16 md:my-24" aria-labelledby="project-missions">
                    <h2 id="project-missions"
                        class="secondary-color text-section mb-8 md:mb-12 reveal-title">
                        {{ $t('projectPage.missions') }}
                    </h2>
                    <ol class="primary-color grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        <li v-for="(mission, index) in missions" :key="mission.title" class="reveal-tool">
                            <span class="secondary-color text-lg font-semibold">{{ pad(index + 1) }}</span>
                            <h3 class="text-subtitle mt-1 mb-4">{{ mission.title }}</h3>
                            <p class="text-base md:text-lg">{{ mission.description }}</p>
                        </li>
                    </ol>
                </section>
                <div class="w-full h-[2px] divider reveal-divider"></div>

                <!-- Aperçu : pages secondaires (desktop) puis mobile -->
                <section class="my-16 md:my-24" aria-labelledby="project-screens">
                    <h2 id="project-screens"
                        class="secondary-color text-section mb-8 md:mb-12 reveal-title">
                        {{ $t('projectPage.screens') }}
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <figure v-for="shot in project.gallery" :key="shot.name" class="reveal-element">
                            <img :src="shot.src" :srcset="shot.srcset"
                                sizes="(min-width: 1280px) 528px, (min-width: 768px) calc(50vw - 128px), calc(100vw - 64px)"
                                :width="shot.width" :height="shot.height" loading="lazy" decoding="async"
                                class="w-full h-auto rounded-lg shadow-lg" :alt="shotAlt(shot.name)" />
                            <figcaption class="secondary-color text-sm sm:text-base font-medium mt-3">
                                {{ shotAlt(shot.name) }}
                            </figcaption>
                        </figure>
                    </div>

                    <h3 class="secondary-color text-subtitle mt-16 md:mt-24 mb-8 reveal-text">
                        {{ $t('projectPage.mobile') }}
                    </h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
                        <img v-for="(shot, index) in project.mobileShots" :key="shot.name" :src="shot.src"
                            :width="shot.width" :height="shot.height" loading="lazy" decoding="async"
                            class="w-full h-auto rounded-3xl shadow-lg border-4 border-site-primary reveal-element"
                            :class="{ 'hidden md:block': index === 2 }" :alt="shotAlt(shot.name)" />
                    </div>
                </section>
                <div class="w-full h-[2px] divider reveal-divider"></div>

                <!-- Points clés -->
                <section class="my-16 md:my-24" aria-labelledby="project-features">
                    <h2 id="project-features"
                        class="secondary-color text-section mb-8 md:mb-12 reveal-title">
                        {{ $t('projectPage.features') }}
                    </h2>
                    <div class="primary-color grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        <div v-for="feature in features" :key="feature.title" class="reveal-tool">
                            <h3 class="text-subtitle mb-4">{{ feature.title }}</h3>
                            <p class="text-base md:text-lg">{{ feature.description }}</p>
                        </div>
                    </div>
                </section>
                <div class="w-full h-[2px] divider reveal-divider"></div>

                <!-- Section complémentaire propre au projet (ex : AGREEGO Cloud) -->
                <template v-if="extra.length">
                    <section class="my-16 md:my-24 flex flex-col lg:flex-row lg:space-x-16"
                        aria-labelledby="project-extra">
                        <h2 id="project-extra"
                            class="secondary-color text-subtitle lg:w-1/3 mb-8 lg:mb-0 reveal-text">
                            {{ $t(`${key}.extraTitle`) }}
                        </h2>
                        <div class="space-y-8 primary-color text-base sm:text-lg md:text-xl xl:text-2xl lg:w-2/3">
                            <p v-for="(paragraph, index) in extra" :key="index" class="reveal-text-staggered">
                                {{ paragraph }}
                            </p>
                        </div>
                    </section>
                    <div class="w-full h-[2px] divider reveal-divider"></div>
                </template>

                <!-- Performance (Lighthouse) -->
                <section v-if="project.lighthouse" class="my-16 md:my-24" aria-labelledby="project-performance">
                    <h2 id="project-performance"
                        class="secondary-color text-section mb-8 md:mb-12 reveal-title">
                        {{ $t('projectPage.performance') }}
                    </h2>
                    <div v-for="device in ['mobile', 'desktop']" :key="device" class="mb-12">
                        <h3 class="secondary-color text-subtitle mb-6 reveal-text">
                            {{ $t(`projectPage.device.${device}`) }}
                        </h3>
                        <dl class="primary-color grid grid-cols-2 lg:grid-cols-4 gap-8">
                            <!-- dt avant dd (ordre HTML valide), score affiché au-dessus via flex-col-reverse -->
                            <div v-for="score in SCORE_KEYS" :key="score" class="flex flex-col-reverse reveal-tool">
                                <dt class="text-base md:text-lg font-medium mt-2">{{ $t(`projectPage.scores.${score}`) }}</dt>
                                <dd class="text-6xl md:text-7xl font-bold tracking-tighter">
                                    {{ project.lighthouse[device][score] }}
                                </dd>
                            </div>
                        </dl>
                    </div>
                    <p class="secondary-color text-sm sm:text-base font-medium reveal-text">
                        {{ $t('projectPage.performanceNote', { date: measuredOn }) }}
                    </p>
                </section>

                <!-- Projet associé -->
                <template v-if="related">
                    <div class="w-full h-[2px] divider reveal-divider"></div>
                    <!-- Même grille que ContactCta compact. Desktop : titre puis infos à gauche (calées en bas), capture à droite.
                         Mobile : titre, capture, infos. Toute la section est cliquable via le lien du nom (after:inset-0). -->
                    <section
                        class="group relative my-16 md:my-24 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-8"
                        aria-labelledby="project-related">
                        <h2 id="project-related"
                            class="secondary-color text-section text-balance lg:col-start-1 lg:row-start-1 reveal-title">
                            {{ $t('projectPage.related') }}
                        </h2>
                        <div
                            class="rounded-xl overflow-hidden shadow-lg lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start reveal-element">
                            <img :src="related.cover.src" :srcset="related.cover.srcset"
                                sizes="(min-width: 1280px) 672px, (min-width: 1024px) calc(50vw - 128px), (min-width: 640px) calc(100vw - 192px), calc(100vw - 64px)"
                                :width="related.cover.width" :height="related.cover.height" loading="lazy"
                                decoding="async"
                                class="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                                alt="" />
                        </div>
                        <!-- Pas de reveal-* sur ce bloc : le transform laissé par GSAP réduirait la zone cliquable du lien à ce bloc -->
                        <div class="lg:col-start-1 lg:row-start-2 lg:self-end">
                            <div class="flex flex-wrap items-center gap-4 reveal-text">
                                <ProjectCategoryBadge :category="related.category" />
                                <span class="secondary-color font-semibold text-base sm:text-lg">
                                    {{ $t(`projects.${related.id}.period`) }}
                                </span>
                            </div>
                            <h3 class="secondary-color text-subtitle mt-4">
                                <NuxtLink :to="localePath(`/projects/${related.id}`)"
                                    class="after:absolute after:inset-0 after:z-10 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-8 focus-visible:after:outline-current">
                                    {{ $t(`projects.${related.id}.title`) }}
                                </NuxtLink>
                            </h3>
                            <p class="primary-color text-base md:text-lg mt-2 reveal-text">
                                {{ $t(`projects.${related.id}.tagline`) }}
                            </p>
                            <span aria-hidden="true"
                                class="inline-block primary-color font-semibold text-lg mt-6 border-b-2 border-current pointer-events-none reveal-text">
                                {{ $t('projectPage.viewProject') }} →
                            </span>
                        </div>
                    </section>
                </template>
                <div class="w-full h-[2px] divider reveal-divider"></div>

                <ContactCta compact />
            </main>
        </div>

        <Footer />
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProjectStore } from '~/stores/projectStore'
import { useRevealAnimations } from '~/composables/useRevealAnimations'
import { useMessageList } from '~/composables/useMessageList'

/**
 * Étude de cas d'un projet (/projects/<id>). Données non textuelles : store ; textes : projects.<id>.*
 * dans les fichiers de locale ; libellés de la page : projectPage.*.
 * Seuls les projets dont l'étude de cas est rédigée (cover renseignée) ont une page : sinon 404.
 */
const SCORE_KEYS = ['performance', 'accessibility', 'bestPractices', 'seo']

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const list = useMessageList()
const projectStore = useProjectStore()
const siteUrl = useRuntimeConfig().public.siteUrl

const project = computed(() => projectStore.getProjectById(route.params.slug))
if (!projectStore.hasCaseStudy(route.params.slug)) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
}

const key = computed(() => `projects.${project.value.id}`)
const related = computed(() => (project.value.related ? projectStore.getProjectById(project.value.related) : null))

const services = computed(() => list(`${key.value}.services`))
const context = computed(() => list(`${key.value}.context`))
const missions = computed(() => list(`${key.value}.missions`))
const features = computed(() => list(`${key.value}.features`))
const extra = computed(() => list(`${key.value}.extra`))

const pad = (num) => String(num).padStart(2, '0')
const shotAlt = (name) => t(`${key.value}.shots.${name}`)
// Barre d'adresse du cadre navigateur : domaine du site, ou nom du projet s'il n'est pas en ligne
const displayUrl = computed(() =>
    project.value.url ? project.value.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : t(`${key.value}.title`)
)
const externalLinks = computed(() => [
    project.value.url && { href: project.value.url, label: 'projectPage.visit' },
    project.value.repo && { href: project.value.repo, label: 'projectPage.code' }
].filter(Boolean))
const measuredOn = computed(() =>
    new Date(project.value.lighthouse.date).toLocaleDateString(locale.value, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
)

const metaTitle = () => t('projectPage.metaTitle', { title: t(`${key.value}.title`) })
useSeoMeta({
    title: metaTitle,
    description: () => t(`${key.value}.description`),
    ogTitle: metaTitle,
    ogDescription: () => t(`${key.value}.description`),
    ogImage: () => `${siteUrl}${project.value.cover.src}`,
    ogImageWidth: () => project.value.cover.width,
    ogImageHeight: () => project.value.cover.height,
    twitterCard: 'summary_large_image'
})

// Même système de reveal que la home et la page À propos (classes reveal-*)
useRevealAnimations()
</script>

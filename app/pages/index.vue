<template>
    <Header />
    <div class="flex flex-col items-center">
        <!-- Le logotype fait office de titre principal de la page (nom accessible : aria-label du SVG) -->
        <h1 class="w-full max-w-7xl">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1500 500"
                shape-rendering="geometricPrecision" text-rendering="geometricPrecision" role="img"
                :aria-label="$t('home.logoAlt')">

                <!-- ERIEU Text -->
                <text dx="0" dy="0" font-family="'Schibsted Grotesk', sans-serif" font-size="75" font-weight="800"
                    transform="matrix(5 0 0 5 109.262384 384.859102)" class="theme-text" stroke-width="0">
                    <tspan y="0" font-weight="800" stroke-width="0">ERIEU</tspan>
                </text>

                <!-- TM Text -->
                <text dx="0" dy="0" font-family="'Schibsted Grotesk', sans-serif" font-size="75" font-weight="800"
                    transform="translate(1266.074934 142.194716)" class="theme-text" stroke-width="0">
                    <tspan y="0" font-weight="800" stroke-width="0">TM</tspan>
                </text>
            </svg>
        </h1>
        <div class="line-container relative w-full">
            <svg class="svg-container h-auto" viewBox="0 0 1839 887" preserveAspectRatio="xMidYMid meet" fill="none"
                xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path ref="path" :d="SIGNATURE_PATH" stroke="url(#paint0_linear_14_78)" stroke-width="30"
                    stroke-linecap="round" class="invisible-path" />
                <defs>
                    <linearGradient id="paint0_linear_14_78" x1="1823.5" y1="14.9984" x2="123.498" y2="314.999"
                        gradientUnits="userSpaceOnUse">
                        <stop id="svg-gradient-start" />
                        <stop id="svg-gradient-end" offset="1" />
                    </linearGradient>
                </defs>
            </svg>

            <!-- Presentation Section -->
            <div class="site-container py-16 sm:py-24 space-y-16">
                <p class="text-lead md:w-4/5 primary-color reveal-text">
                    {{ $t('home.tagline') }}
                </p>

                <!-- Conteneur flexible -->
                <div class="flex flex-col space-y-8 md:space-y-12 xl:flex-row xl:space-y-0 xl:space-x-16 items-center">
                    <!-- Mini bureau 3D interactif (Three.js), sans cadre : il flotte sur le fond de page -->
                    <div class="w-full flex justify-center mb-8 xl:mb-0 reveal-element">
                        <div class="w-full sm:w-4/5 md:w-3/4 xl:w-full max-w-lg h-72 sm:h-80 xl:h-96">
                            <DeskScene />
                        </div>
                    </div>

                    <!-- Contenu texte -->
                    <div
                        class="space-y-6 primary-color sm:space-y-8 md:space-y-10 text-base sm:text-lg md:text-xl xl:text-2xl">
                        <p v-for="(paragraph, index) in intro" :key="index" class="reveal-text-staggered"
                            :class="{ 'font-semibold': index === 0 }">
                            {{ paragraph }}
                        </p>
                        <NuxtLink :to="localePath('/about')"
                            class="inline-block font-semibold smooth-underline cursor-pointer w-fit reveal-text-staggered reveal-cta">
                            {{ $t('home.learnMore') }}
                        </NuxtLink>
                    </div>
                </div>
            </div>

            <!-- Selected projects section -->
            <div class="site-container pt-16">
                <h2 class="secondary-color text-section mb-12 md:mb-16 reveal-title">
                    {{ $t('home.selectedWorks.line1') }} {{ $t('home.selectedWorks.line2') }}
                </h2>
                <div class="w-full h-[2px] divider my-8 reveal-divider"></div>

                <!-- Projects Components -->
                <div v-for="(project, index) in featuredProjects" :key="project.id" :class="'reveal-project-' + index">
                    <SelectedProject :id="project.id" :date-principal="projectNumber(index)" :annee="project.annee"
                        :category="project.category"
                        :image-url="project.imageUrl" :image-srcset="project.imageSrcset"
                        :image-width="project.imageWidth" :image-height="project.imageHeight"
                        @project-click="navigateToProject" />

                    <div class="w-full h-[2px] divider lg:my-8 reveal-divider"></div>
                </div>

                <div class="flex justify-end mt-12 md:mt-16">
                    <NuxtLink :to="localePath('/projects')"
                        class="inline-block secondary-color text-subtitle smooth-underline-xl reveal-cta">
                        {{ $t('home.seeAllProjects') }} <span aria-hidden="true">→</span>
                    </NuxtLink>
                </div>

                <!-- About me Section : titre pleine largeur, accroche, puis grille des outils (une phrase chacun) -->
                <section class="my-16 md:my-24 flex flex-col items-start" aria-labelledby="home-about">
                    <h2 id="home-about" class="secondary-color text-section lg:text-display reveal-title">
                        {{ $t('home.aboutTitle') }}
                    </h2>
                    <p class="primary-color text-lead lg:w-4/5 mt-6 sm:mt-10 lg:mt-12 reveal-text">
                        {{ $t('home.aboutText') }}
                    </p>

                    <h3 class="sr-only">{{ $t('home.toolsTitle') }}</h3>
                    <ul class="primary-color grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-10 w-full mt-12 md:mt-16">
                        <li v-for="tool in tools" :key="tool.name" class="reveal-tool">
                            <h4 class="text-subtitle font-semibold mb-3">{{ tool.name }}</h4>
                            <p class="text-base md:text-lg">{{ tool.description }}</p>
                        </li>
                    </ul>

                    <NuxtLink :to="localePath('/about')"
                        class="primary-color font-semibold text-lg smooth-underline mt-12 md:mt-16 reveal-cta">
                        {{ $t('home.toolsLink') }} <span aria-hidden="true">→</span>
                    </NuxtLink>
                </section>
                <div class="w-full h-[2px] divider reveal-divider"></div>

                <ContactCta :title="$t('home.contactTitle')" />
            </div>

            <Footer />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useProjectStore } from '~/stores/projectStore'
import { useRevealAnimations, prefersReducedMotion } from '~/composables/useRevealAnimations'
import { useMessageList } from '~/composables/useMessageList'

// Tracé signature (partagé avec la scène 3D)
const SIGNATURE_PATH = 'M1823.5 15C1823.5 15 1723.5 45 1623.5 115C1523.5 185 1473.5 245 1423.5 315C1373.5 385 1353.5 445 1373.5 515C1393.5 585 1443.5 615 1523.5 615C1603.5 615 1650 596 1680 526C1710 456 1693.5 385 1623.5 315C1553.5 245 1473.5 215 1373.5 215C1273.5 215 1173.5 245 1073.5 315C973.5 385 935.286 426 871 516C806.714 606 812.45 593.341 776 633C734.641 678 679.5 731.5 635.5 762C599.034 787.277 540.147 813.097 503.5 808C468.481 803.13 449.705 785.782 434 767.98C415.845 747.402 403.5 726.398 371.5 723C322.568 717.804 279.5 746.5 234.5 774.138C189.5 801.776 187.847 801.112 160 816C138.475 827.508 100.783 841.242 78 850C53.7348 859.328 39.9052 864.048 15 871.5'

// i18n
const { t } = useI18n()
const localePath = useLocalePath()
const list = useMessageList()
const intro = computed(() => list('home.intro'))
const tools = computed(() => list('home.tools'))

useSeoMeta({
    title: () => t('meta.home.title'),
    description: () => t('meta.home.description'),
    ogTitle: () => t('meta.home.title'),
    ogDescription: () => t('meta.home.description')
})

// Router & store
const router = useRouter()
const projectStore = useProjectStore()
const featuredProjects = computed(() => projectStore.getFeaturedProjects)

// Refs for DOM elements
const path = ref(null)

// Reveals (classes reveal-*) : système partagé, cleanup automatique au démontage
const { refresh } = useRevealAnimations()

let pathTween = null
let pathTrigger = null
let resizeTimeout = null

// Paramètres du ScrollTrigger du tracé selon la largeur d'écran
const pathScrollSettings = () => {
    const width = window.innerWidth
    if (width < 640) return { start: 'top 20%', end: 'top' }
    if (width < 1024) return { start: 'top 40%', end: 'top' }
    return { start: 'top 50%', end: 'top' }
}

// Numérotation "01/02" calculée à partir de la sélection affichée
const pad = (num) => String(num).padStart(2, '0')
const projectNumber = (index) => `${pad(index + 1)}/${pad(featuredProjects.value.length)}`

// Page détail si l'étude de cas existe, sinon la liste des projets
const navigateToProject = (projectId) => {
    router.push(localePath(projectStore.hasCaseStudy(projectId) ? `/projects/${projectId}` : '/projects'))
}

const setupPathAnimation = () => {
    if (!import.meta.client || !path.value) return

    const pathElement = path.value
    const pathLength = pathElement.getTotalLength()
    pathElement.classList.remove('invisible-path')

    // Sans animation pour les utilisateurs qui le demandent : tracé affiché complet
    if (prefersReducedMotion()) {
        gsap.set(pathElement, { opacity: 1 })
        return
    }

    gsap.set(pathElement, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
        opacity: 1
    })

    const width = window.innerWidth

    if (width >= 1280) {
        // Desktop : le tracé se dessine au scroll
        const settings = pathScrollSettings()
        pathTween = gsap.to(pathElement, { strokeDashoffset: 0, duration: 2, ease: 'power2.out' })
        pathTrigger = ScrollTrigger.create({
            animation: pathTween,
            trigger: '.line-container',
            start: settings.start,
            end: settings.end,
            scrub: 3,
            onRefresh: (self) => {
                if (self.progress === 0) {
                    gsap.set(pathElement, { strokeDashoffset: pathLength })
                }
            }
        })
    } else {
        // Mobile / tablette : dessin automatique (plus rapide sur mobile)
        const mobile = width < 640
        pathTween = gsap.to(pathElement, {
            strokeDashoffset: 0,
            duration: mobile ? 1.5 : 2.5,
            delay: mobile ? 0.5 : 0,
            ease: 'power2.out'
        })
    }
}

const handleResize = () => {
    if (resizeTimeout) clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
        refresh()
    }, 300)
}

// Lifecycle hooks
onMounted(() => {
    if (import.meta.client) {
        gsap.registerPlugin(ScrollTrigger)

        nextTick(() => {
            setupPathAnimation()
            window.addEventListener('resize', handleResize)
        })
    }
})

onBeforeUnmount(() => {
    if (pathTrigger) pathTrigger.kill()
    if (pathTween) pathTween.kill()
    if (resizeTimeout) clearTimeout(resizeTimeout)
    window.removeEventListener('resize', handleResize)
})
</script>
